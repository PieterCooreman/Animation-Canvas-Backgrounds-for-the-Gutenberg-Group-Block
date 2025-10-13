window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.constellation = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const stars = [];
    const starCount = 80;
    const speed = options.speed || 1;
    const color = options.color || '#0073aa';
    let animationId;
    let time = 0;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }  
    
    function createStar() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2 + 0.5,
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.05 + 0.02,
            brightness: Math.random() * 0.5 + 0.5
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
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkle);
        const currentBrightness = star.brightness + twinkle * 0.3;
        const currentSize = star.size + twinkle * 0.5;
        
        // Star core
        ctx.beginPath();
        ctx.arc(star.x, star.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * currentBrightness) + ')';
        ctx.fill();
        
        // Star glow
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, currentSize * 4);
        gradient.addColorStop(0, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * currentBrightness * 0.5) + ')');
        gradient.addColorStop(1, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0)');
        ctx.beginPath();
        ctx.arc(star.x, star.y, currentSize * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    
    function drawConnections() {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        const connectionDistance = 150;
        
        for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
                const dx = stars[i].x - stars[j].x;
                const dy = stars[i].y - stars[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    const opacity = baseAlpha * (1 - distance / connectionDistance) * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(stars[i].x, stars[i].y);
                    ctx.lineTo(stars[j].x, stars[j].y);
                    ctx.strokeStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + opacity + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }
    
    function updateStar(star) {
        star.x += star.vx * speed;
        star.y += star.vy * speed;
        
        // Wrap around edges
        if (star.x < -10) star.x = canvas.width + 10;
        if (star.x > canvas.width + 10) star.x = -10;
        if (star.y < -10) star.y = canvas.height + 10;
        if (star.y > canvas.height + 10) star.y = -10;
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawConnections();
        
        stars.forEach(star => {
            updateStar(star);
            drawStar(star);
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