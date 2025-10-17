import React, { useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Category, CalculatorData } from "../types";
import "./EstimateFormScreen.scss";

interface EstimateFormScreenProps {
  category: Category;
  categoryData: CalculatorData;
  onBack: () => void;
  onSubmit: (formData: FormData) => void;
}

interface FormData {
  name: string;
  email: string;
  zip: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  zip?: string;
  phone?: string;
}

const EstimateFormScreen: React.FC<EstimateFormScreenProps> = ({
  category,
  categoryData,
  onBack,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    zip: "",
    phone: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateZip = (zip: string): boolean => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10,}$/;
    return phoneRegex.test(phone.replace(/\D/g, ""));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.zip.trim()) {
      newErrors.zip = "Zip code is required";
    } else if (!validateZip(formData.zip)) {
      newErrors.zip =
        "Please enter a valid zip code (e.g., 12345 or 12345-6789)";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone =
        "Please enter a valid phone number (at least 10 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Allow only numbers, spaces, dashes, and parentheses
    const formatted = value.replace(/[^\d\s-()]/g, "");
    handleInputChange("phone", formatted);
  };

  const handleZipChange = (value: string) => {
    // Allow only numbers and dashes
    const formatted = value.replace(/[^\d-]/g, "");
    handleInputChange("zip", formatted);
  };

  return (
    <Container maxWidth="lg" className="estimate-form-container">
      {/* Category Header */}
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        className="category-header"
        sx={{ fontWeight: "bold", color: "primary.main", mb: 4 }}
      >
        {category.title}
      </Typography>

      <Card className="form-card" sx={{ mb: 4 }}>
        <CardContent className="form-card-content" sx={{ p: 4 }}>
          {/* Form Headline */}
          <Typography
            variant="h4"
            gutterBottom
            className="form-headline"
            sx={{ fontWeight: "semibold", mb: 3 }}
          >
            {categoryData.form_fields.form_headline}
          </Typography>

          {/* Form Description */}
          <Typography
            variant="body1"
            className="form-description"
            sx={{ mb: 4, lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{
              __html: categoryData.form_fields.form_description,
            }}
          />

          {/* Form Fields */}
          <Box
            className="form-grid"
            display="grid"
            gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
            gap={3}
            sx={{ mb: 4 }}
          >
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
              variant="outlined"
              className="estimate-form-input"
            />

            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              required
              variant="outlined"
              className="estimate-form-input"
            />

            <TextField
              label="Zip Code"
              value={formData.zip}
              onChange={(e) => handleZipChange(e.target.value)}
              error={!!errors.zip}
              helperText={errors.zip}
              fullWidth
              required
              variant="outlined"
              placeholder="12345 or 12345-6789"
              className="estimate-form-input"
            />

            <TextField
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              error={!!errors.phone}
              helperText={errors.phone}
              fullWidth
              required
              variant="outlined"
              placeholder="(555) 123-4567"
              className="estimate-form-input"
            />
          </Box>

          {/* Form Footer Text */}
          <Typography
            variant="body2"
            className="form-footer"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            {categoryData.form_fields.form_footer_text}
          </Typography>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <Box
        className="navigation-controls"
        display="flex"
        justifyContent="flex-start"
        alignItems="center"
        gap={2}
        sx={{ mb: 4 }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          className="back-button"
          sx={{ minWidth: 120 }}
        >
          Back
        </Button>

        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={handleSubmit}
          className="submit-button"
          sx={{
            minWidth: 180,
            bgcolor: "#C12530",
            "&:hover": {
              bgcolor: "#A01E28",
            },
          }}
        >
          SEE YOUR ESTIMATE
        </Button>
      </Box>
    </Container>
  );
};

export default EstimateFormScreen;
