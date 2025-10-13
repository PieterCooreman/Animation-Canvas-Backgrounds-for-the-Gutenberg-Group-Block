window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.spirals = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 200;
    const speed = options.speed || 1;
    const color = options.color || '#0073aa';
    let animationId;
    let time = 0;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
        
    function createParticle(index) {
        const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;
        const angle = (index / particleCount) * Math.PI * 8;
        const radius = (index / particleCount) * maxRadius;
        
        return {
            angle: angle,
            radius: radius,
            baseRadius: radius,
            size: Math.random() * 3 + 1,
            offset: Math.random() * Math.PI * 2,
            speed: 0.02 + Math.random() * 0.02
        };
    }
    
    function init() {
        resizeCanvas();
        particles.length = 0;
        
        // Only create particles if canvas has valid dimensions
        if (canvas.width > 0 && canvas.height > 0) {
            for (let i = 0; i < particleCount; i++) {
                particles.push(createParticle(i));
            }
        }
    }
    
    function drawParticle(particle, centerX, centerY) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        const pulse = Math.sin(time * 2 + particle.offset) * 10;
        const currentRadius = particle.radius + pulse;
        const x = centerX + Math.cos(particle.angle + time) * currentRadius;
        const y = centerY + Math.sin(particle.angle + time) * currentRadius;
        
        const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;
        const distanceFromCenter = maxRadius > 0 ? particle.radius / maxRadius : 0;
        const opacity = Math.max(0.2, 0.8 - distanceFromCenter * 0.5);
        
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * opacity) + ')';
        ctx.fill();
        
        // Add glow for particles closer to center
        if (distanceFromCenter < 0.5) {
            ctx.beginPath();
            ctx.arc(x, y, particle.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * opacity * 0.2) + ')';
            ctx.fill();
        }
    }
    
    function drawConnectionLines(centerX, centerY) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        
        for (let i = 0; i < particles.length - 1; i++) {
            if (i % 8 === 0) {
                const p1 = particles[i];
                const p2 = particles[i + 1];
                
                const x1 = centerX + Math.cos(p1.angle + time) * p1.radius;
                const y1 = centerY + Math.sin(p1.angle + time) * p1.radius;
                const x2 = centerX + Math.cos(p2.angle + time) * p2.radius;
                const y2 = centerY + Math.sin(p2.angle + time) * p2.radius;
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * 0.1) + ')';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
    
    function animate() {
        // Clear canvas for transparent background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        drawConnectionLines(centerX, centerY);
        
        particles.forEach(particle => {
            drawParticle(particle, centerX, centerY);
        });
        
        time += 0.01 * speed;
        
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