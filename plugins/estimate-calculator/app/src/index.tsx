import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// Type definition for WordPress configuration
interface WordPressConfig {
  mode: "home" | "calculator";
  slug: string | null;
  calculatorId: number | null;
  calculatorTitle: string | null;
  calculatorSlug: string | null;
  formFields: {
    form_headline?: string;
    form_description?: string;
    form_footer_text?: string;
  };
  questions: any[];
  apiEndpoints: {
    getData: string;
    getQuestions: string;
    getCategoryData: string;
    getResults: string;
    getEmail: string;
    sendEmail: string;
    createCustomer: string;
  };
}

// Function to render the app in a given container with optional WordPress config
const renderApp = (containerId: string, wpConfig?: WordPressConfig) => {
  const container = document.getElementById(containerId);
  if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App wpConfig={wpConfig} />
      </React.StrictMode>
    );
    console.log(
      `✅ Estimate Calculator rendered in container: ${containerId}`,
      wpConfig ? "with WordPress config" : "standalone mode"
    );
    return true;
  }
  return false;
};

// WordPress integration - Method 1: Direct container and config approach
(window as any).initEstimateCalculator = function (
  containerElement: HTMLElement,
  config: WordPressConfig
) {
  console.log("🔧 WordPress initEstimateCalculator called with:", config);

  try {
    const root = ReactDOM.createRoot(containerElement);
    root.render(
      <React.StrictMode>
        <App wpConfig={config} />
      </React.StrictMode>
    );
    console.log("✅ WordPress integration successful");
  } catch (error) {
    console.error("❌ WordPress integration failed:", error);
    containerElement.innerHTML =
      '<div style="padding: 20px; border: 2px solid red; color: red;">Failed to initialize Estimate Calculator</div>';
  }
};

// WordPress integration - Method 2: Init method that finds containers
const initWordPressContainers = () => {
  console.log("🔧 WordPress EstimateCalculator.init called");

  // Find WordPress plugin containers
  const wpContainers = document.querySelectorAll(
    ".estimate-calculator-react-root"
  );
  let initialized = 0;

  wpContainers.forEach((container) => {
    const containerId = container.id;
    const configElementId = containerId.replace("-react-root", "-config");
    const configElement = document.getElementById(configElementId);

    if (configElement) {
      try {
        const config: WordPressConfig = JSON.parse(
          configElement.textContent || "{}"
        );
        console.log(
          `📋 Found WordPress config for container ${containerId}:`,
          config
        );

        const root = ReactDOM.createRoot(container as HTMLElement);
        root.render(
          <React.StrictMode>
            <App wpConfig={config} />
          </React.StrictMode>
        );
        initialized++;
        console.log(`✅ Initialized WordPress container: ${containerId}`);
      } catch (error) {
        console.error(
          `❌ Failed to parse config for container ${containerId}:`,
          error
        );
        container.innerHTML =
          '<div style="padding: 20px; border: 2px solid orange; color: orange;">Configuration error</div>';
      }
    } else {
      console.warn(`⚠️ No config found for container ${containerId}`);
    }
  });

  console.log(
    `📊 WordPress initialization complete. Initialized ${initialized} containers.`
  );
  return initialized > 0;
};

// Standard React app initialization for development
const tryRender = () => {
  console.log("🚀 Starting standard React app initialization");

  // First try the standard React app container
  if (renderApp("root")) {
    console.log("✅ Rendered in standard React root container");
    return;
  }

  // Then try WordPress shortcode containers
  if (renderApp("estimate-calculator-app")) {
    console.log("✅ Rendered in WordPress shortcode container");
    return;
  }

  // Try generic calculator container
  if (renderApp("calculator-app")) {
    console.log("✅ Rendered in generic calculator container");
    return;
  }

  // Try any container with the class 'estimate-calculator'
  const classContainer = document.querySelector(".estimate-calculator");
  if (classContainer && classContainer.id) {
    renderApp(classContainer.id);
    console.log("✅ Rendered in found estimate-calculator container");
    return;
  }

  // If no specific container found, create one and render
  console.warn("⚠️ No suitable container found, creating default container");
  const defaultContainer = document.createElement("div");
  defaultContainer.id = "estimate-calculator-default";
  document.body.appendChild(defaultContainer);
  renderApp("estimate-calculator-default");
};

// Make functions globally available for WordPress integration
(window as any).EstimateCalculator = {
  render: renderApp,
  init: initWordPressContainers, // Use WordPress-specific init
  tryRender: tryRender, // Keep the original for fallback
};

// Auto-initialization logic
const initialize = () => {
  // First, try WordPress integration
  if (initWordPressContainers()) {
    console.log("🎯 WordPress integration mode activated");
    return;
  }

  // Fallback to standard React app initialization
  console.log("🔄 Falling back to standard React app initialization");
  tryRender();
};

// Render when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  // Small delay to ensure WordPress containers are ready
  setTimeout(initialize, 100);
}

// Log that WordPress integration functions are available
console.log("🔧 WordPress integration functions registered:");
console.log("• window.initEstimateCalculator(container, config)");
console.log("• window.EstimateCalculator.init()");

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
