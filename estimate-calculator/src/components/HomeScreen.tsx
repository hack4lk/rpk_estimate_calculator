import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Box,
  Alert,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { apiService } from "../services/api";
import { Category } from "../types";
import "./homescreen.scss";

interface HomeScreenProps {
  onCategoryClick: (category: Category) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onCategoryClick }) => {
  const {
    data: homePageData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["homePageData"],
    queryFn: apiService.getHomePageData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Debug logging
  React.useEffect(() => {
    console.log("🏠 HomeScreen - Query State:", {
      isLoading,
      error: error?.message,
      hasData: !!homePageData,
    });
    if (error) {
      console.error("🚨 HomeScreen - Error details:", error);
    }
    if (homePageData) {
      console.log("📊 HomeScreen - Data received:", homePageData);
    }
  }, [isLoading, error, homePageData]);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box textAlign="center" mb={4}>
          <Skeleton
            variant="text"
            width={400}
            height={60}
            sx={{ mx: "auto" }}
          />
        </Box>
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={3}
        >
          {Array.from({ length: 7 }).map((_, index) => (
            <Card key={index}>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" height={30} />
                <Skeleton variant="text" height={20} width="80%" />
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Unable to Load Content
          </Typography>
          <Typography>
            We're experiencing technical difficulties loading the estimate
            calculator. Please try refreshing the page or contact support if the
            problem persists.
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} className="home-screen">
      {/* Header Section */}
      <Box textAlign="center" mb={6}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "primary.main",
            mb: 2,
          }}
        >
          {homePageData?.headline || "Estimate Calculator"}
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: "auto" }}
        >
          {homePageData?.helpText ||
            "Select a category below to get started with your construction estimate"}
        </Typography>
      </Box>

      {/* Categories Grid */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: "center",
        }}
      >
        {homePageData?.categories.map((category) => (
          <Card
            key={category.id}
            sx={{
              height: "100%",
              maxWidth: 220,
              width: "100%",
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 4,
              },
              backgroundColor: "#C12530",
              color: "#fff",
            }}
          >
            <CardActionArea
              onClick={() => onCategoryClick(category)}
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardMedia
                component="img"
                height="200"
                image={category.image}
                alt={category.title}
                sx={{ objectFit: "cover", padding: "5px" }}
              />
              <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                <Typography
                  gutterBottom
                  variant="h6"
                  component="h2"
                  sx={{ fontWeight: "semibold", mb: 1, color: "#fff" }}
                >
                  {category.title}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      {/* Footer Info */}
      <Box textAlign="center" mt={6}>
        <Typography variant="body2" color="text.secondary">
          Need help? Contact our team for personalized assistance with your
          project estimates.
        </Typography>
      </Box>
    </Container>
  );
};

export default HomeScreen;
