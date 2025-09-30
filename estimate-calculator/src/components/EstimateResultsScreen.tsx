import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Category, CalculatorData } from "../types";
import { apiService } from "../services/api";
import { useCalculator } from "../contexts/CalculatorContext";

interface EstimateResultsScreenProps {
  category: Category;
  formData: any;
  onRestart: () => void;
}

interface CalculatorResults {
  calculator_results_headline: string;
  calculator_results_description: string;
  calculator_results_footer_text: string;
  calculator_results_disclaimer: string;
}

interface ResultsApiResponse {
  success: boolean;
  data: CalculatorResults;
  timestamp: number;
}

const EstimateResultsScreen: React.FC<EstimateResultsScreenProps> = ({
  category,
  formData,
  onRestart,
}) => {
  const { getCategoryQuestions } = useCalculator();

  // Get selected options for this category
  const selectedOptionsForCategory = getCategoryQuestions(category.id);

  // Fetch category data to get questions and options
  const { data: categoryData, isLoading: categoryLoading } =
    useQuery<CalculatorData>({
      queryKey: ["categoryData", category.id],
      queryFn: () => apiService.getCategoryData(category.id),
      staleTime: 5 * 60 * 1000,
    });

  const {
    data: resultsData,
    isLoading,
    error,
  } = useQuery<ResultsApiResponse>({
    queryKey: ["calculatorResults", category.id],
    queryFn: () => apiService.getCalculatorResults(category.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Fetch email template
  const { data: emailData, isLoading: emailLoading } = useQuery({
    queryKey: ["calculatorEmail"],
    queryFn: () => apiService.getCalculatorEmail(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Send email and create customer when both results and email template are loaded
  React.useEffect(() => {
    console.log("email data", emailData);
    if (
      resultsData &&
      emailData &&
      formData &&
      formData.email &&
      formData.name
    ) {
      const sendEmailAndCreateCustomer = async () => {
        try {
          console.log("📧 Processing email and customer creation...");
          console.log("📧 Email data structure:", emailData);
          console.log("📧 Email HTML content:", emailData.data?.email_html);
          console.log("📧 Email subject:", emailData.data?.email_subject);
          console.log("📧 Form data:", formData);

          // Send email
          console.log("📧 Sending calculator email...");
          await apiService.sendCalculatorEmail(
            formData.email,
            formData.name,
            emailData.data.email_html,
            emailData.data.email_subject
          );
          console.log("✅ Email sent successfully");

          // Create JobTread customer
          console.log("👤 Creating JobTread customer...");
          await apiService.createJobTreadCustomer(formData);
          console.log("✅ JobTread customer created successfully");
        } catch (error) {
          console.error("❌ Failed to process email/customer creation:", error);
        }
      };

      sendEmailAndCreateCustomer();
    }
  }, [resultsData, emailData, formData]);

  // Debug logging
  React.useEffect(() => {
    console.log("🎯 EstimateResultsScreen - Query State:", {
      categoryId: category.id,
      isLoading,
      error: error?.message,
      hasData: !!resultsData,
      resultsData: resultsData,
      dataStructure: resultsData ? Object.keys(resultsData) : "no data",
      dataProperty: resultsData?.data
        ? Object.keys(resultsData.data)
        : "no data.data property",
    });
    if (error) {
      console.error("🚨 EstimateResultsScreen - Error details:", error);
    }
    if (resultsData) {
      console.log("📊 EstimateResultsScreen - Data received:", resultsData);
    }
  }, [category.id, isLoading, error, resultsData]);

  if (isLoading || categoryLoading || emailLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <Box textAlign="center">
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Calculating Your Estimate...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we prepare your personalized results.
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Unable to Load Your Estimate Results
          </Typography>
          <Typography>
            We're experiencing technical difficulties loading your estimate
            results. Please try restarting the estimate or contact support if
            the problem persists.
          </Typography>
        </Alert>
        <Box textAlign="center">
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRestart}
            sx={{
              bgcolor: "#C12530",
              "&:hover": {
                bgcolor: "#A01E28",
              },
            }}
          >
            RESTART ESTIMATE
          </Button>
        </Box>
      </Container>
    );
  }

  // Check if resultsData or resultsData.data is undefined
  if (!resultsData || !resultsData.data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Results Data Not Available
          </Typography>
          <Typography>
            The results data structure is unexpected. Please try restarting the
            estimate.
          </Typography>
        </Alert>
        <Box textAlign="center">
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRestart}
            sx={{
              bgcolor: "#C12530",
              "&:hover": {
                bgcolor: "#A01E28",
              },
            }}
          >
            RESTART ESTIMATE
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Page Headline with Category Name */}
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              mb: 2,
              textAlign: "left",
              fontSize: "48px",
            }}
          >
            {category.title}
          </Typography>

          {/* Horizontal Rule */}
          <Box
            sx={{
              width: "100%",
              height: "2px",
              bgcolor: "red",
              mb: 4,
            }}
          />

          {/* Calculator Results Headline */}
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "primary.main",
              mb: 4,
              textAlign: "left",
              fontSize: "32px",
            }}
          >
            {resultsData?.data.calculator_results_headline}
          </Typography>

          {/* Calculator Results Description */}
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              lineHeight: 1.6,
              fontSize: "1.1rem",
            }}
            dangerouslySetInnerHTML={{
              __html: resultsData?.data.calculator_results_description || "",
            }}
          />

          {/* Estimate Breakdown */}
          {categoryData && (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  color: "red",
                  mb: 3,
                }}
              >
                Estimate Breakdown
              </Typography>

              <Paper
                sx={{ p: 0, border: "1px solid", borderColor: "grey.300" }}
              >
                {/* Option Rows */}
                {Object.entries(selectedOptionsForCategory).map(
                  ([questionIndex, optionIndex]) => {
                    const question =
                      categoryData.questions[parseInt(questionIndex)];
                    const option = question?.option[optionIndex];

                    if (!option) return null;

                    return (
                      <Box
                        key={`${questionIndex}-${optionIndex}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 2,
                          borderBottom: "1px solid",
                          borderColor: "grey.200",
                          "&:last-child": {
                            borderBottom: "none",
                          },
                        }}
                      >
                        {/* Left side: Image + Option name */}
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <img
                            src={
                              option.featured_image?.url ||
                              "/placeholder-image.jpg"
                            }
                            alt={option.short_description}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: "medium" }}
                          >
                            {option.short_description}
                          </Typography>
                        </Box>

                        {/* Right side: Cost range */}
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: "medium" }}
                        >
                          ${parseInt(option.minimum_cost).toLocaleString()} - $
                          {parseInt(option.maximum_cost).toLocaleString()}
                        </Typography>
                      </Box>
                    );
                  }
                )}

                {/* Total Row */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    bgcolor: "grey.100",
                    fontWeight: "bold",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Estimate Total
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    $
                    {(() => {
                      let minTotal = 0;
                      let maxTotal = 0;

                      Object.entries(selectedOptionsForCategory).forEach(
                        ([questionIndex, optionIndex]) => {
                          const question =
                            categoryData.questions[parseInt(questionIndex)];
                          const option = question?.option[optionIndex];
                          if (option) {
                            minTotal += parseInt(option.minimum_cost);
                            maxTotal += parseInt(option.maximum_cost);
                          }
                        }
                      );

                      return `${minTotal.toLocaleString()} - $${maxTotal.toLocaleString()}`;
                    })()}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}

          {/* Calculator Results Footer Text */}
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              lineHeight: 1.6,
              p: 3,
              bgcolor: "grey.50",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.200",
              fontSize: "22px",
            }}
            dangerouslySetInnerHTML={{
              __html: resultsData?.data.calculator_results_footer_text || "",
            }}
          />

          {/* Calculator Results Disclaimer */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 4,
              fontStyle: "italic",
              lineHeight: 1.5,
              p: 2,
              bgcolor: "white",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "grey.300",
            }}
            dangerouslySetInnerHTML={{
              __html: resultsData?.data.calculator_results_disclaimer || "",
            }}
          />
        </CardContent>
      </Card>

      {/* Restart Button */}
      <Box textAlign="left">
        <Button
          variant="contained"
          size="large"
          startIcon={<RefreshIcon />}
          onClick={onRestart}
          sx={{
            minWidth: 200,
            bgcolor: "#C12530",
            "&:hover": {
              bgcolor: "#A01E28",
            },
            fontSize: "1.1rem",
            py: 1.5,
          }}
        >
          RESTART ESTIMATE
        </Button>
      </Box>
    </Container>
  );
};

export default EstimateResultsScreen;
