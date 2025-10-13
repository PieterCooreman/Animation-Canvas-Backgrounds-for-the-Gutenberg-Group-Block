window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.breathing = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const circles = [];
    const circleCount = 5;
    const speed = options.speed || 1;
    const color = options.color || '#0073aa';
    let animationId;
    let time = 0;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }   
    
    function createCircle(index) {
        return {
            baseRadius: 30 + index * 25,
            offset: (index / circleCount) * Math.PI * 2,
            alpha: 0.8 - (index * 0.12)
        };
    }
    
    function init() {
        resizeCanvas();
        circles.length = 0;
        for (let i = 0; i < circleCount; i++) {
            circles.push(createCircle(i));
        }
    }
    
    function drawCircle(circle) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        const breath = Math.sin(time + circle.offset);
        const radius = circle.baseRadius + breath * 20;
        const alpha = baseAlpha * circle.alpha * (0.7 + breath * 0.3);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + alpha + ')';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Add soft glow
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (alpha * 0.3) + ')';
        ctx.lineWidth = 8;
        ctx.stroke();
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        circles.forEach(circle => {
            drawCircle(circle);
        });
        
        time += 0.015 * speed;
        
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