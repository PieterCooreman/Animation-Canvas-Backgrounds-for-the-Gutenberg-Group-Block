window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.helix = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 100;
    const speed = options.speed || 1;
    const color = options.color || '#0073aa';
    let animationId;
    let time = 0;
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }   
    
    
    function createParticle(index) {
        return {
            index: index,
            phase: (index / particleCount) * Math.PI * 8,
            size: 4
        };
    }
    
    function init() {
        resizeCanvas();
        particles.length = 0;
        for (let i = 0; i < particleCount; i++) {
            particles.push(createParticle(i));
        }
    }
    
    function drawParticle(particle, strand) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        const progress = particle.index / particleCount;
        const y = canvas.height * 0.2 + progress * canvas.height * 0.6;
        
        const radius = Math.min(canvas.width, canvas.height) * 0.15;
        const angle = particle.phase + time + (strand * Math.PI);
        const x = canvas.width / 2 + Math.cos(angle) * radius;
        const z = Math.sin(angle);
        
        // Calculate depth for perspective
        const scale = 0.5 + (z + 1) * 0.25;
        const alpha = 0.3 + (z + 1) * 0.35;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(x, y, particle.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * alpha) + ')';
        ctx.fill();
        
        // Draw glow
        ctx.beginPath();
        ctx.arc(x, y, particle.size * scale * 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (baseAlpha * alpha * 0.3) + ')';
        ctx.fill();
        
        return { x, y, z };
    }
    
    function drawConnections(positions1, positions2) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        
        for (let i = 0; i < positions1.length; i += 5) {
            if (positions1[i] && positions2[i]) {
                const avgZ = (positions1[i].z + positions2[i].z) / 2;
                const alpha = baseAlpha * (0.1 + (avgZ + 1) * 0.15);
                
                ctx.beginPath();
                ctx.moveTo(positions1[i].x, positions1[i].y);
                ctx.lineTo(positions2[i].x, positions2[i].y);
                ctx.strokeStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + alpha + ')';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const positions1 = [];
        const positions2 = [];
        
        // Draw first strand
        particles.forEach(particle => {
            const pos = drawParticle(particle, 0);
            positions1.push(pos);
        });
        
        // Draw second strand
        particles.forEach(particle => {
            const pos = drawParticle(particle, 1);
            positions2.push(pos);
        });
        
        // Draw connections between strands
        drawConnections(positions1, positions2);
        
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