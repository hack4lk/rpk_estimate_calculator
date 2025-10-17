// WordPress Integration Script for Estimate Calculator React App
// This script provides WordPress-specific initialization functions

// WordPress integration function for initializing calculator with config
window.initEstimateCalculator = function(containerElement, config) {
    console.log('🔗 WordPress integration initializing calculator in:', containerElement.id, 'with config:', config);
    
    // Use the React app's renderApp function if available
    if (window.EstimateCalculator && typeof window.EstimateCalculator.renderApp === 'function') {
        console.log('✅ Using EstimateCalculator.renderApp for container:', containerElement.id);
        return window.EstimateCalculator.renderApp(containerElement.id);
    }
    
    // Fallback: try the render alias
    if (window.EstimateCalculator && typeof window.EstimateCalculator.render === 'function') {
        console.log('✅ Using EstimateCalculator.render for container:', containerElement.id);
        return window.EstimateCalculator.render(containerElement.id);
    }
    
    console.error('❌ EstimateCalculator.renderApp not available');
    return false;
};

window.EstimateCalculator = window.EstimateCalculator || {};
window.EstimateCalculator.init = function() {
    console.log('🔍 WordPress integration scanning for calculator containers...');
    
    // Find WordPress containers and initialize them
    const containers = document.querySelectorAll('.estimate-calculator-react-root');
    console.log(`📦 Found ${containers.length} calculator containers`);
    
    containers.forEach(container => {
        const configElementId = container.id.replace('-react-root', '-config');
        const configElement = document.getElementById(configElementId);
        
        console.log(`🔧 Processing container: ${container.id}, config element: ${configElementId}`);
        
        if (configElement) {
            try {
                const config = JSON.parse(configElement.textContent);
                console.log('📋 Parsed config:', config);
                
                const success = window.initEstimateCalculator(container, config);
                if (success) {
                    console.log(`✅ Successfully initialized calculator in: ${container.id}`);
                } else {
                    console.error(`❌ Failed to initialize calculator in: ${container.id}`);
                }
            } catch (e) {
                console.error('❌ Failed to parse calculator configuration:', e);
                container.innerHTML = '<div style="padding: 20px; border: 1px solid #dc3545; background: #f8d7da; color: #721c24;">Failed to load calculator configuration.</div>';
            }
        } else {
            console.error(`❌ Config element not found: ${configElementId}`);
        }
    });
};
