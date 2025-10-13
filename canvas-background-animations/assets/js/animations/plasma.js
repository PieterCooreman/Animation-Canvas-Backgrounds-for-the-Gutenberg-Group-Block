window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.plasma = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const speed = options.speed || 1;
    const color = options.color || '#0073aa';
    let animationId;
    let time = 0;
    let imageData;
    
    function resizeCanvas() {
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        if (width === 0 || height === 0) {
            // Skip creating imageData if size is zero
            return;
        }
        canvas.width = width;
        canvas.height = height;
        imageData = ctx.createImageData(canvas.width, canvas.height);
    }    
    
    
    function init() {
        resizeCanvas();
    }
    
    function generatePlasma() {
        if (!imageData) {
            // If imageData not ready (canvas size zero), skip drawing this frame
            return;
        }
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        for (let y = 0; y < height; y += 2) {
            for (let x = 0; x < width; x += 2) {
                const value1 = Math.sin(x * 0.01 + time);
                const value2 = Math.sin(y * 0.01 + time * 1.2);
                const value3 = Math.sin((x + y) * 0.01 + time * 0.8);
                const value4 = Math.sin(Math.sqrt(x * x + y * y) * 0.01 + time);
                
                const plasma = (value1 + value2 + value3 + value4) / 4;
                const intensity = (plasma + 1) / 2;
                
                const index = (y * width + x) * 4;
                
                data[index] = rgb.r * intensity;
                data[index + 1] = rgb.g * intensity;
                data[index + 2] = rgb.b * (intensity * 0.8 + 0.2);
                data[index + 3] = 255 * baseAlpha * (intensity * 0.6 + 0.2);
                
                if (x < width - 1) {
                    const nextIndex = index + 4;
                    data[nextIndex] = data[index];
                    data[nextIndex + 1] = data[index + 1];
                    data[nextIndex + 2] = data[index + 2];
                    data[nextIndex + 3] = data[index + 3];
                }
                if (y < height - 1) {
                    const nextRowIndex = ((y + 1) * width + x) * 4;
                    data[nextRowIndex] = data[index];
                    data[nextRowIndex + 1] = data[index + 1];
                    data[nextRowIndex + 2] = data[index + 2];
                    data[nextRowIndex + 3] = data[index + 3];
                    
                    if (x < width - 1) {
                        const nextRowNextIndex = nextRowIndex + 4;
                        data[nextRowNextIndex] = data[index];
                        data[nextRowNextIndex + 1] = data[index + 1];
                        data[nextRowNextIndex + 2] = data[index + 2];
                        data[nextRowNextIndex + 3] = data[index + 3];
                    }
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    function animate() {
        generatePlasma();
        time += 0.03 * speed;
        animationId = requestAnimationFrame(animate);
    }
    
    setTimeout(() => {
        init();
        animate();
    }, 1000);
    
    window.addEventListener('resize', init);
    
    return function cleanup() {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', init);
    };
};