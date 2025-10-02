
let anomolies = [];
let animationSpeed = .3;
const anomolyCount = 5;
let maxArcSize = 600;
let minArcSize = 250;
let maxOpacity = .8;
let minOpacity = .3;
let colorRange = 30;
let canvasSize = 1000;
let steerStrength = 0.003;



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

    canvas.width = (window.innerWidth / max) * side;
    canvas.height = (window.innerHeight / max) * side;

    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';



    //populate the anomolies array
    for (let i = 0; i < anomolyCount; i++) {
        for (let j = 0; j < anomolyCount; j++) {
            const p = new position(getRandomArbitrary(0, canvas.width), getRandomArbitrary(0, canvas.height))
            const d = Math.random();
            const v = new velocity(getRandomArbitrary(.2, 4) * randomPositiveOrNegative(), getRandomArbitrary(.2, 4) * randomPositiveOrNegative());
            const a = new anomoly(p, d, v, getRandomArbitrary(minArcSize, maxArcSize));
            a.target = new position(getRandomArbitrary(0, canvas.width), getRandomArbitrary(0, canvas.height))
            a.color = `hsl(${Math.floor(285 - getRandomArbitrary(0, 110))}, 65%, ${Math.floor(28 - getRandomArbitrary(0, 22))}%)`;
            anomolies.push(a);
        }

    }

    console.log(anomolies);

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
        // Background
        ctx.fillStyle = 'hsl(242, 100.00%, 5.70%)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.globalCompositeOperation = 'screen';

        for (let i = 0; i < anomolies.length; i++) {
            const anom = anomolies[i];

            // Calculate desired vector and distance to target
            const dx = anom.target.x - anom.position.x;
            const dy = anom.target.y - anom.position.y;
            const distSq = dx * dx + dy * dy;

            // If close to target, pick a new one
            if (distSq < 1) {
                anom.target.x = getRandomArbitrary(0, canvas.width);
                anom.target.y = getRandomArbitrary(0, canvas.height);
            }

            // Fast normalize desired vector
            let mag = Math.sqrt(distSq) || 1;
            const desiredX = dx / mag;
            const desiredY = dy / mag;

            // Steering = desired - velocity
            const steerX = desiredX - anom.velocity.x;
            const steerY = desiredY - anom.velocity.y;
            mag = Math.sqrt(steerX * steerX + steerY * steerY) || 1;
            const normSteerX = (steerX / mag) * steerStrength;
            const normSteerY = (steerY / mag) * steerStrength;

            // Normalize velocity
            mag = Math.sqrt(anom.velocity.x * anom.velocity.x + anom.velocity.y * anom.velocity.y) || 1;
            const normVeloX = (anom.velocity.x / mag) * animationSpeed;
            const normVeloY = (anom.velocity.y / mag) * animationSpeed;

            // Update velocity
            anom.velocity.x = normVeloX + normSteerX;
            anom.velocity.y = normVeloY + normSteerY;

            // Update position
            anom.position.x += normVeloX;
            anom.position.y += normVeloY;

            // Draw splotch and line with arrow
            drawSplotch(anom.position.x, anom.position.y, anom.size, anom.color);
        }

        ctx.globalCompositeOperation = 'source-over';
    };

    function resizeCanvas() {
        const max = Math.max(window.innerWidth, window.innerHeight);


        const side = canvasSize;

        canvas.width = (window.innerWidth / max) * side;
        canvas.height = (window.innerHeight / max) * side;

        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
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