<?php
/**
 * Uninstall script for Estimate Calculator plugin
 * 
 * This file is executed when the plugin is deleted from WordPress admin
 * 
 * @package EstimateCalculator
 */

// If uninstall not called from WordPress, exit
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Clean up any plugin options (none currently used, but good practice)
// delete_option('estimate_calculator_options');

// Clean up any transients (none currently used, but good practice)
// delete_transient('estimate_calculator_data');

// Flush rewrite rules to clean up API endpoints
flush_rewrite_rules();
