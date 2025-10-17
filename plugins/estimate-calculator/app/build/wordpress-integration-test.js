// Simple test script to add to your existing React build
console.log('🔧 WordPress Integration Test Script Loaded');

// Add the WordPress integration functions
window.initEstimateCalculator = function(containerElement, config) {
    console.log('🎯 initEstimateCalculator called with:', config);
    
    // Simple test rendering
    containerElement.innerHTML = `
        <div style="border: 2px solid green; padding: 20px; margin: 10px;">
            <h3>✅ WordPress Integration Working!</h3>
            <p><strong>Mode:</strong> ${config.mode}</p>
            <p><strong>Calculator Title:</strong> ${config.calculatorTitle || 'N/A'}</p>
            <p><strong>Form Headline:</strong> ${config.formFields?.form_headline || 'N/A'}</p>
            <p><strong>Questions Count:</strong> ${config.questions?.length || 0}</p>
            <details>
                <summary>Full Config</summary>
                <pre>${JSON.stringify(config, null, 2)}</pre>
            </details>
        </div>
    `;
};

window.EstimateCalculator = {
    init: function() {
        console.log('🎯 EstimateCalculator.init called');
        
        // Find WordPress containers
        const containers = document.querySelectorAll('.estimate-calculator-react-root');
        containers.forEach(container => {
            const configElementId = container.id.replace('-react-root', '-config');
            const configElement = document.getElementById(configElementId);
            
            if (configElement) {
                try {
                    const config = JSON.parse(configElement.textContent);
                    window.initEstimateCalculator(container, config);
                } catch (e) {
                    console.error('Config parse error:', e);
                    container.innerHTML = '<div style="border: 2px solid red; padding: 20px;">Config Error</div>';
                }
            }
        });
    },
    
    render: function(containerId) {
        console.log('🎯 EstimateCalculator.render called for:', containerId);
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<div style="border: 2px solid blue; padding: 20px;">Test Render Successful</div>';
        }
    }
};

console.log('✅ WordPress integration functions registered');
console.log('Available: window.initEstimateCalculator, window.EstimateCalculator');

// Auto-run initialization if containers exist
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.estimate-calculator-react-root')) {
        console.log('🔄 Auto-running EstimateCalculator.init');
        window.EstimateCalculator.init();
    }
});

setTimeout(function() {
    if (document.querySelector('.estimate-calculator-react-root')) {
        console.log('🔄 Delayed auto-running EstimateCalculator.init');
        window.EstimateCalculator.init();
    }
}, 1000);
