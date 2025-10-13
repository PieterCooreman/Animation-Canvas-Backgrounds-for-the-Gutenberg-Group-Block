window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.rain = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const drops = [];
    const splashes = [];
    const dropCount = 150;
    const speed = options.speed || 1;
    const color = options.color || '#88a4d6';
    const enableLightning = options.lightning !== false; // Default true
    let animationId;
    let time = 0;
    let lightningFlash = 0;
    let nextLightning = Math.random() * 300 + 200;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    function createDrop() {
        return {
            x: Math.random() * (canvas.width + 200) - 100,
            y: -Math.random() * canvas.height,
            length: Math.random() * 20 + 10,
            speed: Math.random() * 8 + 5,
            width: Math.random() * 1.5 + 0.5,
            wind: Math.random() * 2 - 1,
            opacity: Math.random() * 0.3 + 0.3
        };
    }
    
    function createSplash(x, y) {
        const splashParticles = [];
        const particleCount = Math.floor(Math.random() * 4) + 3;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI;
            const velocity = Math.random() * 2 + 1;
            splashParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 2,
                life: 1,
                size: Math.random() * 2 + 1
            });
        }
        
        return {
            particles: splashParticles,
            life: 1,
            fadeSpeed: 0.05
        };
    }
    
    function init() {
        resizeCanvas();
        drops.length = 0;
        for (let i = 0; i < dropCount; i++) {
            drops.push(createDrop());
        }
    }
    
    function drawDrop(drop) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        
        // Make rain slightly bluer/cooler
        const r = Math.round(rgb.r * 0.8 + 136 * 0.2);
        const g = Math.round(rgb.g * 0.8 + 164 * 0.2);
        const b = Math.round(rgb.b * 0.8 + 214 * 0.2);
        
        const gradient = ctx.createLinearGradient(
            drop.x, drop.y,
            drop.x + drop.wind * 2, drop.y + drop.length
        );
        
        gradient.addColorStop(0, 'rgba(' + r + ', ' + g + ', ' + b + ', 0)');
        gradient.addColorStop(0.3, 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (baseAlpha * drop.opacity) + ')');
        gradient.addColorStop(1, 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (baseAlpha * drop.opacity * 0.7) + ')');
        
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.wind * 2, drop.y + drop.length);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = drop.width;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    
    function drawSplash(splash) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        
        const r = Math.round(rgb.r * 0.8 + 136 * 0.2);
        const g = Math.round(rgb.g * 0.8 + 164 * 0.2);
        const b = Math.round(rgb.b * 0.8 + 214 * 0.2);
        
        splash.particles.forEach(particle => {
            const alpha = baseAlpha * splash.life * 0.5;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
            ctx.fill();
            
            // Small trail
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle.x - particle.vx * 2, particle.y - particle.vy * 2);
            ctx.strokeStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (alpha * 0.5) + ')';
            ctx.lineWidth = particle.size * 0.5;
            ctx.stroke();
        });
    }
    
    function updateDrop(drop) {
        drop.y += drop.speed * speed;
        drop.x += drop.wind * speed * 0.5;
        
        // Check if hit ground
        if (drop.y > canvas.height) {
            // Create splash
            splashes.push(createSplash(drop.x, canvas.height));
            
            // Reset drop
            drop.x = Math.random() * (canvas.width + 200) - 100;
            drop.y = -Math.random() * 100 - 10;
            drop.length = Math.random() * 20 + 10;
            drop.speed = Math.random() * 8 + 5;
        }
    }
    
    function updateSplash(splash) {
        splash.life -= splash.fadeSpeed * speed;
        
        splash.particles.forEach(particle => {
            particle.x += particle.vx * speed;
            particle.y += particle.vy * speed;
            particle.vy += 0.2 * speed; // Gravity
        });
    }
    
    function drawLightning() {
        if (lightningFlash <= 0) return;
        
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        
        // Flash overlay
        const flashAlpha = lightningFlash * baseAlpha * 0.15;
        ctx.fillStyle = 'rgba(255, 255, 255, ' + flashAlpha + ')';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw lightning bolt
        if (lightningFlash > 0.5) {
            const startX = Math.random() * canvas.width;
            const segments = 8 + Math.floor(Math.random() * 5);
            let x = startX;
            let y = 0;
            
            ctx.strokeStyle = 'rgba(200, 220, 255, ' + (lightningFlash * baseAlpha * 0.8) + ')';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(200, 220, 255, ' + (lightningFlash * 0.8) + ')';
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            
            for (let i = 0; i < segments; i++) {
                const segmentHeight = canvas.height / segments;
                y += segmentHeight;
                x += (Math.random() - 0.5) * 60;
                x = Math.max(0, Math.min(canvas.width, x));
                ctx.lineTo(x, y);
                
                // Occasional branch
                if (Math.random() > 0.7) {
                    const branchX = x + (Math.random() - 0.5) * 40;
                    const branchY = y + segmentHeight * 0.5;
                    ctx.lineTo(branchX, branchY);
                    ctx.moveTo(x, y);
                }
            }
            
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        lightningFlash -= 0.1 * speed;
    }
    
    function triggerLightning() {
        if (enableLightning && Math.random() > 0.997) {
            lightningFlash = 1;
            nextLightning = time + Math.random() * 300 + 200;
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw lightning flash
        drawLightning();
        
        // Trigger lightning randomly
        if (time > nextLightning) {
            triggerLightning();
        }
        
        // Update and draw drops
        drops.forEach(drop => {
            updateDrop(drop);
            drawDrop(drop);
        });
        
        // Update and draw splashes
        for (let i = splashes.length - 1; i >= 0; i--) {
            updateSplash(splashes[i]);
            if (splashes[i].life <= 0) {
                splashes.splice(i, 1);
            } else {
                drawSplash(splashes[i]);
            }
        }
        
        time += 1;
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