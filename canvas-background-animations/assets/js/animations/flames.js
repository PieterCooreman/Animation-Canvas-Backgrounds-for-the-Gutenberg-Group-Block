window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.flames = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const flames = [];
    const flameCount = 60;
    const speed = options.speed || 1;
    const color = options.color || '#ff6600';
    let animationId;
    let time = 0;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    // Simplex-like noise function for organic movement
    function noise(x, y, t) {
        return Math.sin(x * 0.1 + t) * Math.cos(y * 0.1 + t * 0.8) * 
               Math.sin((x + y) * 0.05 + t * 0.5);
    }
    
    function createFlame() {
        const startY = canvas.height;
        const startX = canvas.width / 2 + (Math.random() - 0.5) * (canvas.width * 0.4);
        
        return {
            x: startX,
            y: startY,
            baseX: startX,
            size: Math.random() * 20 + 15,
            speed: Math.random() * 2.5 + 1.5,
            life: 1,
            maxLife: Math.random() * 0.6 + 0.4,
            turbulence: Math.random() * 2 + 1,
            noiseOffsetX: Math.random() * 1000,
            noiseOffsetY: Math.random() * 1000,
            flickerSpeed: Math.random() * 0.1 + 0.05,
            flickerOffset: Math.random() * Math.PI * 2,
            expansion: Math.random() * 0.5 + 0.5,
            heat: 1 // How hot/bright the flame is
        };
    }
    
    function init() {
        resizeCanvas();
        flames.length = 0;
        for (let i = 0; i < flameCount; i++) {
            flames.push(createFlame());
        }
    }
    
    function drawFlame(flame) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        
        // Progress through flame life (0 = base, 1 = tip)
        const progress = 1 - flame.life;
        
        // Calculate heat-based color
        // Hot flames: white/yellow at base
        // Cooler flames: orange/red at tips
        let r, g, b;
        
        if (progress < 0.2) {
            // Very hot - almost white with slight color tint
            const whiteness = (0.2 - progress) / 0.2;
            r = Math.round(255 * whiteness + rgb.r * (1 - whiteness));
            g = Math.round(255 * whiteness + Math.min(255, rgb.g + 100) * (1 - whiteness));
            b = Math.round(255 * whiteness + Math.max(0, rgb.b - 100) * (1 - whiteness));
        } else if (progress < 0.5) {
            // Hot yellow-orange
            const mixFactor = (progress - 0.2) / 0.3;
            r = Math.round(255 * (1 - mixFactor) + rgb.r * mixFactor);
            g = Math.round(Math.min(255, rgb.g + 100) * (1 - mixFactor) + rgb.g * mixFactor);
            b = Math.round(Math.max(0, rgb.b - 100) * (1 - mixFactor) + rgb.b * mixFactor);
        } else {
            // Cooling down - darker orange/red
            const coolFactor = (progress - 0.5) / 0.5;
            r = Math.round(rgb.r * (1 - coolFactor * 0.3));
            g = Math.round(rgb.g * (1 - coolFactor * 0.5));
            b = Math.round(rgb.b * (1 - coolFactor * 0.2));
        }
        
        // Flicker effect
        const flicker = Math.sin(time * flame.flickerSpeed + flame.flickerOffset) * 0.2 + 0.8;
        
        // Opacity decreases as flame rises
        const opacity = baseAlpha * flame.life * flicker * (1 - progress * 0.5);
        
        // Size increases as flame rises (expansion)
        const currentSize = flame.size * (1 + progress * flame.expansion);
        
        // Draw main flame body with radial gradient
        const gradient = ctx.createRadialGradient(
            flame.x, flame.y, 0,
            flame.x, flame.y, currentSize
        );
        
        gradient.addColorStop(0, 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')');
        gradient.addColorStop(0.4, 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (opacity * 0.8) + ')');
        gradient.addColorStop(0.7, 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (opacity * 0.4) + ')');
        gradient.addColorStop(1, 'rgba(' + r + ', ' + g + ', ' + b + ', 0)');
        
        ctx.beginPath();
        ctx.arc(flame.x, flame.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add inner bright core for more realism
        if (progress < 0.4) {
            const coreSize = currentSize * 0.4;
            const coreOpacity = opacity * (1 - progress / 0.4) * 0.8;
            
            const coreGradient = ctx.createRadialGradient(
                flame.x, flame.y, 0,
                flame.x, flame.y, coreSize
            );
            
            coreGradient.addColorStop(0, 'rgba(255, 255, 230, ' + coreOpacity + ')');
            coreGradient.addColorStop(0.5, 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (coreOpacity * 0.6) + ')');
            coreGradient.addColorStop(1, 'rgba(' + r + ', ' + g + ', ' + b + ', 0)');
            
            ctx.beginPath();
            ctx.arc(flame.x, flame.y, coreSize, 0, Math.PI * 2);
            ctx.fillStyle = coreGradient;
            ctx.fill();
        }
        
        // Add stretched upward glow for flame shape
        if (progress < 0.6) {
            const stretchGradient = ctx.createLinearGradient(
                flame.x, flame.y,
                flame.x, flame.y - currentSize * 1.5
            );
            
            const stretchOpacity = opacity * 0.5 * (1 - progress / 0.6);
            stretchGradient.addColorStop(0, 'rgba(' + r + ', ' + g + ', ' + b + ', ' + stretchOpacity + ')');
            stretchGradient.addColorStop(1, 'rgba(' + r + ', ' + g + ', ' + b + ', 0)');
            
            ctx.beginPath();
            ctx.ellipse(flame.x, flame.y - currentSize * 0.3, currentSize * 0.6, currentSize * 1.2, 0, 0, Math.PI * 2);
            ctx.fillStyle = stretchGradient;
            ctx.fill();
        }
    }
    
    function updateFlame(flame) {
        // Rise upward
        flame.y -= flame.speed * speed;
        
        // Turbulent horizontal movement using noise
        const noiseX = noise(
            flame.noiseOffsetX + time * 0.5,
            flame.y * 0.01,
            time * 0.3
        ) * flame.turbulence;
        
        const noiseY = noise(
            flame.noiseOffsetY + time * 0.5,
            flame.y * 0.01,
            time * 0.3
        ) * flame.turbulence * 0.5;
        
        flame.x = flame.baseX + noiseX * 30;
        flame.y += noiseY;
        
        // Decrease life
        flame.life -= (0.015 * speed) / flame.maxLife;
        
        // Reset when dead
        if (flame.life <= 0) {
            flame.y = canvas.height;
            flame.x = canvas.width / 2 + (Math.random() - 0.5) * (canvas.width * 0.4);
            flame.baseX = flame.x;
            flame.life = 1;
            flame.size = Math.random() * 20 + 15;
            flame.speed = Math.random() * 2.5 + 1.5;
            flame.noiseOffsetX = Math.random() * 1000;
            flame.noiseOffsetY = Math.random() * 1000;
        }
    }
    
    function drawHeatDistortion() {
        // Add subtle heat shimmer effect at the base
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        
        const shimmerHeight = canvas.height * 0.3;
        const gradient = ctx.createLinearGradient(
            0, canvas.height,
            0, canvas.height - shimmerHeight
        );
        
        const shimmerOpacity = baseAlpha * 0.05;
        gradient.addColorStop(0, 'rgba(255, 200, 100, ' + shimmerOpacity + ')');
        gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, canvas.height - shimmerHeight, canvas.width, shimmerHeight);
    }
    
    function drawBaseGlow() {
        // Intense glow at the base where flames originate
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        
        const centerX = canvas.width / 2;
        const baseY = canvas.height;
        const glowRadius = canvas.width * 0.3;
        
        const gradient = ctx.createRadialGradient(
            centerX, baseY, 0,
            centerX, baseY, glowRadius
        );
        
        // Brightest at center
        const brightness = Math.sin(time * 0.5) * 0.1 + 0.9;
        gradient.addColorStop(0, 'rgba(255, 220, 100, ' + (baseAlpha * 0.4 * brightness) + ')');
        gradient.addColorStop(0.3, 'rgba(' + rgb.r + ', ' + Math.min(255, rgb.g + 50) + ', ' + rgb.b + ', ' + (baseAlpha * 0.25 * brightness) + ')');
        gradient.addColorStop(0.6, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * 0.1 * brightness) + ')');
        gradient.addColorStop(1, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0)');
        
        ctx.beginPath();
        ctx.arc(centerX, baseY, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw base glow first
        drawBaseGlow();
        
        // Draw heat distortion
        drawHeatDistortion();
        
        // Sort flames by y position for proper layering (back to front)
        flames.sort((a, b) => b.y - a.y);
        
        // Update and draw flames
        flames.forEach(flame => {
            updateFlame(flame);
            drawFlame(flame);
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