window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.floating = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const shapes = [];
    const shapeCount = 15;
    const speed = options.speed || 1;
    const color = options.color || '#0073aa';
    let animationId;
    let time = 0;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }  
   
    
    function createShape() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 40 + 20,
            driftX: Math.random() * 0.5 - 0.25,
            driftY: Math.random() * 0.5 - 0.25,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            rotation: Math.random() * Math.PI * 2,
            wobbleOffset: Math.random() * Math.PI * 2,
            type: Math.floor(Math.random() * 3), // 0: circle, 1: square, 2: triangle
            alpha: Math.random() * 0.3 + 0.2
        };
    }
    
    function init() {
        resizeCanvas();
        shapes.length = 0;
        for (let i = 0; i < shapeCount; i++) {
            shapes.push(createShape());
        }
    }
    
    function drawShape(shape) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        const wobble = Math.sin(time + shape.wobbleOffset) * 5;
        
        ctx.save();
        ctx.translate(shape.x + wobble, shape.y);
        ctx.rotate(shape.rotation);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, shape.size);
        gradient.addColorStop(0, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * shape.alpha) + ')');
        gradient.addColorStop(1, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0)');
        
        ctx.fillStyle = gradient;
        
        if (shape.type === 0) {
            // Circle
            ctx.beginPath();
            ctx.arc(0, 0, shape.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (shape.type === 1) {
            // Square
            ctx.fillRect(-shape.size, -shape.size, shape.size * 2, shape.size * 2);
        } else {
            // Triangle
            ctx.beginPath();
            ctx.moveTo(0, -shape.size);
            ctx.lineTo(shape.size, shape.size);
            ctx.lineTo(-shape.size, shape.size);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    function updateShape(shape) {
        shape.x += shape.driftX * speed;
        shape.y += shape.driftY * speed;
        shape.rotation += shape.rotationSpeed * speed;
        
        // Wrap around edges
        if (shape.x < -shape.size) shape.x = canvas.width + shape.size;
        if (shape.x > canvas.width + shape.size) shape.x = -shape.size;
        if (shape.y < -shape.size) shape.y = canvas.height + shape.size;
        if (shape.y > canvas.height + shape.size) shape.y = -shape.size;
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        shapes.forEach(shape => {
            updateShape(shape);
            drawShape(shape);
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