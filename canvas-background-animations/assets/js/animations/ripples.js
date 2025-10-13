window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.ripples = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const ripples = [];
    const speed = options.speed || 1;
    const color = options.color || '#0073aa';
    let animationId;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
       
    
    function createRipple() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 0,
            maxRadius: Math.random() * 150 + 100,
            alpha: 1,
            speed: Math.random() * 2 + 1
        };
    }
    
    function init() {
        resizeCanvas();
    }
    
    function addRipple() {
        ripples.push(createRipple());
    }
    
    function drawRipple(ripple) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        
        for (let i = 0; i < 3; i++) {
            const offset = i * 20;
            const currentRadius = ripple.radius - offset;
            
            if (currentRadius > 0) {
                const alpha = baseAlpha * ripple.alpha * (1 - i * 0.3);
                ctx.beginPath();
                ctx.arc(ripple.x, ripple.y, currentRadius, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + alpha + ')';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }
    
    function updateRipple(ripple) {
        ripple.radius += ripple.speed * speed;
        ripple.alpha = 1 - (ripple.radius / ripple.maxRadius);
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Add new ripple occasionally
        if (Math.random() < 0.02 * speed) {
            addRipple();
        }
        
        // Update and draw ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
            updateRipple(ripples[i]);
            drawRipple(ripples[i]);
            
            // Remove completed ripples
            if (ripples[i].alpha <= 0) {
                ripples.splice(i, 1);
            }
        }
        
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