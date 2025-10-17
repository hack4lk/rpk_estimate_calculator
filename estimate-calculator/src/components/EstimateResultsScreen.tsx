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

  // State to track if email has been sent to prevent duplicates
  const [emailSent, setEmailSent] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Use ref to track if email processing has been initiated for this specific form data
  const emailProcessingRef = React.useRef<boolean>(false);

  // Get selected options for this category
  const selectedOptionsForCategory = getCategoryQuestions(category.id);

  // Fetch category data to get questions and options
  const { data: categoryData, isLoading: categoryLoading } =
    useQuery<CalculatorData>({
      queryKey: ["categoryData", category.id],
      queryFn: () => apiService.getCategoryData(category.id),
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
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
    refetchOnWindowFocus: false,
  });

  // Fetch email template
  const { data: emailData, isLoading: emailLoading } = useQuery({
    queryKey: ["calculatorEmail"],
    queryFn: () => apiService.getCalculatorEmail(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Generate HTML breakdown for email
  const generateEstimateBreakdownHTML = React.useCallback(() => {
    if (!categoryData || !selectedOptionsForCategory) return "";

    let html = `
      <div style="margin: 20px 0; font-family: Arial, sans-serif;">
        <h3 style="color: #333; margin-bottom: 15px;">Estimate Breakdown</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Cost Range</th>
            </tr>
          </thead>
          <tbody>
    `;

    // Add selected options to the breakdown
    Object.entries(selectedOptionsForCategory).forEach(
      ([questionIndex, optionIndex]) => {
        const question = categoryData.questions[parseInt(questionIndex)];
        const option = question?.option[optionIndex];

        if (option) {
          const minCost = parseFloat(option.minimum_cost) || 0;
          const maxCost = parseFloat(option.maximum_cost) || 0;
          const costRange =
            minCost === maxCost
              ? `$${minCost.toLocaleString()}`
              : `$${minCost.toLocaleString()} - $${maxCost.toLocaleString()}`;

          html += `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">
              ${
                option.featured_image?.url
                  ? `<img src="${option.featured_image.url}" alt="${
                      option.featured_image.alt || "Option image"
                    }" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; vertical-align: middle;">`
                  : ""
              }
            </td>
            <td style="padding: 10px; border: 1px solid #ddd;">
              <strong>${option.short_description}</strong><br>
              ${option.long_description || ""}
            </td>
            <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${costRange}</td>
          </tr>
        `;
        }
      }
    );

    // Calculate totals
    let minTotal = 0;
    let maxTotal = 0;

    Object.entries(selectedOptionsForCategory).forEach(
      ([questionIndex, optionIndex]) => {
        const question = categoryData.questions[parseInt(questionIndex)];
        const option = question?.option[optionIndex];
        if (option) {
          minTotal += parseInt(option.minimum_cost);
          maxTotal += parseInt(option.maximum_cost);
        }
      }
    );

    const totalRange =
      minTotal === maxTotal
        ? `$${minTotal.toLocaleString()}`
        : `$${minTotal.toLocaleString()} - $${maxTotal.toLocaleString()}`;

    html += `
          </tbody>
          <tfoot>
            <tr style="background-color: #f9f9f9; font-weight: bold;">
              <td colspan="2" style="padding: 15px; border: 1px solid #ddd; text-align: right; font-size: 16px;">
                <strong>Estimate Total:</strong>
              </td>
              <td style="padding: 15px; text-align: right; border: 1px solid #ddd; font-size: 16px; color: #e74c3c;">
                <strong>${totalRange}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    return html;
  }, [categoryData, selectedOptionsForCategory]);

  // Create a stable function for sending email that doesn't change on re-renders
  const sendEmailAndCreateCustomer = React.useCallback(async () => {
    if (emailProcessingRef.current) {
      console.log("📧 Email processing already completed, skipping...");
      return;
    }

    console.log("📧 Starting email processing...");
    // Mark this as being processed immediately to prevent re-entry
    emailProcessingRef.current = true;
    setIsProcessing(true);

    try {
      console.log("📧 Processing email and customer creation...");
      console.log("📧 Email data structure:", emailData);
      console.log("📧 Email HTML content:", emailData?.data?.email_html);
      console.log("📧 Email subject:", emailData?.data?.email_subject);
      console.log("📧 Form data:", formData);

      // Generate estimate breakdown HTML
      const estimateBreakdownHTML = generateEstimateBreakdownHTML();
      console.log(
        "📊 Generated estimate breakdown HTML:",
        estimateBreakdownHTML
      );

      // Combine email template with estimate breakdown
      const fullEmailHTML = `
        ${emailData.data.email_html}
        
        ${estimateBreakdownHTML}
      `;

      // console.log("📧 Full email HTML to be sent:", fullEmailHTML);
      // return;

      // Send email with estimate breakdown
      console.log("📧 Sending calculator email with estimate breakdown...");
      await apiService.sendCalculatorEmail(
        formData.email,
        formData.name,
        fullEmailHTML,
        emailData.data.email_subject
      );
      console.log("✅ Email sent successfully");

      // Send marketing notification to info@rpkconstruction.com
      console.log(
        "📬 Sending marketing notification to info@rpkconstruction.com..."
      );
      await apiService.sendMarketingNotification(
        formData,
        estimateBreakdownHTML
      );
      console.log("✅ Marketing notification sent successfully");

      // Create JobTread account and contact using enhanced endpoint
      console.log("🏢 Creating JobTread account and contact...");
      const accountResult = await apiService.createJobTreadAccountContact(
        formData
      );
      console.log(
        "✅ JobTread account and contact created successfully:",
        accountResult
      );

      // Mark email as sent
      setEmailSent(true);
    } catch (error) {
      console.error("❌ Failed to process email/customer creation:", error);
      // Reset the processing ref on error so user can retry
      emailProcessingRef.current = false;
    } finally {
      setIsProcessing(false);
    }
  }, [emailData, formData, generateEstimateBreakdownHTML]); // Added generateEstimateBreakdownHTML to dependencies

  // Send email and create customer when all data is available
  React.useEffect(() => {
    console.log("📧 Email processing check:", {
      hasProcessed: emailProcessingRef.current,
      isCurrentlyProcessing: isProcessing,
      hasResultsData: !!resultsData,
      hasEmailData: !!emailData,
      hasFormData: !!formData,
      hasEmail: !!formData?.email,
      hasName: !!formData?.name,
    });

    // Only proceed if we have all required data and haven't processed yet
    if (
      resultsData &&
      emailData?.data?.email_html &&
      emailData?.data?.email_subject &&
      formData?.email &&
      formData?.name &&
      !emailSent &&
      !emailProcessingRef.current
    ) {
      sendEmailAndCreateCustomer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    resultsData,
    emailData?.data?.email_html,
    emailData?.data?.email_subject,
    formData?.email,
    formData?.name,
    emailSent,
    sendEmailAndCreateCustomer,
  ]);

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

          {/* Processing Indicator */}
          {isProcessing && (
            <Alert
              severity="info"
              sx={{ mb: 4, display: "flex", alignItems: "center" }}
            >
              <CircularProgress size={20} sx={{ mr: 2 }} />
              <Typography>Processing... please wait</Typography>
            </Alert>
          )}

          {/* Success Indicator */}
          {emailSent && !isProcessing && (
            <Alert severity="success" sx={{ mb: 4 }}>
              <Typography>
                ✅ Your estimate has been processed and confirmation email has
                been sent to {formData?.email}
              </Typography>
            </Alert>
          )}

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
