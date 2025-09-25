
let anomolies = [];
let animationSpeed = .0008;
const anomolyCount = 6;
let maxArcSize = 300;
let minArcSize = 150;
let maxOpacity = 1;
let minOpacity = .3;
let colorRange = 30;
let canvasSize = 600;


class position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class velocity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class anomoly {
    constructor(position, direction, velocity, size, color) {
        this.position = position;
        this.direction = direction;
        this.velocity = velocity;
        this.size = size;
        this.color = color;
        this.target;
    }
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function randomPositiveOrNegative() {
    return (Math.random() < 0.5 ? -1 : 1);
}

const fastNormalize2D = (vector) => {
    let x = vector.x;
    let y = vector.y;
    const lengthSquared = x * x + y * y; // Compute squared length
    let i = new Float32Array([lengthSquared]);  // Convert to Float32 for bitwise manipulation
    let intVal = new Uint32Array(i.buffer)[0];  // Access the integer representation
    intVal = 0x5f3759df - (intVal >> 1);        // Apply magic constant and shift
    i = new Float32Array(new Uint32Array([intVal]).buffer); // Convert back to float
    const approxInvLength = i[0] * (1.5 - 0.5 * lengthSquared * i[0] * i[0]); // Newton's iteration

    const finalV = new position(x * approxInvLength, y * approxInvLength);
    return finalV;// Return normalized vector
};

const fastMagnitude2D = (vector) => {
    let x = vector.x;
    let y = vector.y;
    const lengthSquared = x * x + y * y; // Compute squared length
    let i = new Float32Array([lengthSquared]);  // Convert to Float32 for bitwise manipulation
    let intVal = new Uint32Array(i.buffer)[0];  // Access the integer representation
    intVal = 0x5f3759df - (intVal >> 1);        // Apply magic constant and shift
    i = new Float32Array(new Uint32Array([intVal]).buffer); // Convert back to float
    const approxInvLength = i[0] * (1.5 - 0.5 * lengthSquared * i[0] * i[0]); // Newton's iteration
    return 1 / approxInvLength; // Return the approximate magnitude
};

const fastMultiplyVector = (vector, scalar) => {
    // Multiply each component of the vector by the scalar
    return {
        x: vector.x * scalar,
        y: vector.y * scalar
    };
};

document.addEventListener('DOMContentLoaded', function () {

    // Get the canvas element and context
    const canvas = document.getElementById('myCanvas');

    const max = Math.max(window.innerWidth, window.innerHeight);

    const side = canvasSize;

    canvas.width = side;
    canvas.height = side;
    canvas.style.width = max + 'px';
    canvas.style.height = max + 'px';


    //populate the anomolies array
    for (let i = 0; i < anomolyCount; i++) {
        for (let j = 0; j < anomolyCount; j++) {
            const p = new position(getRandomArbitrary(0, canvas.width), getRandomArbitrary(0, canvas.height))
            const d = Math.random();
            const v = new velocity(getRandomArbitrary(.2, 4) * randomPositiveOrNegative(), getRandomArbitrary(.2, 4) * randomPositiveOrNegative());
            const a = new anomoly(p, d, v, getRandomArbitrary(minArcSize, maxArcSize));
            a.target = new position(getRandomArbitrary(0, canvas.width), getRandomArbitrary(0, canvas.height))
            a.color = `hsl(${Math.floor(285 - getRandomArbitrary(0, 110))}, 100%, ${Math.floor(28 - getRandomArbitrary(0, 22))}%)`;
            anomolies.push(a);
        }

    }


    console.log(anomolies);

    function drawDot(x, y) {
        // Draw the edge dot
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }



    let drawLine = (sx, sy, ex, ey, color) => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1; // thickness in pixels
        ctx.stroke();
        ctx.restore();
    }

    let drawSplotch = (x, y, size, color) => {
        let grad = ctx.createRadialGradient(x, y, 0, x, y, size);


        grad.addColorStop(0, color);
        grad.addColorStop(minArcSize / (size), 'transparent');
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
    }

    const ctx = canvas.getContext('2d');

    const draw = (elapsed) => {

        // loop through all of the anomolies and adjust the direction

        // Background
        ctx.fillStyle = 'hsl(242, 100.00%, 5.70%)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.globalCompositeOperation = 'screen'; // or 'multiply', 'screen', etc.

        anomolies.forEach(anom => {


            // desired position
            let desired = new position(anom.target.x - anom.position.x, anom.target.y - anom.position.y);

            if (fastMagnitude2D(desired) < 1) {
                anom.target = new position(getRandomArbitrary(100, canvas.width - 200), getRandomArbitrary(100, canvas.height - 200))
            }

            drawDot(anom.target.x, anom.target.y);




            desired = fastNormalize2D(desired);

            let steering = new position(desired.x - anom.velocity.x, desired.y - anom.velocity.y);
            steering = fastNormalize2D(steering);
            steering = fastMultiplyVector(steering, .003)




            let normVelo = fastNormalize2D(anom.velocity);
            normVelo = fastMultiplyVector(normVelo, .3)

            anom.velocity.x = normVelo.x + steering.x;
            anom.velocity.y = normVelo.y + steering.y;



            const px = anom.position.x + normVelo.x;
            const py = anom.position.y + normVelo.y;


            anom.position.x = px;
            anom.position.y = py;



            drawSplotch(px, py, anom.size, anom.color);

            drawLine(px, py, px + (anom.velocity.x*100), py + (anom.velocity.y*100), 'white');




        })

        // Reset composite mode
        ctx.globalCompositeOperation = 'source-over';
    }

    function resizeCanvas() {
        const side = Math.max(window.innerWidth, window.innerHeight);
        canvas.style.width = side + 'px';
        canvas.style.height = side + 'px';
        draw(0);
    }

    window.addEventListener('resize', resizeCanvas);

    let start = 0;

    function animate(timestamp) {

        if (start === undefined) {
            start = timestamp;
        }

        const elapsed = (timestamp - start) * animationSpeed;

        draw(elapsed);
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    // end DOMContentLoaded
}); 