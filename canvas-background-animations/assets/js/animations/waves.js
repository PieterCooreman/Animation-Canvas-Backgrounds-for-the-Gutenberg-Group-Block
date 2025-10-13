window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.waves = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const speed = options.speed || 1;
    const color = options.color || '#0073aa';
    let animationId;
    let time = 0;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }    
    
    
    function drawWave(offset, amplitude, frequency, alpha) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        
        for (let x = 0; x <= canvas.width; x++) {
            const y = canvas.height / 2 + 
                     Math.sin((x * frequency) + time + offset) * amplitude;
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        
        ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * alpha) + ')';
        ctx.fill();
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw multiple wave layers
        drawWave(0, 30, 0.01, 0.1);
        drawWave(1, 40, 0.008, 0.08);
        drawWave(2, 50, 0.006, 0.06);
        
        time += 0.02 * speed;
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Initialize
    setTimeout(resizeCanvas,500);
    setTimeout(animate,500);
    
    // Handle resize
    window.addEventListener('resize', resizeCanvas);
    
    // Return cleanup function
    return function cleanup() {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', resizeCanvas);
    };
};