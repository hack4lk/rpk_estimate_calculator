import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Box,
  Button,
  Divider,
  Paper,
  Alert,
  CircularProgress,
  Skeleton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Category, CalculatorData, CategoryOption } from "../types";
import { apiService } from "../services/api";
import { useCalculator } from "../contexts/CalculatorContext";

interface CategoryDetailScreenProps {
  category: Category;
  onBackToHome: () => void;
  onGoToForm: (categoryData: CalculatorData) => void;
}

const CategoryDetailScreen: React.FC<CategoryDetailScreenProps> = ({
  category,
  onBackToHome,
  onGoToForm,
}) => {
  const [selectedOption, setSelectedOption] = useState<CategoryOption | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Use global calculator context
  const {
    getSelectedOption,
    setSelectedOption: setGlobalSelectedOption,
    removeSelectedOption,
    getAllContextData,
    getCategoryQuestions,
  } = useCalculator();

  const contextData = getAllContextData();

  const handleLearnMore = (option: CategoryOption) => {
    setSelectedOption(option);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOption(null);
  };

  const handleOptionClick = (
    option: CategoryOption,
    questionIndex: number,
    optionIndex: number
  ) => {
    const currentSelection = getSelectedOption(
      category.id.toString(),
      questionIndex
    );

    // If this option is already selected for this question, deselect it
    if (currentSelection === optionIndex) {
      removeSelectedOption(category.id.toString(), questionIndex);
    } else {
      // Otherwise, select this option for this question (replacing any previous selection)
      setGlobalSelectedOption(
        category.id.toString(),
        questionIndex,
        optionIndex
      );
    }
  };

  const handleNextQuestion = () => {
    if (categoryData) {
      if (currentQuestionIndex < categoryData.questions.length - 1) {
        // Move to next question
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // We're at the last question - check if all questions are answered
        const categorySelections = getCategoryQuestions(category.id.toString());
        const totalQuestions = categoryData.questions.length;
        const answeredQuestions = Object.keys(categorySelections).length;

        if (answeredQuestions === totalQuestions) {
          // All questions answered, go to form
          onGoToForm(categoryData);
        }
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };
  const {
    data: categoryData,
    isLoading,
    error,
  } = useQuery<CalculatorData>({
    queryKey: ["categoryData", category.id],
    queryFn: () => apiService.getCategoryData(category.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Debug logging
  React.useEffect(() => {
    console.log("🏗️ CategoryDetailScreen - Query State:", {
      categoryId: category.id,
      isLoading,
      error: error?.message,
      hasData: !!categoryData,
    });
    if (error) {
      console.error("🚨 CategoryDetailScreen - Error details:", error);
    }
    if (categoryData) {
      console.log("📊 CategoryDetailScreen - Data received:", categoryData);
    }
  }, [category.id, isLoading, error, categoryData]);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box mb={3}>
          <Skeleton variant="rectangular" width={200} height={40} />
        </Box>
        <Paper elevation={2} sx={{ mb: 4, overflow: "hidden" }}>
          <Box display="flex" flexDirection={{ xs: "column", md: "row" }}>
            <Skeleton variant="rectangular" width={400} height={300} />
            <CardContent sx={{ flex: 1, p: 4 }}>
              <Skeleton variant="text" width="80%" height={50} />
              <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" width={150} height={40} />
            </CardContent>
          </Box>
        </Paper>
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Skeleton variant="text" width="40%" height={40} />
              <Skeleton variant="text" width="20%" height={20} sx={{ mb: 2 }} />
              <Box
                display="grid"
                gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
                gap={2}
              >
                {Array.from({ length: 3 }).map((_, optIndex) => (
                  <Card key={optIndex}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" width="80%" height={30} />
                      <Skeleton variant="text" width="60%" height={20} />
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBackToHome}
            sx={{ mb: 2 }}
          >
            Back to Categories
          </Button>
        </Box>
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Unable to Load Category Details
          </Typography>
          <Typography>
            We're experiencing technical difficulties loading the{" "}
            {category.title} calculator. Please try refreshing the page or
            contact support if the problem persists.
          </Typography>
        </Alert>
        <Box textAlign="center">
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Retrying connection...
          </Typography>
        </Box>
      </Container>
    );
  }

  console.log("All selections:", contextData.selectedOptions);
  const categorySelections = getCategoryQuestions("kitchens");
  console.log("Selections for current category:", categorySelections);
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBackToHome}
          sx={{ mb: 2 }}
        >
          Back to Categories
        </Button>
      </Box>

      {/* Questions and Options */}
      {categoryData?.questions && categoryData.questions.length > 0 && (
        <>
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{ fontWeight: "semibold" }}
              >
                {categoryData.questions[currentQuestionIndex].question_text}{" "}
                <em>(click to select)</em>
              </Typography>
              {categoryData.questions[currentQuestionIndex]
                .question_help_text && (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  {
                    categoryData.questions[currentQuestionIndex]
                      .question_help_text
                  }
                </Typography>
              )}
              <Divider sx={{ mb: 3 }} />

              {/* Question Pagination */}
              <Box
                display="flex"
                justifyContent="flex-start"
                gap={1}
                sx={{ mb: 4 }}
              >
                {categoryData.questions.map((_, questionIndex) => (
                  <Box
                    key={questionIndex}
                    sx={{
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 1,
                      fontSize: "0.875rem",
                      fontWeight: "medium",
                      bgcolor:
                        questionIndex === currentQuestionIndex
                          ? "#C12530"
                          : "transparent",
                      border:
                        questionIndex === currentQuestionIndex
                          ? "none"
                          : "1px solid #C12530",
                      color:
                        questionIndex === currentQuestionIndex
                          ? "white"
                          : "#C12530",
                    }}
                  >
                    {questionIndex + 1}
                  </Box>
                ))}
              </Box>

              {/* Options Grid */}
              <Box
                display="grid"
                gridTemplateColumns={{
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                }}
                gap={3}
                justifyItems="center"
              >
                {categoryData.questions[currentQuestionIndex].option.map(
                  (option, optionIndex) => {
                    const isSelected =
                      getSelectedOption(
                        category.id.toString(),
                        currentQuestionIndex
                      ) === optionIndex;

                    return (
                      <Card
                        key={optionIndex}
                        onClick={() =>
                          handleOptionClick(
                            option,
                            currentQuestionIndex,
                            optionIndex
                          )
                        }
                        sx={{
                          height: "100%",
                          maxWidth: 350,
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                          cursor: "pointer",
                          bgcolor: isSelected ? "#C12530" : "black",
                          color: "white",
                          position: "relative",
                          transition:
                            "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, background-color 0.2s ease-in-out",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: 3,
                          },
                        }}
                      >
                        {/* Checkmark overlay */}
                        {isSelected && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              zIndex: 2,
                              bgcolor: "white",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 64,
                              height: 64,
                            }}
                          >
                            <CheckCircleIcon
                              sx={{ color: "#C12530", fontSize: 48 }}
                            />
                          </Box>
                        )}

                        <CardMedia
                          component="img"
                          sx={{
                            width: "100%",
                            aspectRatio: "1",
                            objectFit: "cover",
                            padding: "5px",
                          }}
                          image={option.featured_image.url}
                          alt={option.short_description}
                        />
                        <CardContent
                          sx={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                            bgcolor: "transparent",
                          }}
                        >
                          <Typography
                            gutterBottom
                            variant="h6"
                            component="h3"
                            sx={{
                              fontWeight: "semibold",
                              mb: 2,
                              flexGrow: 1,
                              color: "white",
                              textAlign: "center",
                            }}
                          >
                            {option.short_description}
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click when button is clicked
                              handleLearnMore(option);
                            }}
                            sx={{
                              mt: "auto",
                              borderColor: "white",
                              color: "white",
                              "&:hover": {
                                borderColor: "white",
                                bgcolor: "rgba(255, 255, 255, 0.1)",
                              },
                            }}
                          >
                            Learn More
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  }
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Navigation Controls */}
          <Box
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
            gap={2}
            sx={{ mb: 4 }}
          >
            <Button
              variant="outlined"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              sx={{ minWidth: 120 }}
            >
              Back
            </Button>

            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={handleNextQuestion}
              disabled={
                getSelectedOption(
                  category.id.toString(),
                  currentQuestionIndex
                ) === undefined
              }
              sx={{
                minWidth: 120,
                bgcolor: "#C12530",
                "&:hover": {
                  bgcolor: "#A01E28",
                },
                "&:disabled": {
                  bgcolor: "rgba(0, 0, 0, 0.26)",
                },
              }}
            >
              Next
            </Button>
          </Box>
        </>
      )}

      {/* Option Details Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: "500px",
            bgcolor: "black",
            color: "white",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "black",
            color: "white",
            borderBottom: "1px solid #333",
          }}
        >
          <Typography variant="h5" component="div" color="white">
            {selectedOption?.short_description}
          </Typography>
          <IconButton
            onClick={handleCloseModal}
            size="small"
            sx={{ color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            bgcolor: "black",
            color: "white",
            borderColor: "#333",
          }}
        >
          {selectedOption && (
            <Box
              display="flex"
              gap={3}
              flexDirection={{ xs: "column", md: "row" }}
            >
              {/* Left side - Square Image */}
              <Box flexShrink={0}>
                <CardMedia
                  component="img"
                  sx={{
                    width: { xs: "100%", md: "400px" },
                    height: { xs: "300px", md: "400px" },
                    objectFit: "cover",
                    borderRadius: 1,
                  }}
                  image={selectedOption.featured_image.url}
                  alt={selectedOption.short_description}
                />
              </Box>

              {/* Right side - Information */}
              <Box flex={1}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "semibold", color: "white" }}
                >
                  Description
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 3,
                    lineHeight: 1.6,
                    color: "white",
                    // Handle HTML content safely
                    "& p": { margin: "0 0 1rem 0" },
                    "& div": { margin: "0 0 1rem 0" },
                  }}
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedOption.long_description ||
                      "No description available",
                  }}
                />

                {(selectedOption.minimum_cost !== "0" ||
                  selectedOption.maximum_cost !== "0") && (
                  <Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "semibold", color: "white" }}
                    >
                      Estimated Cost Range
                    </Typography>
                    <Chip
                      label={`$${parseInt(
                        selectedOption.minimum_cost
                      ).toLocaleString()} - $${parseInt(
                        selectedOption.maximum_cost
                      ).toLocaleString()}`}
                      color="primary"
                      variant="filled"
                      size="medium"
                      sx={{ fontSize: "1rem", py: 1 }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default CategoryDetailScreen;
