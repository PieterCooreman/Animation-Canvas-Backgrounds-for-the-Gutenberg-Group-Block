window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.embers = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const embers = [];
    const emberCount = 40;
    const speed = options.speed || 1;
    const color = options.color || '#ff6b35';
    let animationId;
    let time = 0;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    function createEmber() {
        return {
            x: Math.random() * canvas.width,
            y: canvas.height + Math.random() * 100,
            size: Math.random() * 4 + 1,
            speed: Math.random() * 1.5 + 0.5,
            drift: (Math.random() - 0.5) * 0.8,
            life: 1,
            fadeStart: Math.random() * 0.3 + 0.5, // When to start fading (0.5-0.8 of journey)
            flicker: Math.random() * Math.PI * 2,
            flickerSpeed: Math.random() * 0.1 + 0.05,
            pulseOffset: Math.random() * Math.PI * 2,
            heatWave: Math.random() * Math.PI * 2
        };
    }
    
    function init() {
        resizeCanvas();
        embers.length = 0;
        for (let i = 0; i < emberCount; i++) {
            const ember = createEmber();
            ember.y = Math.random() * canvas.height;
            embers.push(ember);
        }
    }
    
    function drawEmber(ember) {
        const rgb = window.parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        
        // Calculate life progress (0 = bottom, 1 = top)
        const progress = 1 - (ember.y / canvas.height);
        
        // Start fading after fadeStart point
        let opacity = ember.life;
        if (progress > ember.fadeStart) {
            opacity *= 1 - ((progress - ember.fadeStart) / (1 - ember.fadeStart));
        }
        
        // Flicker effect
        const flicker = Math.sin(time * ember.flickerSpeed + ember.flicker) * 0.3 + 0.7;
        opacity *= flicker;
        
        // Pulse effect
        const pulse = Math.sin(time * 2 + ember.pulseOffset) * 0.2 + 0.8;
        const currentSize = ember.size * pulse;
        
        const finalOpacity = baseAlpha * opacity;
        
        // Add heat wave distortion to position
        const heatDistortion = Math.sin(time * 0.5 + ember.heatWave) * 3;
        const x = ember.x + heatDistortion;
        
        // Hot core - bright center
        const coreGradient = ctx.createRadialGradient(x, ember.y, 0, x, ember.y, currentSize);
        
        // Make center nearly white/yellow hot
        const coreR = Math.min(255, rgb.r + 100);
        const coreG = Math.min(255, rgb.g + 100);
        const coreB = Math.max(0, rgb.b - 50);
        
        coreGradient.addColorStop(0, 'rgba(' + coreR + ', ' + coreG + ', ' + coreB + ', ' + finalOpacity + ')');
        coreGradient.addColorStop(0.4, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (finalOpacity * 0.9) + ')');
        coreGradient.addColorStop(1, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0)');
        
        ctx.beginPath();
        ctx.arc(x, ember.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.fill();
        
        // Outer glow
        const glowGradient = ctx.createRadialGradient(x, ember.y, 0, x, ember.y, currentSize * 3);
        
        // Darker outer glow
        const glowR = Math.max(0, rgb.r - 30);
        const glowG = Math.max(0, rgb.g - 30);
        const glowB = rgb.b;
        
        glowGradient.addColorStop(0, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (finalOpacity * 0.4) + ')');
        glowGradient.addColorStop(0.5, 'rgba(' + glowR + ', ' + glowG + ', ' + glowB + ', ' + (finalOpacity * 0.2) + ')');
        glowGradient.addColorStop(1, 'rgba(' + glowR + ', ' + glowG + ', ' + glowB + ', 0)');
        
        ctx.beginPath();
        ctx.arc(x, ember.y, currentSize * 3, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();
        
        // Trailing spark
        if (Math.random() > 0.95 && opacity > 0.3) {
            const trailLength = currentSize * 2;
            const trailGradient = ctx.createLinearGradient(x, ember.y, x, ember.y + trailLength);
            trailGradient.addColorStop(0, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (finalOpacity * 0.6) + ')');
            trailGradient.addColorStop(1, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0)');
            
            ctx.beginPath();
            ctx.moveTo(x, ember.y);
            ctx.lineTo(x, ember.y + trailLength);
            ctx.strokeStyle = trailGradient;
            ctx.lineWidth = currentSize * 0.3;
            ctx.stroke();
        }
    }
    
    function updateEmber(ember) {
        // Rise upward
        ember.y -= ember.speed * speed;
        
        // Drift left/right
        ember.x += ember.drift * speed;
        
        // Heat wave effect - random horizontal movement
        ember.x += Math.sin(time * 0.3 + ember.heatWave) * 0.3;
        
        // Reset when off screen
        if (ember.y < -ember.size * 5) {
            ember.y = canvas.height + Math.random() * 50;
            ember.x = Math.random() * canvas.width;
            ember.life = 1;
            ember.size = Math.random() * 4 + 1;
        }
        
        // Wrap horizontally
        if (ember.x < -ember.size * 5) ember.x = canvas.width + ember.size * 5;
        if (ember.x > canvas.width + ember.size * 5) ember.x = -ember.size * 5;
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        embers.forEach(ember => {
            updateEmber(ember);
            drawEmber(ember);
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