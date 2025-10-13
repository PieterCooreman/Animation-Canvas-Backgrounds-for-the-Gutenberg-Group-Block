<?php
class Canvas_Background_Animations {
    
    private $animation_scripts = array();
    
    public function __construct() {
        add_action('init', array($this, 'register_scripts'));
        add_action('enqueue_block_editor_assets', array($this, 'enqueue_editor_assets'));
        add_action('enqueue_block_assets', array($this, 'enqueue_block_assets'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
        add_filter('render_block', array($this, 'render_canvas_animation'), 10, 2);
    }
    
    /**
     * Get all animation JavaScript files from the animations directory
     */
    private function get_animation_files() {
        $plugin_dir = dirname(dirname(__FILE__)) . '/';
        $animations_dir = $plugin_dir . 'assets/js/animations/';
        $animation_files = array();
        
        if (is_dir($animations_dir)) {
            $files = glob($animations_dir . '*.js');
            
            foreach ($files as $file) {
                $filename = basename($file, '.js');
                $animation_files[$filename] = $file;
            }
        }
        
        return $animation_files;
    }
    
	 public function register_scripts() {
		// Register editor script
		wp_register_script(
			'cba-editor',
			CBA_PLUGIN_URL . 'assets/js/editor.js',
			array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-data', 'wp-hooks', 'wp-compose'),
			CBA_PLUGIN_VERSION,
			true
		);
		
		// Register frontend script
		wp_register_script(
			'cba-frontend',
			CBA_PLUGIN_URL . 'assets/js/frontend.js',
			array('cba-colors'),  // Add dependency
			CBA_PLUGIN_VERSION,
			true
		);
		
		// Register colors utility first
        wp_register_script(
            'cba-colors',
            CBA_PLUGIN_URL . 'assets/js/utils/colors.js',
            array(),
            CBA_PLUGIN_VERSION,
            true
        );
		
		// Dynamically register animation scripts
		$animation_files = $this->get_animation_files();
		
		foreach ($animation_files as $animation_name => $file_path) {
			$handle = 'cba-' . $animation_name;
			
			wp_register_script(
				$handle,
				CBA_PLUGIN_URL . 'assets/js/animations/' . $animation_name . '.js',
				array(),
				CBA_PLUGIN_VERSION,
				true
			);
			
			$this->animation_scripts[] = $handle;
		}
		
        
        // Register styles
        wp_register_style(
            'cba-editor-style',
            CBA_PLUGIN_URL . 'assets/css/editor.css',
            array(),
            CBA_PLUGIN_VERSION
        );
        
        wp_register_style(
            'cba-frontend-style',
            CBA_PLUGIN_URL . 'assets/css/frontend.css',
            array(),
            CBA_PLUGIN_VERSION
        );
    }
    
    public function enqueue_editor_assets() {
		// Enqueue the editor JS
		wp_enqueue_script('cba-editor');

		// Enqueue editor-specific styles
		wp_enqueue_style('cba-editor-style');

		// Enqueue all animation scripts in editor
		foreach ($this->animation_scripts as $handle) {
			wp_enqueue_script($handle);
		}
		
		// Also enqueue the frontend script that contains animation initialization
		wp_enqueue_script('cba-frontend');
		
		// Pass data to JavaScript
		wp_localize_script('cba-editor', 'cbaData', array(
			'pluginUrl' => CBA_PLUGIN_URL,
			'animations' => $this->get_animation_list()
		));
	}

    public function enqueue_block_assets() {
        // Enqueue styles in both editor and frontend
        wp_enqueue_style('cba-frontend-style');
    }
    
    public function enqueue_frontend_assets() {
        if (has_block('core/group')) {
            wp_enqueue_script('cba-frontend');
            wp_enqueue_style('cba-frontend-style');
            
            // Enqueue all animation scripts
            foreach ($this->animation_scripts as $handle) {
                wp_enqueue_script($handle);
            }
        }
    }
    
    public function render_canvas_animation($block_content, $block) {
        // Only run this on the frontend
        if (is_admin()) {
            return $block_content;
        }

        if ($block['blockName'] !== 'core/group') {
            return $block_content;
        }
        
        if (!empty($block['attrs']['enableCanvasAnimation'])) {
            $animation_data = array(
                'type' => $block['attrs']['animationType'] ?? 'aurora',
                'speed' => $block['attrs']['animationSpeed'] ?? 1,
                'color' => $block['attrs']['animationColor'] ?? '#0073aa',
            );
            
            if ($animation_data['type'] === 'custom') {
                $animation_data['customCode'] = $block['attrs']['customAnimationCode'] ?? '';
            }
            
            $data_attribute = esc_attr(json_encode($animation_data));
            
            // Add data attribute and CSS class to the group block
            $block_content = str_replace(
                'class="wp-block-group',
                'data-canvas-animation="' . $data_attribute . '" class="wp-block-group has-canvas-animation',
                $block_content
            );
        }
        
        return $block_content;
    }
    
    /**
     * Dynamically generate animation list from available files
     */
    private function get_animation_list() {
        $animation_files = $this->get_animation_files();
        $animations = array();
        
        foreach ($animation_files as $animation_name => $file_path) {
            // Convert filename to a readable label
            $label = ucwords(str_replace(array('-', '_'), ' ', $animation_name));
            
            $animations[] = array(
                'value' => $animation_name,
                'label' => $label
            );
        }
        
        return $animations;
    }
}