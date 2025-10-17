<?php
/**
 * WordPress Shortcode for Estimate Calculator
 * 
 * This file provides the shortcode functionality to embed the React Estimate Calculator
 * into WordPress pages and posts.
 * 
 * Usage: [estimate_calculator]
 * 
 * Optional parameters:
 * - container_id: Custom container ID (default: estimate-calculator-app)
 * - category: Pre-select a specific category
 * - width: Set container width (default: 100%)
 * - height: Set container height (default: auto)
 * 
 * Example: [estimate_calculator container_id="my-calculator" category="kitchens" width="800px"]
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class EstimateCalculatorShortcode {
    
    private static $instance = null;
    private $script_enqueued = false;
    
    public static function getInstance() {
        if (self::$instance == null) {
            self::$instance = new EstimateCalculatorShortcode();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_shortcode('estimate_calculator', array($this, 'render_shortcode'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }
    
    /**
     * Enqueue the React app scripts and styles
     */
    public function enqueue_scripts() {
        // Only enqueue if shortcode is used on the page
        global $post;
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'estimate_calculator')) {
            
            // Get the build files - these paths should match your React build output
            $build_path = plugin_dir_url(__FILE__) . '../build/';
            
            // Enqueue CSS
            wp_enqueue_style(
                'estimate-calculator-css',
                $build_path . 'static/css/main.css', // Adjust path as needed
                array(),
                filemtime(plugin_dir_path(__FILE__) . '../build/static/css/main.css')
            );
            
            // Enqueue JS
            wp_enqueue_script(
                'estimate-calculator-js',
                $build_path . 'static/js/main.js', // Adjust path as needed
                array(),
                filemtime(plugin_dir_path(__FILE__) . '../build/static/js/main.js'),
                true
            );
            
            // Add inline script to initialize the app
            wp_add_inline_script('estimate-calculator-js', '
                document.addEventListener("DOMContentLoaded", function() {
                    if (window.EstimateCalculator && window.EstimateCalculator.init) {
                        window.EstimateCalculator.init();
                    }
                });
            ');
        }
    }
    
    /**
     * Render the shortcode
     */
    public function render_shortcode($atts) {
        // Parse shortcode attributes
        $attributes = shortcode_atts(array(
            'container_id' => 'estimate-calculator-app',
            'category' => '',
            'width' => '100%',
            'height' => 'auto',
            'class' => 'estimate-calculator-container'
        ), $atts, 'estimate_calculator');
        
        // Sanitize attributes
        $container_id = sanitize_html_class($attributes['container_id']);
        $category = sanitize_text_field($attributes['category']);
        $width = sanitize_text_field($attributes['width']);
        $height = sanitize_text_field($attributes['height']);
        $css_class = sanitize_html_class($attributes['class']);
        
        // Build the container HTML
        $style = sprintf('width: %s; height: %s;', $width, $height);
        
        $html = sprintf(
            '<div id="%s" class="%s estimate-calculator" style="%s" data-category="%s"></div>',
            esc_attr($container_id),
            esc_attr($css_class),
            esc_attr($style),
            esc_attr($category)
        );
        
        // Add loading message
        $html .= '<script>
            document.getElementById("' . esc_js($container_id) . '").innerHTML = "<div style=\"text-align: center; padding: 40px;\"><p>Loading Estimate Calculator...</p></div>";
        </script>';
        
        return $html;
    }
}

// Initialize the shortcode
EstimateCalculatorShortcode::getInstance();

/**
 * Alternative function-based approach (simpler but less flexible)
 */
function estimate_calculator_shortcode_simple($atts) {
    $atts = shortcode_atts(array(
        'id' => 'estimate-calculator-app'
    ), $atts);
    
    return '<div id="' . esc_attr($atts['id']) . '" class="estimate-calculator"></div>';
}
// Uncomment to use the simple version instead:
// add_shortcode('estimate_calculator', 'estimate_calculator_shortcode_simple');

?>
