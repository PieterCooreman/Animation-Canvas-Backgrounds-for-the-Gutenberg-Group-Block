window.CanvasAnimations = window.CanvasAnimations || {};

window.CanvasAnimations.leaves = function(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const leaves = [];
    const leafCount = 25;
    const speed = options.speed || 1;
    const color = options.color || '#d2691e';
    let animationId;
    let time = 0;
    
    // Autumn color palette
    const autumnColors = [
        { r: 210, g: 105, b: 30 },   // Chocolate/brown
        { r: 255, g: 140, b: 0 },    // Dark orange
        { r: 255, g: 69, b: 0 },     // Red-orange
        { r: 218, g: 165, b: 32 },   // Goldenrod
        { r: 139, g: 69, b: 19 },    // Saddle brown
        { r: 255, g: 215, b: 0 },    // Gold
        { r: 178, g: 34, b: 34 }     // Firebrick red
    ];
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    function createLeaf() {
        // Choose a random autumn color
        const leafColor = autumnColors[Math.floor(Math.random() * autumnColors.length)];
        
        return {
            x: Math.random() * canvas.width,
            y: -20,
            width: Math.random() * 15 + 10,
            height: Math.random() * 20 + 15,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            fallSpeed: Math.random() * 1.5 + 0.8,
            swayAmplitude: Math.random() * 40 + 20,
            swaySpeed: Math.random() * 0.015 + 0.01,
            swayOffset: Math.random() * Math.PI * 2,
            tumble: Math.random() * Math.PI * 2,
            tumbleSpeed: Math.random() * 0.05 + 0.02,
            alpha: Math.random() * 0.3 + 0.7,
            color: leafColor,
            leafType: Math.floor(Math.random() * 3), // Different leaf shapes
            flutterPhase: Math.random() * Math.PI * 2
        };
    }
    
    function init() {
        resizeCanvas();
        leaves.length = 0;
        for (let i = 0; i < leafCount; i++) {
            const leaf = createLeaf();
            leaf.y = Math.random() * canvas.height;
            leaves.push(leaf);
        }
    }
    
    function drawLeaf(leaf) {
        const rgb = parseColor(color);
        const baseAlpha = rgb.a !== undefined ? rgb.a : 1;
        
        // Blend the autumn color with the provided color
        const blendFactor = 0.7; // 70% autumn color, 30% provided color
        const r = Math.round(leaf.color.r * blendFactor + rgb.r * (1 - blendFactor));
        const g = Math.round(leaf.color.g * blendFactor + rgb.g * (1 - blendFactor));
        const b = Math.round(leaf.color.b * blendFactor + rgb.b * (1 - blendFactor));
        
        const sway = Math.sin(time * leaf.swaySpeed + leaf.swayOffset) * leaf.swayAmplitude;
        const flutter = Math.sin(time * 3 + leaf.flutterPhase) * 0.3 + 0.7;
        const finalAlpha = baseAlpha * leaf.alpha * flutter;
        
        ctx.save();
        ctx.translate(leaf.x + sway, leaf.y);
        ctx.rotate(leaf.rotation);
        
        const leafWidth = leaf.width;
        const leafHeight = leaf.height;
        
        // Create gradient for depth
        const gradient = ctx.createLinearGradient(-leafWidth/2, -leafHeight/2, leafWidth/2, leafHeight/2);
        gradient.addColorStop(0, 'rgba(' + r + ', ' + g + ', ' + b + ', ' + finalAlpha + ')');
        gradient.addColorStop(0.5, 'rgba(' + Math.min(255, r + 20) + ', ' + Math.min(255, g + 20) + ', ' + Math.min(255, b + 20) + ', ' + finalAlpha + ')');
        gradient.addColorStop(1, 'rgba(' + Math.max(0, r - 30) + ', ' + Math.max(0, g - 30) + ', ' + Math.max(0, b - 30) + ', ' + finalAlpha + ')');
        
        ctx.fillStyle = gradient;
        
        if (leaf.leafType === 0) {
            // Oval leaf (simple)
            ctx.beginPath();
            ctx.ellipse(0, 0, leafWidth / 2, leafHeight / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Center vein
            ctx.strokeStyle = 'rgba(' + Math.max(0, r - 50) + ', ' + Math.max(0, g - 50) + ', ' + Math.max(0, b - 50) + ', ' + (finalAlpha * 0.5) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, -leafHeight / 2);
            ctx.lineTo(0, leafHeight / 2);
            ctx.stroke();
            
        } else if (leaf.leafType === 1) {
            // Maple-style pointed leaf
            ctx.beginPath();
            ctx.moveTo(0, -leafHeight / 2);
            ctx.lineTo(leafWidth / 3, -leafHeight / 6);
            ctx.lineTo(leafWidth / 2, 0);
            ctx.lineTo(leafWidth / 4, leafHeight / 3);
            ctx.lineTo(0, leafHeight / 2);
            ctx.lineTo(-leafWidth / 4, leafHeight / 3);
            ctx.lineTo(-leafWidth / 2, 0);
            ctx.lineTo(-leafWidth / 3, -leafHeight / 6);
            ctx.closePath();
            ctx.fill();
            
            // Veins
            ctx.strokeStyle = 'rgba(' + Math.max(0, r - 50) + ', ' + Math.max(0, g - 50) + ', ' + Math.max(0, b - 50) + ', ' + (finalAlpha * 0.4) + ')';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(0, -leafHeight / 2);
            ctx.lineTo(0, leafHeight / 2);
            ctx.stroke();
            
        } else {
            // Oak-style lobed leaf
            ctx.beginPath();
            ctx.moveTo(0, -leafHeight / 2);
            
            // Right side with lobes
            ctx.quadraticCurveTo(leafWidth / 3, -leafHeight / 3, leafWidth / 4, -leafHeight / 6);
            ctx.quadraticCurveTo(leafWidth / 2, -leafHeight / 8, leafWidth / 3, 0);
            ctx.quadraticCurveTo(leafWidth / 2, leafHeight / 6, leafWidth / 4, leafHeight / 3);
            ctx.quadraticCurveTo(leafWidth / 5, leafHeight / 2, 0, leafHeight / 2);
            
            // Left side with lobes
            ctx.quadraticCurveTo(-leafWidth / 5, leafHeight / 2, -leafWidth / 4, leafHeight / 3);
            ctx.quadraticCurveTo(-leafWidth / 2, leafHeight / 6, -leafWidth / 3, 0);
            ctx.quadraticCurveTo(-leafWidth / 2, -leafHeight / 8, -leafWidth / 4, -leafHeight / 6);
            ctx.quadraticCurveTo(-leafWidth / 3, -leafHeight / 3, 0, -leafHeight / 2);
            
            ctx.closePath();
            ctx.fill();
            
            // Center vein
            ctx.strokeStyle = 'rgba(' + Math.max(0, r - 50) + ', ' + Math.max(0, g - 50) + ', ' + Math.max(0, b - 50) + ', ' + (finalAlpha * 0.4) + ')';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(0, -leafHeight / 2);
            ctx.lineTo(0, leafHeight / 2);
            ctx.stroke();
        }
        
        // Add subtle outline
        ctx.strokeStyle = 'rgba(' + Math.max(0, r - 40) + ', ' + Math.max(0, g - 40) + ', ' + Math.max(0, b - 40) + ', ' + (finalAlpha * 0.3) + ')';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        
        ctx.restore();
    }
    
    function updateLeaf(leaf) {
        // Fall downward
        leaf.y += leaf.fallSpeed * speed;
        
        // Tumble rotation
        leaf.rotation += leaf.rotationSpeed * speed;
        
        // Add flutter effect - leaves slow down and speed up
        const flutter = Math.sin(time * 2 + leaf.flutterPhase);
        leaf.y += flutter * 0.2 * speed;
        
        // Occasional direction change for more natural movement
        if (Math.random() < 0.01) {
            leaf.rotationSpeed += (Math.random() - 0.5) * 0.02;
            leaf.rotationSpeed = Math.max(-0.15, Math.min(0.15, leaf.rotationSpeed));
        }
        
        // Reset when off screen
        if (leaf.y > canvas.height + leaf.height) {
            leaf.y = -leaf.height;
            leaf.x = Math.random() * canvas.width;
            leaf.color = autumnColors[Math.floor(Math.random() * autumnColors.length)];
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        leaves.forEach(leaf => {
            updateLeaf(leaf);
            drawLeaf(leaf);
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