// Global alpha-supporting color parser
window.CBA_parseColor = function(colorString) {
    const rgbaMatch = colorString.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)\)$/);
    if (rgbaMatch) {
        return {
            r: parseInt(rgbaMatch[1]),
            g: parseInt(rgbaMatch[2]),
            b: parseInt(rgbaMatch[3]),
            a: rgbaMatch[4] === '' ? 1 : parseFloat(rgbaMatch[4])
        };
    }
    const hex = colorString.replace('#', '');
    if (hex.length === 8) { // RRGGBBAA
        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16),
            a: parseInt(hex.slice(6, 8), 16) / 255
        };
    }
    if (hex.length === 6) {
        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16),
            a: 1
        };
    }
    return { r: 0, g: 115, b: 170, a: 1 };
};

document.addEventListener('DOMContentLoaded', function () {
    const groupBlocks = document.querySelectorAll('.wp-block-group[data-canvas-animation]');

    // Track which blocks we've already initialized
    const initializedBlocks = new WeakSet();

    // Monkey patch all global color parsers
    window.hexToRgb = window.CBA_parseColor;
    window.parseColor = window.CBA_parseColor;

    groupBlocks.forEach((block) => {
        if (initializedBlocks.has(block)) return;

        const animationData = block.getAttribute('data-canvas-animation');
        if (!animationData) return;

        try {
            const config = JSON.parse(animationData);
            initializeCanvas(block, config);
            initializedBlocks.add(block);
        } catch (error) {
            console.error('Failed to parse animation data:', error);
        }
    });

    function initializeCanvas(container, config) {
        if (container.querySelector('.cba-canvas-bg')) {
            console.warn('Canvas already exists in container, skipping initialization');
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.className = 'cba-canvas-bg';

        // Ensure container has relative positioning
        const style = window.getComputedStyle(container);
        if (style.position === 'static') {
            container.style.position = 'relative';
        }

        container.insertBefore(canvas, container.firstChild);

        function resizeCanvas() {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        }
        resizeCanvas();

        const resizeHandler = () => resizeCanvas();
        window.addEventListener('resize', resizeHandler);

        const options = {
            speed: config.speed || 1,
            color: config.color || '#0073aa'
        };

        let cleanup = null;

        if (config.type === 'custom' && config.code) {
            try {
                const customFunc = new Function('canvas', 'options', config.code);
                cleanup = customFunc(canvas, options);
                if (typeof cleanup === 'function') {
                    canvas._cleanup = cleanup;
                }
            } catch (error) {
                console.error('Custom animation error:', error);
            }
        } else if (window.CanvasAnimations && typeof window.CanvasAnimations[config.type] === 'function') {
            try {
                cleanup = window.CanvasAnimations[config.type](canvas, options);
                if (typeof cleanup === 'function') {
                    canvas._cleanup = cleanup;
                }
            } catch (error) {
                console.error('Animation initialization error:', error);
            }
        } else {
            console.warn(`Animation type "${config.type}" not found in window.CanvasAnimations`);
        }

        canvas._resizeHandler = resizeHandler;
    }
});
