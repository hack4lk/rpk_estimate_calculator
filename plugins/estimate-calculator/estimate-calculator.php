<?php
/**
 * Plugin Name: Estimate Calculator
 * Plugin URI: https://example.com/estimate-calculator
 * Description: A WordPress plugin that provides API endpoints for calculator data retrieval from ACF custom fields with support for form fields on categories.
 * Version: 1.1.0
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: estimate-calculator
 * Domain Path: /languages
 * 
 * @package EstimateCalculator
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('ESTIMATE_CALCULATOR_VERSION', '1.1.0');
define('ESTIMATE_CALCULATOR_PLUGIN_FILE', __FILE__);
define('ESTIMATE_CALCULATOR_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ESTIMATE_CALCULATOR_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main Estimate Calculator class
 */
class EstimateCalculator {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('rest_api_init', array($this, 'register_api_routes'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Register shortcodes
        add_shortcode('estimate_calculator', array($this, 'calculator_shortcode'));
    }
    
    /**
     * Initialize the plugin
     */
    public function init() {
        // Load text domain for translations
        load_plugin_textdomain('estimate-calculator', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // Register calculator custom post type if it doesn't exist
        $this->register_calculator_post_type();
        
        // Check if ACF is active
        if (!function_exists('get_field')) {
            add_action('admin_notices', array($this, 'acf_missing_notice'));
            return;
        }
    }
    
    /**
     * Register calculator custom post type
     */
    public function register_calculator_post_type() {
        // Check if post type already exists (might be registered by theme or another plugin)
        if (post_type_exists('calculator')) {
            return;
        }
        
        $labels = array(
            'name' => _x('Calculators', 'Post type general name', 'estimate-calculator'),
            'singular_name' => _x('Calculator', 'Post type singular name', 'estimate-calculator'),
            'menu_name' => _x('Calculators', 'Admin Menu text', 'estimate-calculator'),
            'name_admin_bar' => _x('Calculator', 'Add New on Toolbar', 'estimate-calculator'),
            'add_new' => __('Add New', 'estimate-calculator'),
            'add_new_item' => __('Add New Calculator', 'estimate-calculator'),
            'new_item' => __('New Calculator', 'estimate-calculator'),
            'edit_item' => __('Edit Calculator', 'estimate-calculator'),
            'view_item' => __('View Calculator', 'estimate-calculator'),
            'all_items' => __('All Calculators', 'estimate-calculator'),
            'search_items' => __('Search Calculators', 'estimate-calculator'),
            'parent_item_colon' => __('Parent Calculators:', 'estimate-calculator'),
            'not_found' => __('No calculators found.', 'estimate-calculator'),
            'not_found_in_trash' => __('No calculators found in Trash.', 'estimate-calculator'),
        );
        
        $args = array(
            'labels' => $labels,
            'description' => __('Calculator posts for estimate calculations.', 'estimate-calculator'),
            'public' => true,
            'publicly_queryable' => true,
            'show_ui' => true,
            'show_in_menu' => true,
            'query_var' => true,
            'rewrite' => array('slug' => 'calculator'),
            'capability_type' => 'post',
            'has_archive' => true,
            'hierarchical' => false,
            'menu_position' => 20,
            'menu_icon' => 'dashicons-calculator',
            'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
            'show_in_rest' => true,
        );
        
        register_post_type('calculator', $args);
    }
    
    /**
     * Register REST API routes
     */
    public function register_api_routes() {
        $default_slug = $this->get_default_slug();
        
        register_rest_route('estimate-calculator/v1', '/get-calculator-data', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_calculator_data'),
            'permission_callback' => '__return_true',
            'args' => array(
                'slug' => array(
                    'default' => $default_slug,
                    'sanitize_callback' => 'sanitize_text_field',
                    'validate_callback' => array($this, 'validate_slug'),
                ),
            ),
        ));
        
        register_rest_route('estimate-calculator/v1', '/get-questions', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_questions_only'),
            'permission_callback' => '__return_true',
            'args' => array(
                'slug' => array(
                    'default' => $default_slug,
                    'sanitize_callback' => 'sanitize_text_field',
                    'validate_callback' => array($this, 'validate_slug'),
                ),
            ),
        ));
        
        register_rest_route('estimate-calculator/v1', '/get-category-data', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_category_data'),
            'permission_callback' => '__return_true',
            'args' => array(
                'slug' => array(
                    'default' => $default_slug,
                    'sanitize_callback' => 'sanitize_text_field',
                    'validate_callback' => array($this, 'validate_slug'),
                ),
                'category_id' => array(
                    'required' => false,
                    'sanitize_callback' => 'sanitize_text_field',
                ),
                'category_name' => array(
                    'required' => false,
                    'sanitize_callback' => 'sanitize_text_field',
                ),
            ),
        ));
        
        // Debug endpoint to help troubleshoot form fields
        register_rest_route('estimate-calculator/v1', '/debug-form-fields', array(
            'methods' => 'GET',
            'callback' => array($this, 'debug_form_fields'),
            'permission_callback' => '__return_true',
            'args' => array(
                'slug' => array(
                    'default' => $default_slug,
                    'sanitize_callback' => 'sanitize_text_field',
                    'validate_callback' => array($this, 'validate_slug'),
                ),
            ),
        ));
        
        // SendGrid email endpoint
        register_rest_route('estimate-calculator/v1', '/send-email', array(
            'methods' => 'POST',
            'callback' => array($this, 'send_email_via_sendgrid'),
            'permission_callback' => '__return_true',
            'args' => array(
                'personalizations' => array(
                    'required' => true,
                    'validate_callback' => array($this, 'validate_personalizations'),
                ),
                'from' => array(
                    'required' => true,
                    'validate_callback' => array($this, 'validate_email_address'),
                ),
                'content' => array(
                    'required' => true,
                    'validate_callback' => array($this, 'validate_content'),
                ),
            ),
        ));
        
        // JobTread customer creation endpoint
        register_rest_route('estimate-calculator/v1', '/create-jobtread-customer', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_jobtread_customer'),
            'permission_callback' => '__return_true',
            'args' => array(
                'name' => array(
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                    'validate_callback' => array($this, 'validate_required_string'),
                ),
                'email' => array(
                    'required' => true,
                    'sanitize_callback' => 'sanitize_email',
                    'validate_callback' => array($this, 'validate_required_email'),
                ),
                'zip' => array(
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                    'validate_callback' => array($this, 'validate_required_string'),
                ),
                'phone' => array(
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                    'validate_callback' => array($this, 'validate_required_string'),
                ),
            ),
        ));
    }
    
    /**
     * Get calculator data from ACF fields
     */
    public function get_calculator_data(WP_REST_Request $request) {
        $slug = $request->get_param('slug');
        
        // Get calculator post by slug
        $calculator_post = $this->get_calculator_post_by_slug($slug);
        
        if (!$calculator_post) {
            return new WP_Error(
                'calculator_not_found', 
                sprintf(__('Calculator with slug "%s" not found', 'estimate-calculator'), $slug), 
                array('status' => 404)
            );
        }
        
        // Special handling for calculator-results slug
        if ($slug === 'calculator-results') {
            return $this->get_calculator_results_data($calculator_post->ID);
        }
        
        // Special handling for calculator-email slug
        if ($slug === 'calculator-email') {
            return $this->get_calculator_email_data($calculator_post->ID);
        }
        
        // Get the "questions" custom field using ACF
        $questions = get_field('questions', $calculator_post->ID);
        
        if (!$questions) {
            return new WP_Error(
                'field_not_found', 
                __('Custom field "questions" not found or empty', 'estimate-calculator'), 
                array('status' => 404)
            );
        }
        
        // Get form fields
        $form_fields = $this->get_form_fields($calculator_post->ID);
        
        // Return the data
        return array(
            'success' => true,
            'data' => array(
                'calculator_id' => $calculator_post->ID,
                'calculator_title' => $calculator_post->post_title,
                'calculator_slug' => $calculator_post->post_name,
                'calculator_url' => get_permalink($calculator_post->ID),
                'form_fields' => $form_fields,
                'questions' => $questions,
                'last_modified' => $calculator_post->post_modified,
                'post_type' => $calculator_post->post_type,
            ),
            'timestamp' => current_time('timestamp'),
        );
    }
    
    /**
     * Get only questions data (simplified endpoint)
     */
    public function get_questions_only(WP_REST_Request $request) {
        $slug = $request->get_param('slug');
        
        // Get calculator post by slug
        $calculator_post = $this->get_calculator_post_by_slug($slug);
        
        if (!$calculator_post) {
            return new WP_Error(
                'calculator_not_found', 
                sprintf(__('Calculator with slug "%s" not found', 'estimate-calculator'), $slug), 
                array('status' => 404)
            );
        }
        
        // Get the "questions" custom field using ACF
        $questions = get_field('questions', $calculator_post->ID);
        
        if (!$questions) {
            return new WP_Error(
                'field_not_found', 
                __('Custom field "questions" not found or empty', 'estimate-calculator'), 
                array('status' => 404)
            );
        }
        
        // Get form fields
        $form_fields = $this->get_form_fields($calculator_post->ID);
        
        // Return the questions with form fields
        return array(
            'success' => true,
            'form_fields' => $form_fields,
            'questions' => $questions,
        );
    }
    
    /**
     * Get category data with form fields
     */
    public function get_category_data(WP_REST_Request $request) {
        $slug = $request->get_param('slug');
        $category_id = $request->get_param('category_id');
        $category_name = $request->get_param('category_name');
        
        // Get calculator post by slug
        $calculator_post = $this->get_calculator_post_by_slug($slug);
        
        if (!$calculator_post) {
            return new WP_Error(
                'calculator_not_found', 
                sprintf(__('Calculator with slug "%s" not found', 'estimate-calculator'), $slug), 
                array('status' => 404)
            );
        }
        
        // Get the "questions" custom field using ACF
        $questions = get_field('questions', $calculator_post->ID);
        
        if (!$questions) {
            return new WP_Error(
                'field_not_found', 
                __('Custom field "questions" not found or empty', 'estimate-calculator'), 
                array('status' => 404)
            );
        }
        
        // Get form fields
        $form_fields = $this->get_form_fields($calculator_post->ID);
        
        // If specific category is requested, filter the results
        if (!empty($category_id) || !empty($category_name)) {
            $category_data = $this->find_category_data($questions, $category_id, $category_name);
            
            if ($category_data) {
                return array(
                    'success' => true,
                    'form_fields' => $form_fields,
                    'category' => $category_data,
                );
            } else {
                return new WP_Error(
                    'category_not_found', 
                    __('Specified category not found', 'estimate-calculator'), 
                    array('status' => 404)
                );
            }
        }
        
        // Return all categories with form fields
        return array(
            'success' => true,
            'form_fields' => $form_fields,
            'questions' => $questions,
        );
    }
    
    /**
     * Debug endpoint to troubleshoot form fields
     */
    public function debug_form_fields(WP_REST_Request $request) {
        $slug = $request->get_param('slug');
        
        // Get calculator post by slug
        $calculator_post = $this->get_calculator_post_by_slug($slug);
        
        if (!$calculator_post) {
            return new WP_Error(
                'calculator_not_found', 
                sprintf(__('Calculator with slug "%s" not found', 'estimate-calculator'), $slug), 
                array('status' => 404)
            );
        }
        
        // Get raw questions data
        $questions = get_field('questions', $calculator_post->ID);
        
        // Get all ACF fields for this post
        $all_fields = get_fields($calculator_post->ID);
        
        // Get form fields using the new method
        $form_fields = $this->get_form_fields($calculator_post->ID);
        
        return array(
            'success' => true,
            'debug_info' => array(
                'post_id' => $calculator_post->ID,
                'post_title' => $calculator_post->post_title,
                'raw_questions' => $questions,
                'form_fields' => $form_fields,
                'all_acf_fields' => $all_fields,
                'acf_active' => function_exists('get_field'),
                'new_structure' => array(
                    'form_fields' => $form_fields,
                    'questions' => $questions,
                ),
            ),
        );
    }
    
    /**
     * Send email via SendGrid API
     */
    public function send_email_via_sendgrid(WP_REST_Request $request) {
        // Get SendGrid API key from settings
        $options = get_option('estimate_calculator_settings');
        $api_key = isset($options['sendgrid_api_key']) ? $options['sendgrid_api_key'] : '';
        
        if (empty($api_key)) {
            return new WP_Error(
                'missing_api_key',
                __('SendGrid API key is not configured. Please set it in the plugin settings.', 'estimate-calculator'),
                array('status' => 500)
            );
        }
        
        // Get the email payload from the request
        $payload = array(
            'personalizations' => $request->get_param('personalizations'),
            'from' => $request->get_param('from'),
            'content' => $request->get_param('content'),
        );
        
        // Send email via SendGrid
        $result = $this->send_sendgrid_email($api_key, $payload);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return array(
            'success' => true,
            'message' => __('Email sent successfully', 'estimate-calculator'),
            'sendgrid_response' => $result,
        );
    }
    
    /**
     * Send email using SendGrid API
     */
    private function send_sendgrid_email($api_key, $payload) {
        $url = 'https://api.sendgrid.com/v3/mail/send';
        
        $headers = array(
            'Authorization: Bearer ' . $api_key,
            'Content-Type: application/json',
        );
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, wp_json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_error = curl_error($ch);
        curl_close($ch);
        
        // Check for cURL errors
        if (!empty($curl_error)) {
            return new WP_Error(
                'curl_error',
                sprintf(__('cURL error: %s', 'estimate-calculator'), $curl_error),
                array('status' => 500)
            );
        }
        
        // Check HTTP response code
        if ($http_code >= 200 && $http_code < 300) {
            // Success
            return array(
                'http_code' => $http_code,
                'response' => $response,
            );
        } else {
            // Error
            $error_message = $response ? $response : sprintf(__('HTTP Error %d', 'estimate-calculator'), $http_code);
            return new WP_Error(
                'sendgrid_error',
                sprintf(__('SendGrid API error (HTTP %d): %s', 'estimate-calculator'), $http_code, $error_message),
                array('status' => $http_code)
            );
        }
    }
    
    /**
     * Validate personalizations parameter
     */
    public function validate_personalizations($param, $request, $key) {
        if (!is_array($param) || empty($param)) {
            return false;
        }
        
        foreach ($param as $personalization) {
            if (!isset($personalization['to']) || !is_array($personalization['to']) || empty($personalization['to'])) {
                return false;
            }
            
            foreach ($personalization['to'] as $recipient) {
                if (!isset($recipient['email']) || !is_email($recipient['email'])) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Validate email address parameter
     */
    public function validate_email_address($param, $request, $key) {
        if (!is_array($param) || !isset($param['email']) || !is_email($param['email'])) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate content parameter
     */
    public function validate_content($param, $request, $key) {
        if (!is_array($param) || empty($param)) {
            return false;
        }
        
        foreach ($param as $content_item) {
            if (!isset($content_item['type']) || !isset($content_item['value'])) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Create JobTread customer
     */
    public function create_jobtread_customer(WP_REST_Request $request) {
        // Get JobTread API settings from plugin settings
        $options = get_option('estimate_calculator_settings');
        $api_key = isset($options['jobtread_api_key']) ? $options['jobtread_api_key'] : '';
        $api_url = isset($options['jobtread_api_url']) ? $options['jobtread_api_url'] : '';
        
        if (empty($api_key)) {
            return new WP_Error(
                'missing_jobtread_api_key',
                __('JobTread API key is not configured. Please set it in the plugin settings.', 'estimate-calculator'),
                array('status' => 500)
            );
        }
        
        if (empty($api_url)) {
            return new WP_Error(
                'missing_jobtread_api_url',
                __('JobTread API URL is not configured. Please set it in the plugin settings.', 'estimate-calculator'),
                array('status' => 500)
            );
        }
        
        // Get the customer data from the request
        $customer_data = array(
            'name' => $request->get_param('name'),
            'email' => $request->get_param('email'),
            'zip' => $request->get_param('zip'),
            'phone' => $request->get_param('phone'),
        );
        
        // Create customer via JobTread API
        $result = $this->send_jobtread_request($api_key, $api_url, $customer_data);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return array(
            'success' => true,
            'message' => __('JobTread customer created successfully', 'estimate-calculator'),
            'customer_data' => $customer_data,
            'jobtread_response' => $result,
        );
    }
    
    /**
     * Send request to JobTread API
     */
    private function send_jobtread_request($api_key, $api_url, $customer_data) {
        $headers = array(
            'Authorization: Bearer ' . $api_key,
            'Content-Type: application/json',
            'Accept: application/json',
        );
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $api_url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, wp_json_encode($customer_data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_error = curl_error($ch);
        curl_close($ch);
        
        // Check for cURL errors
        if (!empty($curl_error)) {
            return new WP_Error(
                'curl_error',
                sprintf(__('cURL error: %s', 'estimate-calculator'), $curl_error),
                array('status' => 500)
            );
        }
        
        // Check HTTP response code
        if ($http_code >= 200 && $http_code < 300) {
            // Success
            $decoded_response = json_decode($response, true);
            return array(
                'http_code' => $http_code,
                'response' => $decoded_response ? $decoded_response : $response,
            );
        } else {
            // Error
            $error_message = $response ? $response : sprintf(__('HTTP Error %d', 'estimate-calculator'), $http_code);
            return new WP_Error(
                'jobtread_error',
                sprintf(__('JobTread API error (HTTP %d): %s', 'estimate-calculator'), $http_code, $error_message),
                array('status' => $http_code)
            );
        }
    }
    
    /**
     * Validate required string parameter
     */
    public function validate_required_string($param, $request, $key) {
        return is_string($param) && !empty(trim($param));
    }
    
    /**
     * Validate required email parameter
     */
    public function validate_required_email($param, $request, $key) {
        return !empty($param) && is_email($param);
    }
    
    /**
     * Get calculator results data (for results page)
     */
    private function get_calculator_results_data($post_id) {
        // Get the specific results fields from ACF
        $calculator_results_headline = get_field('calculator_results_headline', $post_id);
        $calculator_results_description = get_field('calculator_results_description', $post_id);
        $calculator_results_footer_text = get_field('calculator_results_footer_text', $post_id);
        $calculator_results_disclaimer = get_field('calculator_results_disclaimer', $post_id);
        
        // Return only the results data
        return array(
            'success' => true,
            'calculator_results_headline' => $calculator_results_headline ? $calculator_results_headline : '',
            'calculator_results_description' => $calculator_results_description ? $calculator_results_description : '',
            'calculator_results_footer_text' => $calculator_results_footer_text ? $calculator_results_footer_text : '',
            'calculator_results_disclaimer' => $calculator_results_disclaimer ? $calculator_results_disclaimer : '',
        );
    }
    
    /**
     * Get calculator email data (for email template)
     */
    private function get_calculator_email_data($post_id) {
        // Get the email body field from ACF
        $calculator_email_body = get_field('calculator_email_body', $post_id);
        
        // Return only the email data
        return array(
            'success' => true,
            'calculator_email_body' => $calculator_email_body ? $calculator_email_body : '',
        );
    }
    
    /**
     * Get form fields for the calculator
     */
    private function get_form_fields($post_id) {
        // Get form fields from ACF
        $form_headline = get_field('form_headline', $post_id);
        $form_description = get_field('form_description', $post_id);
        $form_footer_text = get_field('form_footer_text', $post_id);
        
        return array(
            'form_headline' => $form_headline ? $form_headline : '',
            'form_description' => $form_description ? $form_description : '',
            'form_footer_text' => $form_footer_text ? $form_footer_text : '',
        );
    }
    
    /**
     * Find specific category data in questions
     */
    private function find_category_data($questions, $category_id = '', $category_name = '') {
        if (!is_array($questions)) {
            return false;
        }
        
        foreach ($questions as $question) {
            // Check if this question has categories
            if (isset($question['categories']) && is_array($question['categories'])) {
                foreach ($question['categories'] as $category) {
                    if ($this->category_matches($category, $category_id, $category_name)) {
                        return $category;
                    }
                }
            }
            
            // Check if the question itself represents a category
            if ($this->category_matches($question, $category_id, $category_name)) {
                return $question;
            }
        }
        
        return false;
    }
    
    /**
     * Check if a category matches the search criteria
     */
    private function category_matches($category, $category_id = '', $category_name = '') {
        // Match by ID if provided
        if (!empty($category_id) && isset($category['category_id'])) {
            return $category['category_id'] == $category_id;
        }
        
        // Match by name if provided
        if (!empty($category_name) && isset($category['category_name'])) {
            return strtolower($category['category_name']) == strtolower($category_name);
        }
        
        return false;
    }
    
    /**
     * Get calculator post by slug
     */
    private function get_calculator_post_by_slug($slug) {
        $args = array(
            'name' => $slug,
            'post_type' => 'calculator',
            'post_status' => 'publish',
            'numberposts' => 1
        );
        
        $posts = get_posts($args);
        
        if (empty($posts)) {
            return false;
        }
        
        return $posts[0];
    }
    
    /**
     * Validate slug parameter
     */
    public function validate_slug($param, $request, $key) {
        return is_string($param) && !empty($param);
    }
    
    /**
     * Get default slug from settings
     */
    private function get_default_slug() {
        $options = get_option('estimate_calculator_settings');
        return isset($options['default_slug']) && !empty($options['default_slug']) 
            ? $options['default_slug'] 
            : 'calculator-default';
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            __('Estimate Calculator Settings', 'estimate-calculator'),
            __('Estimate Calculator', 'estimate-calculator'),
            'manage_options',
            'estimate-calculator-settings',
            array($this, 'admin_page')
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('estimate_calculator_settings', 'estimate_calculator_settings');
        
        add_settings_section(
            'estimate_calculator_general',
            __('General Settings', 'estimate-calculator'),
            null,
            'estimate-calculator-settings'
        );
        
        add_settings_field(
            'default_slug',
            __('Default Calculator Slug', 'estimate-calculator'),
            array($this, 'default_slug_field'),
            'estimate-calculator-settings',
            'estimate_calculator_general'
        );
        
        add_settings_field(
            'sendgrid_api_key',
            __('SendGrid API Key', 'estimate-calculator'),
            array($this, 'sendgrid_api_key_field'),
            'estimate-calculator-settings',
            'estimate_calculator_general'
        );
        
        add_settings_field(
            'jobtread_api_key',
            __('JobTread API Key', 'estimate-calculator'),
            array($this, 'jobtread_api_key_field'),
            'estimate-calculator-settings',
            'estimate_calculator_general'
        );
        
        add_settings_field(
            'jobtread_api_url',
            __('JobTread API URL', 'estimate-calculator'),
            array($this, 'jobtread_api_url_field'),
            'estimate-calculator-settings',
            'estimate_calculator_general'
        );
    }
    
    /**
     * Admin page
     */
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('Estimate Calculator Settings', 'estimate-calculator'); ?></h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('estimate_calculator_settings');
                do_settings_sections('estimate-calculator-settings');
                submit_button();
                ?>
            </form>
            
            <h2><?php _e('Usage', 'estimate-calculator'); ?></h2>
            <p><?php _e('You can use the estimate calculator in several ways:', 'estimate-calculator'); ?></p>
            <ul>
                <li><strong><?php _e('API Endpoints:', 'estimate-calculator'); ?></strong></li>
                <ul>
                    <li><code>/wp-json/estimate-calculator/v1/get-calculator-data?slug=your-calculator-slug</code> - <?php _e('Get full calculator data with form fields', 'estimate-calculator'); ?></li>
                    <li><code>/wp-json/estimate-calculator/v1/get-questions?slug=your-calculator-slug</code> - <?php _e('Get questions with form fields', 'estimate-calculator'); ?></li>
                    <li><code>/wp-json/estimate-calculator/v1/get-category-data?slug=your-calculator-slug</code> - <?php _e('Get all categories with form fields', 'estimate-calculator'); ?></li>
                    <li><code>/wp-json/estimate-calculator/v1/get-category-data?slug=your-calculator-slug&category_id=123</code> - <?php _e('Get specific category by ID', 'estimate-calculator'); ?></li>
                    <li><code>/wp-json/estimate-calculator/v1/get-category-data?slug=your-calculator-slug&category_name=kitchens</code> - <?php _e('Get specific category by name', 'estimate-calculator'); ?></li>
                    <li><code>/wp-json/estimate-calculator/v1/get-calculator-data?slug=calculator-results</code> - <?php _e('Get results page data (special handling for calculator-results slug)', 'estimate-calculator'); ?></li>
                    <li><code>/wp-json/estimate-calculator/v1/get-calculator-data?slug=calculator-email</code> - <?php _e('Get email template data (special handling for calculator-email slug)', 'estimate-calculator'); ?></li>
                    <li><strong>POST:</strong> <code>/wp-json/estimate-calculator/v1/send-email</code> - <?php _e('Send email via SendGrid API', 'estimate-calculator'); ?></li>
                    <li><strong>POST:</strong> <code>/wp-json/estimate-calculator/v1/create-jobtread-customer</code> - <?php _e('Create customer in JobTread', 'estimate-calculator'); ?></li>
                </ul>
                <li><strong><?php _e('Shortcode:', 'estimate-calculator'); ?></strong> <code>[estimate_calculator slug="your-calculator-slug"]</code></li>
                <li><strong><?php _e('Default shortcode:', 'estimate-calculator'); ?></strong> <code>[estimate_calculator]</code> <?php _e('(uses the default slug above)', 'estimate-calculator'); ?></li>
            </ul>
            
            <h3><?php _e('Form Fields', 'estimate-calculator'); ?></h3>
            <p><?php _e('The following form fields are automatically added to each category:', 'estimate-calculator'); ?></p>
            <ul>
                <li><strong>form_headline</strong> - <?php _e('Headline text for the category form', 'estimate-calculator'); ?></li>
                <li><strong>form_description</strong> - <?php _e('Description text for the category form', 'estimate-calculator'); ?></li>
                <li><strong>form_footer_text</strong> - <?php _e('Footer text for the category form', 'estimate-calculator'); ?></li>
            </ul>
            
            <h3><?php _e('Results Page Fields', 'estimate-calculator'); ?></h3>
            <p><?php _e('The calculator results endpoint returns the following fields:', 'estimate-calculator'); ?></p>
            <ul>
                <li><strong>calculator_results_headline</strong> - <?php _e('Headline for the results page', 'estimate-calculator'); ?></li>
                <li><strong>calculator_results_description</strong> - <?php _e('Description text for the results page', 'estimate-calculator'); ?></li>
                <li><strong>calculator_results_footer_text</strong> - <?php _e('Footer text for the results page', 'estimate-calculator'); ?></li>
                <li><strong>calculator_results_disclaimer</strong> - <?php _e('Disclaimer text for the results page', 'estimate-calculator'); ?></li>
            </ul>
            
            <h3><?php _e('Email Template Fields', 'estimate-calculator'); ?></h3>
            <p><?php _e('The calculator email endpoint returns the following field:', 'estimate-calculator'); ?></p>
            <ul>
                <li><strong>calculator_email_body</strong> - <?php _e('Email body template for calculator notifications', 'estimate-calculator'); ?></li>
            </ul>
            
            <h3><?php _e('SendGrid Email API', 'estimate-calculator'); ?></h3>
            <p><?php _e('Send emails via SendGrid API using the POST endpoint:', 'estimate-calculator'); ?></p>
            <ul>
                <li><strong>Endpoint:</strong> <code>POST /wp-json/estimate-calculator/v1/send-email</code></li>
                <li><strong>Required:</strong> <?php _e('SendGrid API key must be configured in settings above', 'estimate-calculator'); ?></li>
                <li><strong>Payload:</strong> <?php _e('SendGrid v3 API format with personalizations, from, and content', 'estimate-calculator'); ?></li>
            </ul>
            
            <h3><?php _e('JobTread Customer API', 'estimate-calculator'); ?></h3>
            <p><?php _e('Create customers in JobTread using the POST endpoint:', 'estimate-calculator'); ?></p>
            <ul>
                <li><strong>Endpoint:</strong> <code>POST /wp-json/estimate-calculator/v1/create-jobtread-customer</code></li>
                <li><strong>Required:</strong> <?php _e('JobTread API key and URL must be configured in settings above', 'estimate-calculator'); ?></li>
                <li><strong>Payload:</strong> <?php _e('Customer data with name, email, zip, and phone fields', 'estimate-calculator'); ?></li>
            </ul>
            
            <h3><?php _e('ACF Field Setup', 'estimate-calculator'); ?></h3>
            <p><?php _e('To use category-specific form fields, create the following ACF fields on your calculator posts:', 'estimate-calculator'); ?></p>
            <ul>
                <li><code>form_headline</code> - <?php _e('Global form headline (fallback)', 'estimate-calculator'); ?></li>
                <li><code>form_description</code> - <?php _e('Global form description (fallback)', 'estimate-calculator'); ?></li>
                <li><code>form_footer_text</code> - <?php _e('Global form footer text (fallback)', 'estimate-calculator'); ?></li>
                <li><code>form_headline_{category_id}</code> - <?php _e('Category-specific headline (e.g., form_headline_kitchens)', 'estimate-calculator'); ?></li>
                <li><code>form_description_{category_id}</code> - <?php _e('Category-specific description', 'estimate-calculator'); ?></li>
                <li><code>form_footer_text_{category_id}</code> - <?php _e('Category-specific footer text', 'estimate-calculator'); ?></li>
            </ul>
            
            <h3><?php _e('Results Page ACF Fields', 'estimate-calculator'); ?></h3>
            <p><?php _e('For the calculator results page (slug: calculator-results), create these ACF fields:', 'estimate-calculator'); ?></p>
            <ul>
                <li><code>calculator_results_headline</code> - <?php _e('Results page headline', 'estimate-calculator'); ?></li>
                <li><code>calculator_results_description</code> - <?php _e('Results page description', 'estimate-calculator'); ?></li>
                <li><code>calculator_results_footer_text</code> - <?php _e('Results page footer text', 'estimate-calculator'); ?></li>
                <li><code>calculator_results_disclaimer</code> - <?php _e('Results page disclaimer', 'estimate-calculator'); ?></li>
            </ul>
            
            <h3><?php _e('Email Template ACF Fields', 'estimate-calculator'); ?></h3>
            <p><?php _e('For the calculator email template (slug: calculator-email), create this ACF field:', 'estimate-calculator'); ?></p>
            <ul>
                <li><code>calculator_email_body</code> - <?php _e('Email body template content', 'estimate-calculator'); ?></li>
            </ul>
        </div>
        <?php
    }
    
    /**
     * Default slug field
     */
    public function default_slug_field() {
        $options = get_option('estimate_calculator_settings');
        $value = isset($options['default_slug']) ? $options['default_slug'] : 'calculator-default';
        ?>
        <input type="text" name="estimate_calculator_settings[default_slug]" value="<?php echo esc_attr($value); ?>" class="regular-text" />
        <p class="description">
            <?php _e('Enter the slug of the calculator to use as default when no slug is specified in API calls or shortcodes.', 'estimate-calculator'); ?>
        </p>
        <?php
    }
    
    /**
     * SendGrid API key field
     */
    public function sendgrid_api_key_field() {
        $options = get_option('estimate_calculator_settings');
        $value = isset($options['sendgrid_api_key']) ? $options['sendgrid_api_key'] : '';
        ?>
        <input type="password" name="estimate_calculator_settings[sendgrid_api_key]" value="<?php echo esc_attr($value); ?>" class="regular-text" />
        <p class="description">
            <?php _e('Enter your SendGrid API key to enable email sending functionality. Get your API key from your SendGrid dashboard.', 'estimate-calculator'); ?>
        </p>
        <?php
    }
    
    /**
     * JobTread API key field
     */
    public function jobtread_api_key_field() {
        $options = get_option('estimate_calculator_settings');
        $value = isset($options['jobtread_api_key']) ? $options['jobtread_api_key'] : '';
        ?>
        <input type="password" name="estimate_calculator_settings[jobtread_api_key]" value="<?php echo esc_attr($value); ?>" class="regular-text" />
        <p class="description">
            <?php _e('Enter your JobTread API key to enable customer creation functionality. Get your API key from your JobTread dashboard.', 'estimate-calculator'); ?>
        </p>
        <?php
    }
    
    /**
     * JobTread API URL field
     */
    public function jobtread_api_url_field() {
        $options = get_option('estimate_calculator_settings');
        $value = isset($options['jobtread_api_url']) ? $options['jobtread_api_url'] : '';
        ?>
        <input type="url" name="estimate_calculator_settings[jobtread_api_url]" value="<?php echo esc_attr($value); ?>" class="regular-text" placeholder="https://api.jobtread.com/v1/customers" />
        <p class="description">
            <?php _e('Enter the JobTread API endpoint URL for creating customers (e.g., https://api.jobtread.com/v1/customers).', 'estimate-calculator'); ?>
        </p>
        <?php
    }
    
    /**
     * Calculator shortcode
     */
    public function calculator_shortcode($atts) {
        $atts = shortcode_atts(array(
            'slug' => $this->get_default_slug(),
            'class' => 'estimate-calculator-wrapper',
            'id' => '',
        ), $atts, 'estimate_calculator');
        
        $calculator_post = $this->get_calculator_post_by_slug($atts['slug']);
        
        if (!$calculator_post) {
            return '<div class="estimate-calculator-error">' . 
                   sprintf(__('Calculator with slug "%s" not found.', 'estimate-calculator'), esc_html($atts['slug'])) . 
                   '</div>';
        }
        
        $questions = get_field('questions', $calculator_post->ID);
        
        if (!$questions) {
            return '<div class="estimate-calculator-error">' . 
                   __('No questions found for this calculator.', 'estimate-calculator') . 
                   '</div>';
        }
        
        // Get form fields
        $form_fields = $this->get_form_fields($calculator_post->ID);
        
        // Combine data for JavaScript
        $calculator_data = array(
            'form_fields' => $form_fields,
            'questions' => $questions,
        );
        
        $id_attr = !empty($atts['id']) ? ' id="' . esc_attr($atts['id']) . '"' : '';
        
        ob_start();
        ?>
        <div class="<?php echo esc_attr($atts['class']); ?>"<?php echo $id_attr; ?> data-calculator-slug="<?php echo esc_attr($atts['slug']); ?>">
            <div class="calculator-info">
                <h3><?php echo esc_html($calculator_post->post_title); ?></h3>
                <?php if (!empty($calculator_post->post_content)): ?>
                    <div class="calculator-description">
                        <?php echo wp_kses_post($calculator_post->post_content); ?>
                    </div>
                <?php endif; ?>
            </div>
            <div class="calculator-data" style="display: none;">
                <?php echo wp_json_encode($calculator_data); ?>
            </div>
            <div class="calculator-placeholder">
                <p><?php _e('Calculator loading...', 'estimate-calculator'); ?></p>
                <script>
                    // Auto-initialize calculator if you have JavaScript that handles it
                    document.addEventListener('DOMContentLoaded', function() {
                        if (typeof window.initializeEstimateCalculator === 'function') {
                            window.initializeEstimateCalculator('<?php echo esc_js($atts['slug']); ?>');
                        }
                    });
                </script>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Show notice if ACF is not active
     */
    public function acf_missing_notice() {
        ?>
        <div class="notice notice-error">
            <p>
                <?php 
                _e('Estimate Calculator plugin requires Advanced Custom Fields (ACF) plugin to be installed and activated.', 'estimate-calculator'); 
                ?>
            </p>
        </div>
        <?php
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Register custom post type before flushing rewrite rules
        $this->register_calculator_post_type();
        
        // Set default options
        $default_options = array(
            'default_slug' => 'calculator-default',
            'sendgrid_api_key' => '',
            'jobtread_api_key' => '',
            'jobtread_api_url' => ''
        );
        
        $existing_options = get_option('estimate_calculator_settings', array());
        $options = wp_parse_args($existing_options, $default_options);
        update_option('estimate_calculator_settings', $options);
        
        // Flush rewrite rules to ensure API endpoints and post type work
        flush_rewrite_rules();
        
        // Check if ACF is active
        if (!function_exists('get_field')) {
            deactivate_plugins(plugin_basename(__FILE__));
            wp_die(
                __('Estimate Calculator plugin requires Advanced Custom Fields (ACF) plugin to be installed and activated.', 'estimate-calculator'),
                __('Plugin Activation Error', 'estimate-calculator'),
                array('back_link' => true)
            );
        }
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();
    }
}

// Initialize the plugin
new EstimateCalculator();
