window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.orbit = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const orbiters = [];
    const orbiterCount = 8;
    const speed = options.speed || 1;
    const color = options.color || '#0073aa';
    let animationId;
    let time = 0;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }   
    
    
    function createOrbiter(index) {
        return {
            distance: 60 + index * 25,
            angle: (index / orbiterCount) * Math.PI * 2,
            speed: 0.5 + index * 0.1,
            size: 8 - index * 0.5,
            trailLength: 30
        };
    }
    
    function init() {
        resizeCanvas();
        orbiters.length = 0;
        for (let i = 0; i < orbiterCount; i++) {
            orbiters.push(createOrbiter(i));
        }
    }
    
    function drawOrbiter(orbiter) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        const currentAngle = time * orbiter.speed * speed;
        
        // Draw trail
        for (let i = 0; i < orbiter.trailLength; i++) {
            const trailAngle = currentAngle - (i * 0.1);
            const x = centerX + Math.cos(trailAngle) * orbiter.distance;
            const y = centerY + Math.sin(trailAngle) * orbiter.distance;
            const alpha = baseAlpha * (1 - i / orbiter.trailLength) * 0.5;
            const size = orbiter.size * (1 - i / orbiter.trailLength);
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + alpha + ')';
            ctx.fill();
        }
        
        // Draw main orbiter
        const x = centerX + Math.cos(currentAngle) * orbiter.distance;
        const y = centerY + Math.sin(currentAngle) * orbiter.distance;
        
        ctx.beginPath();
        ctx.arc(x, y, orbiter.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * 0.9) + ')';
        ctx.fill();
        
        // Glow effect
        ctx.beginPath();
        ctx.arc(x, y, orbiter.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * 0.3) + ')';
        ctx.fill();
        
        // Draw orbit path
        ctx.beginPath();
        ctx.arc(centerX, centerY, orbiter.distance, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * 0.1) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw center
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * 0.8) + ')';
        ctx.fill();
        
        orbiters.forEach(orbiter => {
            drawOrbiter(orbiter);
        });
        
        time += 0.02;
        
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