window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.bubbles = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const bubbles = [];
    const bubbleCount = 30;
    const speed = options.speed || 1;
    const color = options.color || '#0073aa';
    let animationId;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }    
    
    function createBubble() {
        return {
            x: Math.random() * canvas.width,
            y: canvas.height + Math.random() * 100,
            radius: Math.random() * 30 + 10,
            vx: (Math.random() - 0.5) * speed * 0.5,
            vy: -(Math.random() * speed + 0.5),
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.03 + 0.01,
            life: 1.0
        };
    }
    
    function init() {
        resizeCanvas();
        bubbles.length = 0;
        for (let i = 0; i < bubbleCount; i++) {
            bubbles.push(createBubble());
        }
    }
    
    function drawBubble(bubble) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        
        // Main bubble body
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(
            bubble.x - bubble.radius * 0.3,
            bubble.y - bubble.radius * 0.3,
            0,
            bubble.x,
            bubble.y,
            bubble.radius
        );
        
        gradient.addColorStop(0, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * 0.4) + ')');
        gradient.addColorStop(0.7, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * 0.2) + ')');
        gradient.addColorStop(1, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * 0.1) + ')');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Outer ring
        ctx.strokeStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * 0.3) + ')';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Highlight
        ctx.beginPath();
        ctx.arc(
            bubble.x - bubble.radius * 0.4,
            bubble.y - bubble.radius * 0.4,
            bubble.radius * 0.3,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (baseAlpha * 0.6) + ')';
        ctx.fill();
    }
    
    function updateBubble(bubble) {
        // Update position with wobble
        bubble.x += bubble.vx + Math.sin(bubble.wobble) * 0.5;
        bubble.y += bubble.vy;
        bubble.wobble += bubble.wobbleSpeed * speed;
        
        // Pop bubble if it reaches the top or goes off screen
        if (bubble.y < -bubble.radius || 
            bubble.x < -bubble.radius || 
            bubble.x > canvas.width + bubble.radius) {
            // Reset bubble at bottom
            bubble.x = Math.random() * canvas.width;
            bubble.y = canvas.height + bubble.radius;
            bubble.radius = Math.random() * 30 + 10;
            bubble.vx = (Math.random() - 0.5) * speed * 0.5;
            bubble.vy = -(Math.random() * speed + 0.5);
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        bubbles.forEach(bubble => {
            updateBubble(bubble);
            drawBubble(bubble);
        });
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Initialize and start
    setTimeout(init, 1000);
    setTimeout(animate, 1000);
    
    // Handle resize
    window.addEventListener('resize', init);
    
    // Return cleanup function
    return function cleanup() {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', init);
    };
};