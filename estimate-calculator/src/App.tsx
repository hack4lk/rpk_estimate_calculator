import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Alert, Container, Box, Button } from "@mui/material";
import HomeScreen from "./components/HomeScreen";
import CategoryDetailScreen from "./components/CategoryDetailScreen";
import EstimateFormScreen from "./components/EstimateFormScreen";
import EstimateResultsScreen from "./components/EstimateResultsScreen";
import { Category, CalculatorData } from "./types";
import { apiService } from "./services/api";
import {
  CalculatorProvider,
  useCalculator,
} from "./contexts/CalculatorContext";

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    primary: {
      main: "#000",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: '"Ovo", serif',
  },
});

function App() {
  const [currentScreen, setCurrentScreen] = useState<
    "home" | "category" | "form" | "results" | "error"
  >("home");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [categoryData, setCategoryData] = useState<CalculatorData | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Check URL parameters on component mount
  useEffect(() => {
    const checkUrlParameters = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get("calculator-category");

        if (categoryParam) {
          console.log(
            `🔍 Found calculator-category parameter: ${categoryParam}`
          );

          // Fetch home page data to get available categories
          const homeData = await apiService.getHomePageData();

          // Find the category that matches the URL parameter
          const matchedCategory = homeData.categories.find(
            (category) =>
              category.id === categoryParam ||
              category.title.toLowerCase().replace(/\s+/g, "-") ===
                categoryParam.toLowerCase()
          );

          if (matchedCategory) {
            console.log(`✅ Found matching category:`, matchedCategory);
            setSelectedCategory(matchedCategory);
            setCurrentScreen("category");
          } else {
            console.error(`❌ Category not found: ${categoryParam}`);
            setErrorMessage(
              `Category "${categoryParam}" does not exist. Please check the URL and try again.`
            );
            setCurrentScreen("error");
          }
        }
      } catch (error) {
        console.error("Error checking URL parameters:", error);
        setErrorMessage(
          "Unable to load the requested category. Please try again later."
        );
        setCurrentScreen("error");
      } finally {
        setIsInitializing(false);
      }
    };

    checkUrlParameters();
  }, []);

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <QueryClientProvider client={queryClient}>
        <CalculatorProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="lg" sx={{ py: 4 }}>
              <Box textAlign="center">Loading...</Box>
            </Container>
          </ThemeProvider>
        </CalculatorProvider>
      </QueryClientProvider>
    );
  }

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setCurrentScreen("category");

    // Update URL parameter
    const url = new URL(window.location.href);
    url.searchParams.set("calculator-category", category.id);
    window.history.pushState({}, "", url.toString());
  };

  const handleBackToHome = () => {
    setCurrentScreen("home");
    setSelectedCategory(null);
    setCategoryData(null);
  };

  const handleGoToForm = (data: CalculatorData) => {
    setCategoryData(data);
    setCurrentScreen("form");
  };

  const handleBackToCategory = () => {
    setCurrentScreen("category");
  };

  const handleFormSubmit = (submittedFormData: any) => {
    console.log("Form submitted:", submittedFormData);
    setFormData(submittedFormData);
    setCurrentScreen("results");
  };

  const handleRestart = () => {
    setCurrentScreen("home");
    setSelectedCategory(null);
    setCategoryData(null);
    setFormData(null);
    setErrorMessage("");

    // Clear URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete("calculator-category");
    window.history.replaceState({}, "", url.toString());
  };

  const AppContent = () => {
    const { clearCategorySelections } = useCalculator();

    const handleBackToHomeWithClearContext = () => {
      if (selectedCategory) {
        clearCategorySelections(selectedCategory.id.toString());
      }
      handleBackToHome();
    };

    const handleRestartWithClearContext = () => {
      if (selectedCategory) {
        clearCategorySelections(selectedCategory.id.toString());
      }
      handleRestart();
    };

    return (
      <div className="App">
        {currentScreen === "home" && (
          <HomeScreen onCategoryClick={handleCategoryClick} />
        )}
        {currentScreen === "category" && selectedCategory && (
          <CategoryDetailScreen
            category={selectedCategory}
            onBackToHome={handleBackToHomeWithClearContext}
            onGoToForm={handleGoToForm}
          />
        )}
        {currentScreen === "form" && selectedCategory && categoryData && (
          <EstimateFormScreen
            category={selectedCategory}
            categoryData={categoryData}
            onBack={handleBackToCategory}
            onSubmit={handleFormSubmit}
          />
        )}
        {currentScreen === "results" && selectedCategory && formData && (
          <EstimateResultsScreen
            category={selectedCategory}
            formData={formData}
            onRestart={handleRestartWithClearContext}
          />
        )}
        {currentScreen === "error" && (
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Alert severity="error" sx={{ mb: 4 }}>
              <Box>
                <h2>Category Not Found</h2>
                <p>{errorMessage}</p>
                <Button
                  variant="contained"
                  onClick={handleRestart}
                  sx={{ mt: 2 }}
                >
                  Return to Home
                </Button>
              </Box>
            </Alert>
          </Container>
        )}
      </div>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <CalculatorProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppContent />
        </ThemeProvider>
      </CalculatorProvider>
    </QueryClientProvider>
  );
}

export default App;
