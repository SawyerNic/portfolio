document.addEventListener('DOMContentLoaded', function () {

    // Get the canvas element and context
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'hsl(242, 100%, 12%)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'screen'; // or 'multiply', 'screen', etc.

    let drawSplotch = (x, y, color) => {
        let grad = ctx.createRadialGradient(x, y, 0, x, y, 200);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    let federalBlue = 'hsl(232, 100%, 21%)';
    drawSplotch(50, 50, federalBlue);

    let secondColor = 'hsl(199, 100%, 50%)'
    drawSplotch(250, 100, secondColor);


    // Reset composite mode
    ctx.globalCompositeOperation = 'source-over';


    // end DOMContentLoaded
}); 