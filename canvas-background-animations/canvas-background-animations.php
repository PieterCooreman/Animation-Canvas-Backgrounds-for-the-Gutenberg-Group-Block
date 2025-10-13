<?php
/**
 * Plugin Name: Canvas Background Animations
 * Description: Add beautiful canvas background animations to Gutenberg Group blocks
 * Version: 1.0.0
 * Author: Pieter Cooreman
 * Text Domain: canvas-bg-animations
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('CBA_PLUGIN_URL', plugin_dir_url(__FILE__));
define('CBA_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('CBA_PLUGIN_VERSION', '1.0.0');

// Include main class
require_once CBA_PLUGIN_PATH . 'includes/class-canvas-animations.php';

// Initialize plugin
function cba_init() {
    new Canvas_Background_Animations();
}

add_action('plugins_loaded', 'cba_init');
