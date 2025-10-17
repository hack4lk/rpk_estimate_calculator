import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// Function to render the app in a given container
const renderApp = (containerId: string) => {
  const container = document.getElementById(containerId);
  if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log(`✅ Estimate Calculator rendered in container: ${containerId}`);
    return true;
  }
  console.warn(`❌ Container with ID "${containerId}" not found`);
  return false;
};

// Expose renderApp function globally for external use
declare global {
  interface Window {
    EstimateCalculator: {
      renderApp: (containerId: string) => boolean;
      render: (containerId: string) => boolean;
      init: () => void;
    };
    wp?: any;
    estimateCalculatorWP?: any;
  }
}

// Preserve existing window functions before setting new ones
const existingEstimateCalculator = window.EstimateCalculator || {};

window.EstimateCalculator = {
  ...existingEstimateCalculator,
  renderApp: renderApp,
  render: renderApp, // Alias for backward compatibility
  init: () => {
    tryRender();
  },
};

// Try to render in different possible containers (only for standalone mode)
const tryRender = () => {
  // First try the standard React app container
  if (renderApp("root")) {
    return;
  }

  // Then try WordPress shortcode containers
  if (renderApp("estimate-calculator-app")) {
    return;
  }

  // Try generic calculator container
  if (renderApp("calculator-app")) {
    return;
  }

  // Try any container with the class 'estimate-calculator'
  const classContainer = document.querySelector(".estimate-calculator");
  if (classContainer && classContainer.id) {
    renderApp(classContainer.id);
    return;
  }

  // If no specific container found, create one and render
  console.warn("No suitable container found, creating default container");
  const defaultContainer = document.createElement("div");
  defaultContainer.id = "estimate-calculator-default";
  document.body.appendChild(defaultContainer);
  renderApp("estimate-calculator-default");
};

// Check if we're in a WordPress environment
const isWordPressEnvironment = () => {
  // Check for WordPress indicators
  return !!(
    window.wp ||
    document.querySelector("body.wp-admin") ||
    document.querySelector('meta[name="generator"][content*="WordPress"]') ||
    window.estimateCalculatorWP ||
    document.querySelector(".estimate-calculator-react-root")
  );
};

// Only auto-render if NOT in WordPress environment
// In WordPress, the integration script will handle rendering
if (!isWordPressEnvironment()) {
  // Render when DOM is ready (standalone mode only)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryRender);
  } else {
    tryRender();
  }
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
