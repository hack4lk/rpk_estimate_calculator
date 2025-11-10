<?php
/**
 * WordPress Category Slugs Configuration Example
 * 
 * This file shows how to implement the calculator-category-slugs endpoint
 * in your WordPress plugin to support dynamic category slug configuration.
 */

// Add this to your WordPress plugin's main file or functions.php

/**
 * Handle calculator-category-slugs endpoint
 */
function handle_calculator_category_slugs_request() {
    // Check if this is a request for category slugs
    if (isset($_GET['slug']) && $_GET['slug'] === 'calculator-category-slugs') {
        
        // Option 1: Store in WordPress options table
        $category_slugs = get_option('calculator_category_slugs', array(
            'kitchens' => 'calculator-kitchens',
            'bathrooms' => 'calculator-bathrooms',
            'basements' => 'calculator-basements',
            'windows' => 'calculator-windows',
            'flooring' => 'calculator-flooring',
            'home-renovations' => 'calculator-renovations',
            'structural' => 'calculator-structural'
        ));
        
        // Option 2: Store in a custom post meta (alternative approach)
        /*
        $config_post = get_posts(array(
            'name' => 'calculator-category-slugs',
            'post_type' => 'calculator_config',
            'post_status' => 'publish',
            'numberposts' => 1
        ));
        
        if ($config_post) {
            $category_slugs_json = get_post_meta($config_post[0]->ID, 'category_slugs', true);
            $category_slugs = json_decode($category_slugs_json, true);
        }
        */
        
        // Return the response in the expected format
        wp_send_json(array(
            'success' => true,
            'category_slugs' => $category_slugs,
            'timestamp' => time()
        ));
        
        exit;
    }
}

// Hook into WordPress initialization
add_action('init', 'handle_calculator_category_slugs_request');

/**
 * Add admin interface to manage category slugs
 */
function add_calculator_category_slugs_admin_menu() {
    add_options_page(
        'Calculator Category Slugs',
        'Calculator Slugs',
        'manage_options',
        'calculator-category-slugs',
        'calculator_category_slugs_admin_page'
    );
}
add_action('admin_menu', 'add_calculator_category_slugs_admin_menu');

/**
 * Admin page for managing category slugs
 */
function calculator_category_slugs_admin_page() {
    // Handle form submission
    if (isset($_POST['submit'])) {
        $category_slugs = array();
        
        // Get submitted data
        $categories = array('kitchens', 'bathrooms', 'basements', 'windows', 'flooring', 'home-renovations', 'structural');
        
        foreach ($categories as $category) {
            if (isset($_POST['slug_' . str_replace('-', '_', $category)])) {
                $category_slugs[$category] = sanitize_text_field($_POST['slug_' . str_replace('-', '_', $category)]);
            }
        }
        
        // Save to WordPress options
        update_option('calculator_category_slugs', $category_slugs);
        
        echo '<div class="notice notice-success"><p>Category slugs updated successfully!</p></div>';
    }
    
    // Get current values
    $category_slugs = get_option('calculator_category_slugs', array(
        'kitchens' => 'calculator-kitchens',
        'bathrooms' => 'calculator-bathrooms',
        'basements' => 'calculator-basements',
        'windows' => 'calculator-windows',
        'flooring' => 'calculator-flooring',
        'home-renovations' => 'calculator-renovations',
        'structural' => 'calculator-structural'
    ));
    
    ?>
    <div class="wrap">
        <h1>Calculator Category Slugs Configuration</h1>
        <p>Configure the WordPress post/page slugs for each calculator category.</p>
        
        <form method="post" action="">
            <table class="form-table">
                <tr>
                    <th scope="row">Kitchens Slug</th>
                    <td>
                        <input type="text" name="slug_kitchens" value="<?php echo esc_attr($category_slugs['kitchens']); ?>" class="regular-text" />
                        <p class="description">WordPress slug for the kitchens calculator</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Bathrooms Slug</th>
                    <td>
                        <input type="text" name="slug_bathrooms" value="<?php echo esc_attr($category_slugs['bathrooms']); ?>" class="regular-text" />
                        <p class="description">WordPress slug for the bathrooms calculator</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Basements Slug</th>
                    <td>
                        <input type="text" name="slug_basements" value="<?php echo esc_attr($category_slugs['basements']); ?>" class="regular-text" />
                        <p class="description">WordPress slug for the basements calculator</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Windows Slug</th>
                    <td>
                        <input type="text" name="slug_windows" value="<?php echo esc_attr($category_slugs['windows']); ?>" class="regular-text" />
                        <p class="description">WordPress slug for the windows calculator</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Flooring Slug</th>
                    <td>
                        <input type="text" name="slug_flooring" value="<?php echo esc_attr($category_slugs['flooring']); ?>" class="regular-text" />
                        <p class="description">WordPress slug for the flooring calculator</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Home Renovations Slug</th>
                    <td>
                        <input type="text" name="slug_home_renovations" value="<?php echo esc_attr($category_slugs['home-renovations']); ?>" class="regular-text" />
                        <p class="description">WordPress slug for the home renovations calculator</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Structural Slug</th>
                    <td>
                        <input type="text" name="slug_structural" value="<?php echo esc_attr($category_slugs['structural']); ?>" class="regular-text" />
                        <p class="description">WordPress slug for the structural calculator</p>
                    </td>
                </tr>
            </table>
            
            <?php submit_button(); ?>
        </form>
        
        <h2>API Endpoint Test</h2>
        <p>Test the category slugs endpoint:</p>
        <p><strong>URL:</strong> <code><?php echo home_url('/wp-json/your-plugin/v1/get-calculator-data?slug=calculator-category-slugs'); ?></code></p>
        
        <h3>Current Configuration (JSON):</h3>
        <textarea rows="10" cols="80" readonly><?php echo json_encode(array('success' => true, 'category_slugs' => $category_slugs), JSON_PRETTY_PRINT); ?></textarea>
    </div>
    <?php
}

/**
 * Add REST API endpoint for category slugs (alternative approach)
 */
function register_calculator_category_slugs_rest_route() {
    register_rest_route('calculator/v1', '/category-slugs', array(
        'methods' => 'GET',
        'callback' => 'get_calculator_category_slugs_rest',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'register_calculator_category_slugs_rest_route');

/**
 * REST API callback for category slugs
 */
function get_calculator_category_slugs_rest($request) {
    $category_slugs = get_option('calculator_category_slugs', array(
        'kitchens' => 'calculator-kitchens',
        'bathrooms' => 'calculator-bathrooms',
        'basements' => 'calculator-basements',
        'windows' => 'calculator-windows',
        'flooring' => 'calculator-flooring',
        'home-renovations' => 'calculator-renovations',
        'structural' => 'calculator-structural'
    ));
    
    return new WP_REST_Response(array(
        'success' => true,
        'category_slugs' => $category_slugs,
        'timestamp' => time()
    ), 200);
}
?>
