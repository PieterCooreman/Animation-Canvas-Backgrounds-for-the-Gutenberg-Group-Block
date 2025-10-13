window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.fireworks = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const fireworks = [];
    const particles = [];
    const speed = options.speed || 1;
    const color = options.color || '#0073aa';
    let animationId;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }   
    
    function createFirework() {
        return {
            x: Math.random() * canvas.width,
            y: canvas.height,
            targetY: canvas.height * 0.2 + Math.random() * canvas.height * 0.4,
            vx: 0,
            vy: -(4 + Math.random() * 2),
            trail: [],
            exploded: false
        };
    }
    
    function createParticle(x, y) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 3 + 1;
        return {
            x: x,
            y: y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            life: 1,
            size: Math.random() * 2 + 1,
            gravity: 0.02,
            fade: Math.random() * 0.02 + 0.01
        };
    }
    
    function init() {
        resizeCanvas();
    }
    
    function drawFirework(firework) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        
        // Draw trail
        firework.trail.forEach((point, index) => {
            const alpha = baseAlpha * index / firework.trail.length * 0.5;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + alpha + ')';
            ctx.fill();
        });
        
        // Draw firework
        ctx.beginPath();
        ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * 0.8) + ')';
        ctx.fill();
        
        // Glow
        ctx.beginPath();
        ctx.arc(firework.x, firework.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * 0.3) + ')';
        ctx.fill();
    }
    
    function drawParticle(particle) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * particle.life) + ')';
        ctx.fill();
        
        // Glow effect
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * particle.life * 0.3) + ')';
        ctx.fill();
    }
    
    function updateFirework(firework) {
        firework.trail.push({ x: firework.x, y: firework.y });
        if (firework.trail.length > 10) {
            firework.trail.shift();
        }
        
        firework.x += firework.vx * speed;
        firework.y += firework.vy * speed;
        
        if (firework.y <= firework.targetY && !firework.exploded) {
            firework.exploded = true;
            // Create explosion particles
            for (let i = 0; i < 30; i++) {
                particles.push(createParticle(firework.x, firework.y));
            }
        }
    }
    
    function updateParticle(particle) {
        particle.x += particle.vx * speed;
        particle.y += particle.vy * speed;
        particle.vy += particle.gravity * speed;
        particle.life -= particle.fade * speed;
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Launch new firework occasionally
        if (Math.random() < 0.02 * speed) {
            fireworks.push(createFirework());
        }
        
        // Update and draw fireworks
        for (let i = fireworks.length - 1; i >= 0; i--) {
            updateFirework(fireworks[i]);
            if (fireworks[i].exploded) {
                fireworks.splice(i, 1);
            } else {
                drawFirework(fireworks[i]);
            }
        }
        
        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            updateParticle(particles[i]);
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
            } else {
                drawParticle(particles[i]);
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