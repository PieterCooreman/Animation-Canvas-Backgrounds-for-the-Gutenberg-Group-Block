window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.clouds = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const clouds = [];
    const cloudCount = 8;
    const speed = options.speed || 1;
    const color = options.color || '#ffffff';
    let animationId;
    let time = 0;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    function createCloud() {
        const cloudWidth = Math.random() * 200 + 150;
        const cloudHeight = Math.random() * 60 + 40;
        
        // Create random puffs for this cloud
        const puffCount = Math.floor(Math.random() * 4) + 4;
        const puffs = [];
        
        for (let i = 0; i < puffCount; i++) {
            puffs.push({
                offsetX: (i / puffCount) * cloudWidth - cloudWidth / 2 + (Math.random() - 0.5) * 40,
                offsetY: (Math.random() - 0.5) * cloudHeight * 0.6,
                radius: Math.random() * 40 + 30,
                alpha: Math.random() * 0.3 + 0.5
            });
        }
        
        return {
            x: -cloudWidth,
            y: Math.random() * canvas.height * 0.7,
            width: cloudWidth,
            height: cloudHeight,
            speed: Math.random() * 0.3 + 0.1,
            opacity: Math.random() * 0.4 + 0.4,
            puffs: puffs,
            wobbleOffset: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.01 + 0.005,
            layer: Math.random() < 0.5 ? 'back' : 'front' // Depth layer
        };
    }
    
    function init() {
        resizeCanvas();
        clouds.length = 0;
        for (let i = 0; i < cloudCount; i++) {
            const cloud = createCloud();
            cloud.x = Math.random() * canvas.width;
            clouds.push(cloud);
        }
        
        // Sort by layer for proper depth rendering
        clouds.sort((a, b) => {
            if (a.layer === 'back' && b.layer === 'front') return -1;
            if (a.layer === 'front' && b.layer === 'back') return 1;
            return 0;
        });
    }
    
    function drawCloud(cloud) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        
        // Mix with white for cloud appearance
        const whiteMix = 0.9; // 90% white
        const r = Math.round(rgb.r * (1 - whiteMix) + 255 * whiteMix);
        const g = Math.round(rgb.g * (1 - whiteMix) + 255 * whiteMix);
        const b = Math.round(rgb.b * (1 - whiteMix) + 255 * whiteMix);
        
        // Adjust opacity based on layer
        const layerOpacity = cloud.layer === 'back' ? 0.7 : 1;
        const wobble = Math.sin(time * cloud.wobbleSpeed + cloud.wobbleOffset) * 5;
        
        ctx.save();
        ctx.translate(cloud.x, cloud.y + wobble);
        
        // Draw each puff
        cloud.puffs.forEach(puff => {
            const puffAlpha = baseAlpha * cloud.opacity * puff.alpha * layerOpacity;
            
            // Create soft gradient for each puff
            const gradient = ctx.createRadialGradient(
                puff.offsetX, puff.offsetY, 0,
                puff.offsetX, puff.offsetY, puff.radius
            );
            
            gradient.addColorStop(0, 'rgba(' + r + ', ' + g + ', ' + b + ', ' + puffAlpha + ')');
            gradient.addColorStop(0.5, 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (puffAlpha * 0.8) + ')');
            gradient.addColorStop(1, 'rgba(' + r + ', ' + g + ', ' + b + ', 0)');
            
            ctx.beginPath();
            ctx.arc(puff.offsetX, puff.offsetY, puff.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        });
        
        // Add extra softness with a secondary layer
        cloud.puffs.forEach(puff => {
            const puffAlpha = baseAlpha * cloud.opacity * puff.alpha * layerOpacity * 0.3;
            
            const gradient = ctx.createRadialGradient(
                puff.offsetX, puff.offsetY, 0,
                puff.offsetX, puff.offsetY, puff.radius * 1.5
            );
            
            gradient.addColorStop(0, 'rgba(' + r + ', ' + g + ', ' + b + ', ' + puffAlpha + ')');
            gradient.addColorStop(1, 'rgba(' + r + ', ' + g + ', ' + b + ', 0)');
            
            ctx.beginPath();
            ctx.arc(puff.offsetX, puff.offsetY, puff.radius * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    function updateCloud(cloud) {
        // Drift slowly to the right
        cloud.x += cloud.speed * speed;
        
        // Reset when off screen
        if (cloud.x > canvas.width + cloud.width) {
            cloud.x = -cloud.width;
            cloud.y = Math.random() * canvas.height * 0.7;
            cloud.opacity = Math.random() * 0.4 + 0.4;
            
            // Regenerate puffs for variety
            const puffCount = Math.floor(Math.random() * 4) + 4;
            cloud.puffs = [];
            
            for (let i = 0; i < puffCount; i++) {
                cloud.puffs.push({
                    offsetX: (i / puffCount) * cloud.width - cloud.width / 2 + (Math.random() - 0.5) * 40,
                    offsetY: (Math.random() - 0.5) * cloud.height * 0.6,
                    radius: Math.random() * 40 + 30,
                    alpha: Math.random() * 0.3 + 0.5
                });
            }
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        clouds.forEach(cloud => {
            updateCloud(cloud);
            drawCloud(cloud);
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