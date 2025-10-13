(function() {
    'use strict';

    // WordPress dependencies
    const { addFilter } = wp.hooks;
    const { createHigherOrderComponent } = wp.compose;
    const { Fragment, createElement: el, useEffect, useRef } = wp.element;
    const { InspectorControls, ColorPalette } = wp.blockEditor;
    const { PanelBody, ToggleControl, SelectControl, RangeControl, TextareaControl } = wp.components;
    const { useSelect } = wp.data;

    /**
     * Adds custom attributes for canvas animation to the core/group block.
     */
    function addCanvasAttributes(settings, name) {
        if (name !== 'core/group') {
            return settings;
        }

        settings.attributes = {
            ...settings.attributes,
            enableCanvasAnimation: { type: 'boolean', default: false },
            animationType: { type: 'string', default: 'aurora' },
            animationSpeed: { type: 'number', default: 1 },
            animationColor: { type: 'string', default: '#888888' },
            customAnimationCode: { type: 'string', default: '' }
        };

        return settings;
    }

    /**
     * A Higher-Order Component to add canvas animation controls and render the animation
     * within the block editor.
     */
    const withCanvasControls = createHigherOrderComponent((BlockEdit) => {
        return (props) => {
            const { attributes, setAttributes, name, clientId } = props;
            const {
                enableCanvasAnimation,
                animationType,
                animationSpeed,
                animationColor,
                customAnimationCode
            } = attributes;

            // Refs to manage the canvas, animation instance, and resize observer
            const canvasRef = useRef(null);
            const animationCleanupRef = useRef(null);
            const observerRef = useRef(null);
            const parentNodeRef = useRef(null);
            const retryTimeoutRef = useRef(null);

            // Main effect for creating and managing the canvas animation
            useEffect(() => {
                if (name !== 'core/group') {
                    return;
                }

                // --- Full Cleanup Logic ---
                const cleanup = () => {
                    // Clear any pending retry timeouts
                    if (retryTimeoutRef.current) {
                        clearTimeout(retryTimeoutRef.current);
                        retryTimeoutRef.current = null;
                    }

                    // Stop animation
                    if (animationCleanupRef.current) {
                        try {
                            animationCleanupRef.current();
							parentNodeRef.current.removeAttribute('data-cba-active');

                        } catch (e) {
                            console.warn('Canvas Animation cleanup error:', e);
                        }
                        animationCleanupRef.current = null;
                    }

                    // Disconnect observer
                    if (observerRef.current) {
                        observerRef.current.disconnect();
                        observerRef.current = null;
                    }

                    // Remove canvas
                    if (canvasRef.current && canvasRef.current.parentNode) {
                        canvasRef.current.remove();
                        canvasRef.current = null;
                    }

                    // Reset parent node styles
                    if (parentNodeRef.current && parentNodeRef.current.dataset.cbaModified) {
                        delete parentNodeRef.current.dataset.cbaModified;
                    }
                    parentNodeRef.current = null;
                };

                // If animation is disabled, run cleanup and exit.
                if (!enableCanvasAnimation) {
                    cleanup();
                    return;
                }

                // --- Setup Logic ---
                const attemptInit = (retryCount = 0) => {
                    const maxRetries = 20;
                    
                    // Find the editor canvas iframe first
                    let searchRoot = document;
                    const editorCanvas = document.querySelector('iframe[name="editor-canvas"]');
                    if (editorCanvas && editorCanvas.contentDocument) {
                        searchRoot = editorCanvas.contentDocument;
                    }
                    
                    // Find block using multiple methods in the correct document context
                    let blockNode = searchRoot.querySelector(`[data-block="${clientId}"]`);
                    if (!blockNode) {
                        blockNode = searchRoot.getElementById('block-' + clientId);
                    }
                    if (!blockNode) {
                        blockNode = searchRoot.querySelector(`#block-${clientId}`);
                    }
                    
                    if (!blockNode) {
                        if (retryCount < maxRetries) {
                            retryTimeoutRef.current = setTimeout(() => attemptInit(retryCount + 1), 100);
                        }
                        return;
                    }

                    // Find the actual group block container
                    let container = blockNode.querySelector('.wp-block-group');
                    
                    if (!container && blockNode.classList.contains('wp-block-group')) {
                        container = blockNode;
                    }
                    
                    if (!container) {
                        const wrapper = blockNode.closest('[data-type="core/group"]');
                        if (wrapper) {
                            container = wrapper.querySelector('.wp-block-group');
                            if (!container && wrapper.classList.contains('wp-block-group')) {
                                container = wrapper;
                            }
                        }
                    }
                    
                    if (!container) {
                        if (retryCount < maxRetries) {
                            retryTimeoutRef.current = setTimeout(() => attemptInit(retryCount + 1), 100);
                        }
                        return;
                    }

                    // Clean up any existing canvas before creating new one
                    const existingCanvas = container.querySelector('.cba-canvas-bg');
                    if (existingCanvas) {
                        existingCanvas.remove();
                    }

                    parentNodeRef.current = container;

                    // Set container position
                    const computedStyle = getComputedStyle(container);
                    if (computedStyle.position === 'static') {
                        container.style.position = 'relative';
                        container.dataset.cbaModified = 'true';
                    }

                    // Get the correct document context for createElement
                    const doc = container.ownerDocument || document;
                    
                    // Create and configure the canvas element
                    const canvas = doc.createElement('canvas');
                    canvas.className = 'cba-canvas-bg';
                    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
					
					container.setAttribute('data-cba-active', 'true');


                    // Insert canvas at the beginning
                    container.insertBefore(canvas, container.firstChild);
                    canvasRef.current = canvas;

                    // Ensure content is above canvas
                    Array.from(container.children).forEach((child) => {
                        if (child !== canvas) {
                            const childStyle = getComputedStyle(child);
                            if (childStyle.position === 'static') {
                                child.style.position = 'relative';
                                child.style.zIndex = '1';
                            }
                        }
                    });

                    // Function to resize canvas
                    const resizeCanvas = () => {
                        if (canvas && container) {
                            const rect = container.getBoundingClientRect();
                            const width = rect.width || container.offsetWidth || container.clientWidth;
                            const height = rect.height || container.offsetHeight || container.clientHeight;
                            
                            if (width > 0 && height > 0) {
                                canvas.width = width;
                                canvas.height = height;
                                return true;
                            }
                        }
                        return false;
                    };

                    // Initial resize with retry
                    const tryResize = (attempts = 0) => {
                        if (resizeCanvas()) {
                            // Canvas sized successfully, start animation immediately
                            startAnimation();
                        } else if (attempts < 10) {
                            setTimeout(() => tryResize(attempts + 1), 50);
                        }
                    };

                    // Try immediately, then with small delays if needed
                    tryResize();

                    // Setup ResizeObserver
                    try {
                        const ResizeObserverClass = container.ownerDocument?.defaultView?.ResizeObserver || window.ResizeObserver;
                        if (ResizeObserverClass) {
                            const observer = new ResizeObserverClass(() => {
                                resizeCanvas();
                            });
                            observer.observe(container);
                            observerRef.current = observer;
                        }
                    } catch (e) {
                        // Fallback to window resize if ResizeObserver fails
                        const resizeHandler = () => resizeCanvas();
                        const targetWindow = container.ownerDocument?.defaultView || window;
                        targetWindow.addEventListener('resize', resizeHandler);
                        observerRef.current = { 
                            disconnect: () => targetWindow.removeEventListener('resize', resizeHandler) 
                        };
                    }

                    // Function to start animation
                    function startAnimation() {
                        const options = {
                            speed: animationSpeed || 1,
                            color: animationColor || '#888888',
                        };

                        let cleanupFunc = null;

                        try {
                            if (animationType === 'custom' && customAnimationCode) {
                                const customFunc = new Function('canvas', 'options', customAnimationCode);
                                cleanupFunc = customFunc(canvas, options);
                            } else if (window.CanvasAnimations && typeof window.CanvasAnimations[animationType] === 'function') {
                                cleanupFunc = window.CanvasAnimations[animationType](canvas, options);
                            }

                            if (typeof cleanupFunc === 'function') {
                                animationCleanupRef.current = cleanupFunc;
                            }
                        } catch (error) {
                            console.error('Canvas Animation error:', error);
                        }
                    }
                };

                // Start initialization
                attemptInit();

                // Return cleanup function
                return cleanup;
            }, [name, clientId, enableCanvasAnimation, animationType, animationSpeed, animationColor, customAnimationCode]);

            if (name !== 'core/group') {
                return el(BlockEdit, props);
            }

            // Define animation choices for the dropdown
            const animationOptions = window.cbaData?.animations || [
                { value: 'particles', label: 'Particles' },
                { value: 'waves', label: 'Waves' },
                { value: 'bubbles', label: 'Bubbles' },
                { value: 'ripples', label: 'Ripples' },
            ];

            // Get theme colors for the color palette
            const themeColors = useSelect((select) => {
                const settings = select('core/block-editor').getSettings();
                return settings?.colors || [];
            }, []);

            return el(
                Fragment,
                {},
                el(BlockEdit, props),
                el(
                    InspectorControls,
                    {},
                    el(
                        PanelBody,
                        { title: 'Canvas Background Animation', initialOpen: true },
                        el(ToggleControl, {
                            label: 'Enable Animation',
                            checked: !!enableCanvasAnimation,
                            onChange: (value) => setAttributes({ enableCanvasAnimation: value }),
                        }),
                        enableCanvasAnimation && el(
                            Fragment,
                            {},
                            el(SelectControl, {
                                label: 'Animation Type',
                                value: animationType,
                                options: animationOptions,
                                onChange: (value) => setAttributes({ animationType: value }),
                            }),
                            el(RangeControl, {
                                label: 'Animation Speed',
                                value: animationSpeed,
                                onChange: (value) => setAttributes({ animationSpeed: value }),
                                min: 0.1, max: 5, step: 0.1,
                            }),
                            el('div', { className: 'components-base-control' },
                                el('label', { className: 'components-base-control__label' }, 'Animation Color'),
                                el(ColorPalette, {
                                    value: animationColor,
                                    colors: themeColors,
                                    onChange: (newColor) => setAttributes({ animationColor: newColor }),
                                    disableCustomColors: false,
                                    enableAlpha: true
                                })
                            ),
                            animationType === 'custom' && el(TextareaControl, {
                                label: 'Custom Animation Code',
                                help: 'Enter JS that takes (canvas, options) and returns a cleanup function.',
                                value: customAnimationCode,
                                onChange: (value) => setAttributes({ customAnimationCode: value }),
                                rows: 10,
                            })
                        )
                    )
                )
            );
        };
    }, 'withCanvasControls');

    /**
     * Adds data attributes to the saved group block for frontend script to use.
     */
    function addCanvasProps(extraProps, blockType, attributes) {
        if (blockType.name !== 'core/group' || !attributes.enableCanvasAnimation) {
            return extraProps;
        }

        const animationData = {
            type: attributes.animationType,
            speed: attributes.animationSpeed,
            color: attributes.animationColor || '#888888'
        };

        if (attributes.animationType === 'custom') {
            animationData.customCode = attributes.customAnimationCode;
        }

        extraProps['data-canvas-animation'] = JSON.stringify(animationData);

        return extraProps;
    }

    // Register all the filters with WordPress
    addFilter('blocks.registerBlockType', 'canvas-bg-animations/add-attributes', addCanvasAttributes);
    addFilter('editor.BlockEdit', 'canvas-bg-animations/with-controls', withCanvasControls);
    addFilter('blocks.getSaveContent.extraProps', 'canvas-bg-animations/add-props', addCanvasProps);
})();