window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.flow = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const lines = [];
    const lineCount = 30;
    const speed = options.speed || 1;
    const color = options.color || '#0073aa';
    let animationId;
    let time = 0;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }    
    
    
    function createLine(index) {
        return {
            y: (index / lineCount) * canvas.height,
            amplitude: Math.random() * 40 + 20,
            frequency: Math.random() * 0.01 + 0.005,
            offset: Math.random() * Math.PI * 2,
            alpha: Math.random() * 0.3 + 0.2
        };
    }
    
    function init() {
        resizeCanvas();
        lines.length = 0;
        for (let i = 0; i < lineCount; i++) {
            lines.push(createLine(i));
        }
    }
    
    function drawLine(line) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        const points = [];
        
        // Generate smooth curve points
        for (let x = 0; x <= canvas.width; x += 5) {
            const y = line.y + 
                     Math.sin((x * line.frequency) + time + line.offset) * line.amplitude;
            points.push({ x, y });
        }
        
        // Draw the flowing line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length - 2; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        
        ctx.strokeStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * line.alpha) + ')';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add glow
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length - 2; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        
        ctx.strokeStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * line.alpha * 0.3) + ')';
        ctx.lineWidth = 6;
        ctx.stroke();
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        lines.forEach(line => {
            drawLine(line);
        });
        
        time += 0.02 * speed;
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Initialize and start
    setTimeout(() => {
        init();
        animate();
    }, 1000);
    
    // Handle resize
    window.addEventListener('resize', init);
    
    // Return cleanup function
    return function cleanup() {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', init);
    };
};