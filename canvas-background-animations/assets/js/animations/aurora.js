window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.aurora = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const speed = options.speed || 1;
    const color = options.color || '#0073aa';
    let animationId;
    let time = 0;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    function drawAuroraLayer(offset, amplitude, frequency, colorShift, alphaMult) {
        const col = parseColor(color);
        const points = [];
        
        for (let x = 0; x <= canvas.width; x += 10) {
            const y1 = canvas.height * 0.3 + 
                      Math.sin((x * frequency) + time + offset) * amplitude +
                      Math.sin((x * frequency * 2) + time * 1.3) * amplitude * 0.5;
            points.push({ x, y: y1 });
        }
        
        for (let i = 0; i < points.length - 1; i++) {
            const gradient = ctx.createLinearGradient(
                points[i].x, points[i].y,
                points[i].x, points[i].y + 100
            );
            
            const r = Math.max(0, Math.min(255, col.r + colorShift));
            const g = Math.max(0, Math.min(255, col.g + colorShift));
            const b = Math.max(0, Math.min(255, col.b + colorShift));
            const a = (col.a !== undefined ? col.a : 1) * alphaMult;
            
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[i + 1].x, points[i + 1].y);
            ctx.lineTo(points[i + 1].x, points[i + 1].y + 100);
            ctx.lineTo(points[i].x, points[i].y + 100);
            ctx.closePath();
            
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawAuroraLayer(0, 40, 0.005, 50, 0.15);
        drawAuroraLayer(1, 50, 0.004, -30, 0.12);
        drawAuroraLayer(2, 35, 0.006, 20, 0.1);
        drawAuroraLayer(3, 45, 0.0045, 70, 0.08);
        
        time += 0.015 * speed;
        
        animationId = requestAnimationFrame(animate);
    }
    
    setTimeout(resizeCanvas, 500);
    setTimeout(animate, 500);
    window.addEventListener('resize', resizeCanvas);
    
    return function cleanup() {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', resizeCanvas);
    };
};