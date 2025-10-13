window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.snowfall = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const snowflakes = [];
    const snowflakeCount = 120;
    const speed = options.speed || 1;
    const color = options.color || '#0073aa';
    let animationId;
    let time = 0;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
        
    function createSnowflake() {
        const size = Math.random() * 3.5 + 1;
        
        return {
            x: Math.random() * canvas.width,
            y: -10,
            size: size,
            speed: Math.random() * 1 + 0.3,
            wind: Math.random() * 0.4 - 0.2,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.02 + 0.01,
            opacity: Math.random() * 0.4 + 0.5,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.04,
            // Natural variation - each snowflake is unique
            shapeType: Math.floor(Math.random() * 5), // Different organic shapes
            complexity: Math.random(),
            asymmetry: Math.random() * 0.3 // Natural imperfection
        };
    }
    
    function init() {
        resizeCanvas();
        snowflakes.length = 0;
        for (let i = 0; i < snowflakeCount; i++) {
            const flake = createSnowflake();
            flake.y = Math.random() * canvas.height;
            snowflakes.push(flake);
        }
    }
    
    function drawSnowflake(snowflake) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        const wobbleX = Math.sin(time * snowflake.wobbleSpeed + snowflake.wobble) * 8;
        
        ctx.save();
        ctx.translate(snowflake.x + wobbleX, snowflake.y);
        ctx.rotate(snowflake.rotation);
        
        const finalOpacity = baseAlpha * snowflake.opacity;
        
        // Mix color with white for more natural snow appearance
        const mixFactor = 0.7; // 70% white, 30% color
        const r = Math.round(rgb.r * (1 - mixFactor) + 255 * mixFactor);
        const g = Math.round(rgb.g * (1 - mixFactor) + 255 * mixFactor);
        const b = Math.round(rgb.b * (1 - mixFactor) + 255 * mixFactor);
        
        // Draw soft glow/blur effect
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, snowflake.size * 2);
        gradient.addColorStop(0, 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (finalOpacity * 0.8) + ')');
        gradient.addColorStop(0.4, 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (finalOpacity * 0.4) + ')');
        gradient.addColorStop(1, 'rgba(' + r + ', ' + g + ', ' + b + ', 0)');
        
        ctx.beginPath();
        ctx.arc(0, 0, snowflake.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw core based on shape type
        ctx.fillStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + finalOpacity + ')';
        
        if (snowflake.shapeType === 0) {
            // Simple circle
            ctx.beginPath();
            ctx.arc(0, 0, snowflake.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (snowflake.shapeType === 1) {
            // Hexagonal shape
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const radius = snowflake.size * (0.5 + Math.random() * 0.2);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            
        } else if (snowflake.shapeType === 2) {
            // Star-like with subtle variations
            ctx.beginPath();
            const points = 5 + Math.floor(snowflake.complexity * 3);
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const radius = snowflake.size * (0.3 + Math.random() * 0.4);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            
        } else if (snowflake.shapeType === 3) {
            // Irregular cluster
            ctx.beginPath();
            ctx.arc(0, 0, snowflake.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Add small surrounding dots
            const dots = 3 + Math.floor(snowflake.complexity * 4);
            for (let i = 0; i < dots; i++) {
                const angle = (i / dots) * Math.PI * 2 + snowflake.asymmetry;
                const dist = snowflake.size * (0.6 + Math.random() * 0.4);
                const dotSize = snowflake.size * 0.2 * (0.5 + Math.random() * 0.5);
                ctx.beginPath();
                ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, dotSize, 0, Math.PI * 2);
                ctx.fill();
            }
            
        } else {
            // Dendritic/branching (simplified and natural)
            const branches = 4 + Math.floor(snowflake.complexity * 2);
            ctx.lineWidth = snowflake.size * 0.15;
            ctx.strokeStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + finalOpacity + ')';
            ctx.lineCap = 'round';
            
            for (let i = 0; i < branches; i++) {
                const angle = (i / branches) * Math.PI * 2 + snowflake.asymmetry;
                const length = snowflake.size * (0.6 + Math.random() * 0.4);
                
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
                ctx.stroke();
                
                // Occasional small side branch
                if (Math.random() > 0.5) {
                    const branchPoint = length * (0.5 + Math.random() * 0.3);
                    const branchAngle = angle + (Math.random() - 0.5) * 1;
                    const branchLength = length * 0.3;
                    
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(angle) * branchPoint, Math.sin(angle) * branchPoint);
                    ctx.lineTo(
                        Math.cos(angle) * branchPoint + Math.cos(branchAngle) * branchLength,
                        Math.sin(angle) * branchPoint + Math.sin(branchAngle) * branchLength
                    );
                    ctx.stroke();
                }
            }
            
            // Center dot
            ctx.beginPath();
            ctx.arc(0, 0, snowflake.size * 0.25, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    function updateSnowflake(snowflake) {
        snowflake.y += snowflake.speed * speed;
        snowflake.x += snowflake.wind * speed;
        snowflake.rotation += snowflake.rotationSpeed * speed;
        
        // Very subtle drift changes
        if (Math.random() < 0.01) {
            snowflake.wind += (Math.random() - 0.5) * 0.05;
            snowflake.wind = Math.max(-0.5, Math.min(0.5, snowflake.wind));
        }
        
        // Reset snowflake when it goes off screen
        if (snowflake.y > canvas.height + 20) {
            snowflake.y = -20;
            snowflake.x = Math.random() * canvas.width;
            snowflake.size = Math.random() * 3.5 + 1;
            snowflake.shapeType = Math.floor(Math.random() * 5);
        }
        
        // Wrap horizontally
        if (snowflake.x < -20) snowflake.x = canvas.width + 20;
        if (snowflake.x > canvas.width + 20) snowflake.x = -20;
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        snowflakes.forEach(snowflake => {
            updateSnowflake(snowflake);
            drawSnowflake(snowflake);
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