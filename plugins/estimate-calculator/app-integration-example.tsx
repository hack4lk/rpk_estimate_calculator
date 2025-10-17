// Add this interface to your App.tsx file (at the top)

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

interface AppProps {
  wpConfig?: WordPressConfig;
}

// Update your App component to accept WordPress config
function App({ wpConfig }: AppProps) {
  // Check if this is being loaded by WordPress
  if (wpConfig) {
    console.log("🎯 Running in WordPress mode:", wpConfig.mode);
    console.log("📊 WordPress config:", wpConfig);

    if (wpConfig.mode === "home") {
      // Show calculator home screen/selector
      return (
        <div className="estimate-calculator-wp-home">
          <h2>
            {wpConfig.formFields.form_headline || "Choose Your Calculator"}
          </h2>
          <p>
            {wpConfig.formFields.form_description ||
              "Welcome to the Estimate Calculator!"}
          </p>

          {/* Add your calculator selection UI here */}
          <div className="calculator-selector">
            <p>Calculator selection interface goes here</p>
            {/* You can use wpConfig.apiEndpoints to fetch available calculators */}
          </div>

          {wpConfig.formFields.form_footer_text && (
            <footer className="calculator-footer">
              <p>{wpConfig.formFields.form_footer_text}</p>
            </footer>
          )}
        </div>
      );
    } else if (wpConfig.mode === "calculator") {
      // Show specific calculator
      return (
        <div className="estimate-calculator-wp-calculator">
          <h2>{wpConfig.calculatorTitle || "Calculator"}</h2>

          {wpConfig.formFields.form_headline && (
            <div className="calculator-headline">
              <h3>{wpConfig.formFields.form_headline}</h3>
            </div>
          )}

          {wpConfig.formFields.form_description && (
            <div className="calculator-description">
              <p>{wpConfig.formFields.form_description}</p>
            </div>
          )}

          {/* Render your calculator UI here */}
          <div className="calculator-interface">
            <p>Calculator slug: {wpConfig.slug}</p>
            <p>Questions available: {wpConfig.questions.length}</p>

            {/* You can access wpConfig.questions, wpConfig.apiEndpoints, etc. */}
            {/* Example: */}
            {wpConfig.questions.length > 0 && (
              <div className="questions-preview">
                <h4>Available Questions:</h4>
                <ul>
                  {wpConfig.questions.slice(0, 3).map((question, index) => (
                    <li key={index}>
                      {JSON.stringify(question).substring(0, 100)}...
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {wpConfig.formFields.form_footer_text && (
            <footer className="calculator-footer">
              <p>{wpConfig.formFields.form_footer_text}</p>
            </footer>
          )}
        </div>
      );
    }
  }

  // Default React app behavior (for development)
  return (
    <div className="App">
      <h1>Estimate Calculator (Development Mode)</h1>
      {/* Your regular React app content goes here */}

      {/* This is where your existing app content should go */}
      <div className="development-interface">
        <p>This is your normal React app interface for development.</p>
        <p>
          When embedded in WordPress, the app will show the WordPress-specific
          interface above.
        </p>
      </div>
    </div>
  );
}

export default App;
