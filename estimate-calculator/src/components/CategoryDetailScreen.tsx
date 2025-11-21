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
  TextField,
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
  const [customInputValues, setCustomInputValues] = useState<{
    [key: string]: string;
  }>({});
  const [customInputChoice, setCustomInputChoice] = useState<{
    [key: string]: boolean | null;
  }>({});
  const [customInputShowInput, setCustomInputShowInput] = useState<{
    [key: string]: boolean;
  }>({});

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

        // For custom input questions, check if they have made a choice (YES/NO)
        // and if YES, check if they have entered a value
        let allAnswered = true;
        for (let i = 0; i < totalQuestions; i++) {
          const questionKey = `q${i}`;
          const question = categoryData.questions[i];

          if (question.custom_input) {
            // For custom input questions
            const choice = customInputChoice[questionKey];
            if (choice === true) {
              // If YES, check if they have entered a value
              const inputValue = customInputValues[questionKey];
              if (!inputValue || inputValue.trim() === "") {
                allAnswered = false;
                break;
              }
            } else if (choice === false) {
              // If NO, check if they selected an option
              if (!(i in categorySelections)) {
                allAnswered = false;
                break;
              }
            } else {
              // No choice made yet
              allAnswered = false;
              break;
            }
          } else {
            // For regular questions, check if option is selected
            if (!(i in categorySelections)) {
              allAnswered = false;
              break;
            }
          }
        }

        if (allAnswered) {
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

  const handleCustomInputChange = (inputKey: string, value: string) => {
    // Only allow numbers (including empty string for clearing)
    if (value !== "" && (isNaN(Number(value)) || Number(value) < 0)) {
      return; // Don't update if it's not a valid positive number
    }

    setCustomInputValues((prev) => ({
      ...prev,
      [inputKey]: value,
    }));

    // Calculate the final value using custom_input_value as multiplier
    if (value && categoryData) {
      const questionIndex = parseInt(inputKey.replace("q", ""));
      const multiplier = parseFloat(
        categoryData.questions[questionIndex].custom_input_value || "0"
      );
      const calculatedValue = parseFloat(value) * multiplier;

      // Store calculated value in calculator context using a custom format
      // We'll store it as a negative value to distinguish from regular option indices
      setGlobalSelectedOption(
        category.id.toString(),
        questionIndex,
        -Math.abs(calculatedValue) // Store as negative to distinguish from option indices
      );
    }
  };

  // const getCustomInputValues = () => {
  //   return customInputValues;
  // };

  const handleCustomInputYesNo = (questionIndex: number, choice: boolean) => {
    const questionKey = `q${questionIndex}`;
    setCustomInputChoice((prev) => ({
      ...prev,
      [questionKey]: choice,
    }));
    setCustomInputShowInput((prev) => ({
      ...prev,
      [questionKey]: choice,
    }));

    if (choice === true) {
      // YES selected - use custom input value (will be calculated when input changes)
      // For now, set a special marker value to indicate custom input mode
      setGlobalSelectedOption(
        category.id.toString(),
        questionIndex,
        -1 // Special value to indicate custom input
      );
    } else if (choice === false) {
      // NO selected - clear any custom input selection and prepare for regular options
      removeSelectedOption(category.id.toString(), questionIndex);
      // Clear custom input value
      setCustomInputValues((prev) => ({
        ...prev,
        [questionKey]: "",
      }));
    }
  };

  const getQuestionKey = (questionIndex: number) => `q${questionIndex}`;

  const isCurrentQuestionAnswered = () => {
    if (!categoryData) return false;

    const question = categoryData.questions[currentQuestionIndex];
    const questionKey = getQuestionKey(currentQuestionIndex);

    if (question.custom_input) {
      const choice = customInputChoice[questionKey];
      if (choice === true) {
        // If YES, check if they have entered a value
        const inputValue = customInputValues[questionKey];
        return inputValue && inputValue.trim() !== "";
      } else if (choice === false) {
        // If NO, check if they selected an option
        return (
          getSelectedOption(category.id.toString(), currentQuestionIndex) !==
          undefined
        );
      } else {
        // No choice made yet
        return false;
      }
    } else {
      // For regular questions, check if option is selected
      return (
        getSelectedOption(category.id.toString(), currentQuestionIndex) !==
        undefined
      );
    }
  };

  // Old renderCustomInput function - commented out as we're using new logic
  // const renderCustomInput = (
  //   question: any,
  //   option: any,
  //   questionIndex: number,
  //   optionIndex: number
  // ) => {
  //   // ... (implementation commented out)
  // };
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
              {/* Check if current question has custom_input = true */}
              {categoryData.questions[currentQuestionIndex].custom_input ? (
                <>
                  {/* Show custom input fields only if NO is not selected */}
                  {customInputChoice[getQuestionKey(currentQuestionIndex)] !==
                    false && (
                    <>
                      {/* Custom Input Mode - Show only headline, description, and YES/NO buttons */}
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{ fontWeight: "semibold", mb: 3 }}
                      >
                        {
                          categoryData.questions[currentQuestionIndex]
                            .custom_input_headline
                        }
                      </Typography>

                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          mb: 4,
                          "& p": { margin: "0 0 1rem 0" },
                          "& div": { margin: "0 0 1rem 0" },
                          "& ul": {
                            margin: "0 0 1rem 0",
                            paddingLeft: "1.5rem",
                          },
                          "& ol": {
                            margin: "0 0 1rem 0",
                            paddingLeft: "1.5rem",
                          },
                          "& strong": { fontWeight: "bold" },
                          "& em": { fontStyle: "italic" },
                        }}
                        dangerouslySetInnerHTML={{
                          __html:
                            categoryData.questions[currentQuestionIndex]
                              .custom_input_description || "",
                        }}
                      />

                      {/* YES/NO Buttons */}
                      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
                        <Button
                          variant="contained"
                          onClick={() =>
                            handleCustomInputYesNo(currentQuestionIndex, true)
                          }
                          sx={{
                            bgcolor:
                              customInputChoice[
                                getQuestionKey(currentQuestionIndex)
                              ] === true
                                ? "#0F5FB4"
                                : "transparent",
                            border:
                              customInputChoice[
                                getQuestionKey(currentQuestionIndex)
                              ] === true
                                ? "none"
                                : "2px solid #0F5FB4",
                            color:
                              customInputChoice[
                                getQuestionKey(currentQuestionIndex)
                              ] === true
                                ? "white"
                                : "#0F5FB4",
                            "&:hover": {
                              bgcolor: "#0F5FB4",
                              color: "white",
                            },
                          }}
                        >
                          YES
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() =>
                            handleCustomInputYesNo(currentQuestionIndex, false)
                          }
                          sx={{
                            bgcolor:
                              customInputChoice[
                                getQuestionKey(currentQuestionIndex)
                              ] === false
                                ? "#C12530"
                                : "transparent",
                            border:
                              customInputChoice[
                                getQuestionKey(currentQuestionIndex)
                              ] === false
                                ? "none"
                                : "2px solid #C12530",
                            color:
                              customInputChoice[
                                getQuestionKey(currentQuestionIndex)
                              ] === false
                                ? "white"
                                : "#C12530",
                            "&:hover": {
                              bgcolor: "#C12530",
                              color: "white",
                            },
                          }}
                        >
                          NO
                        </Button>
                      </Box>

                      {/* Show input field if YES was selected */}
                      {customInputShowInput[
                        getQuestionKey(currentQuestionIndex)
                      ] && (
                        <Box sx={{ mb: 4 }}>
                          <Typography
                            variant="h6"
                            sx={{ mb: 2, fontWeight: "semibold" }}
                          >
                            Number of{" "}
                            {
                              categoryData.questions[currentQuestionIndex]
                                .custom_input_type
                            }
                          </Typography>
                          <TextField
                            fullWidth
                            type="number"
                            inputProps={{
                              min: 0,
                              step: 1,
                              pattern: "[0-9]*",
                            }}
                            value={
                              customInputValues[
                                getQuestionKey(currentQuestionIndex)
                              ] || ""
                            }
                            onChange={(e) =>
                              handleCustomInputChange(
                                getQuestionKey(currentQuestionIndex),
                                e.target.value
                              )
                            }
                            onKeyPress={(e) => {
                              // Prevent non-numeric characters from being entered
                              if (
                                !/[0-9]/.test(e.key) &&
                                e.key !== "Backspace" &&
                                e.key !== "Delete" &&
                                e.key !== "ArrowLeft" &&
                                e.key !== "ArrowRight" &&
                                e.key !== "Tab"
                              ) {
                                e.preventDefault();
                              }
                            }}
                            placeholder="0"
                            variant="outlined"
                            sx={{ maxWidth: 300 }}
                          />
                        </Box>
                      )}
                    </>
                  )}

                  {/* Show question options if NO was selected */}
                  {customInputChoice[getQuestionKey(currentQuestionIndex)] ===
                    false && (
                    <>
                      <Typography
                        variant="h4"
                        gutterBottom
                        sx={{ fontWeight: "semibold" }}
                      >
                        {
                          categoryData.questions[currentQuestionIndex]
                            .question_text
                        }{" "}
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
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Regular Mode - Show question text and help text */}
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
                </>
              )}

              {/* Show Question Pagination and Options Grid only when appropriate */}
              {(!categoryData.questions[currentQuestionIndex].custom_input ||
                customInputChoice[getQuestionKey(currentQuestionIndex)] ===
                  false) && (
                <>
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
                </>
              )}
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
              disabled={!isCurrentQuestionAnswered()}
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
