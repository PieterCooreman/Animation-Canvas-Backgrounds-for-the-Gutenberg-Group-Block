window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.starfield = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const stars = [];
    const starCount = 200;
    const speed = options.speed || 1;
    const color = options.color || '#0073aa';
    let animationId;
    const maxZ = 1000;
    const centerSpeed = 0.5;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }    
    
    
    function createStar() {
        return {
            x: (Math.random() - 0.5) * 2000,
            y: (Math.random() - 0.5) * 2000,
            z: Math.random() * maxZ,
            prevX: null,
            prevY: null
        };
    }
    
    function init() {
        resizeCanvas();
        stars.length = 0;
        for (let i = 0; i < starCount; i++) {
            stars.push(createStar());
        }
    }
    
    function drawStar(star) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Calculate 3D projection
        const k = 128 / star.z;
        const px = star.x * k + centerX;
        const py = star.y * k + centerY;
        
        // Calculate star size based on distance
        const size = (1 - star.z / maxZ) * 3;
        const opacity = 1 - star.z / maxZ;
        
        // Draw star
        if (px > 0 && px < canvas.width && py > 0 && py < canvas.height) {
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * opacity) + ')';
            ctx.fill();
            
            // Draw motion trail
            if (star.prevX !== null && star.prevY !== null) {
                const gradient = ctx.createLinearGradient(star.prevX, star.prevY, px, py);
                gradient.addColorStop(0, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0)');
                gradient.addColorStop(1, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * opacity * 0.8) + ')');
                
                ctx.beginPath();
                ctx.moveTo(star.prevX, star.prevY);
                ctx.lineTo(px, py);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = size / 2;
                ctx.stroke();
            }
            
            // Update previous position
            star.prevX = px;
            star.prevY = py;
        } else {
            star.prevX = null;
            star.prevY = null;
        }
    }
    
    function updateStar(star) {
        // Move star towards viewer
        star.z -= speed * 5;
        
        // Move stars away from center for warp effect
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const k = 128 / star.z;
        const px = star.x * k + centerX;
        const py = star.y * k + centerY;
        
        const dx = px - centerX;
        const dy = py - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            star.x += (dx / distance) * centerSpeed * speed;
            star.y += (dy / distance) * centerSpeed * speed;
        }
        
        // Reset star if it goes behind viewer or off screen
        if (star.z <= 0 || 
            Math.abs(star.x * k) > canvas.width || 
            Math.abs(star.y * k) > canvas.height) {
            star.x = (Math.random() - 0.5) * 2000;
            star.y = (Math.random() - 0.5) * 2000;
            star.z = maxZ;
            star.prevX = null;
            star.prevY = null;
        }
    }
    
    function drawHyperspaceTunnel() {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Draw radial lines emanating from center
        const numLines = 12;
        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            const gradient = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, Math.min(canvas.width, canvas.height) * 0.5
            );
            gradient.addColorStop(0, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * 0.2) + ')');
            gradient.addColorStop(1, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0)');
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(angle) * canvas.width,
                centerY + Math.sin(angle) * canvas.height
            );
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw hyperspace effect when at high speed
        if (speed > 1.5) {
            drawHyperspaceTunnel();
        }
        
        // Sort stars by z-depth (draw far stars first)
        stars.sort((a, b) => b.z - a.z);
        
        stars.forEach(star => {
            updateStar(star);
            drawStar(star);
        });
        
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