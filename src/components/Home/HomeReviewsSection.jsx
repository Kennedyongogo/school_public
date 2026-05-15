import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Rating,
  Avatar,
  CircularProgress,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import { fetchApprovedPortalReviews, schoolPortalMediaUrl } from "../../api";

const BRAND = {
  navy: "#0c2340",
  navyDeep: "#08162b",
  gold: "#c9a227",
  goldMuted: "#e6cf6a",
};

const CARD_WIDTH = { xs: 260, sm: 280, md: 300 };

function roleLabel(role) {
  if (role === "student") return "Student";
  if (role === "parent") return "Parent";
  return null;
}

export default function HomeReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await fetchApprovedPortalReviews(1, 100);
        if (!cancelled) setReviews(data);
      } catch {
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box
      id="reviews-section"
      sx={{
        bgcolor: "#ffffff",
        py: { xs: 4, md: 6 },
        borderTop: `1px solid rgba(12, 35, 64, 0.08)`,
      }}
    >
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          px: { xs: 1.75, sm: 2.5, md: 4 },
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 700,
            fontSize: { xs: "1.75rem", md: "2.25rem" },
            color: BRAND.navyDeep,
            textAlign: "center",
            mb: 1,
          }}
        >
          Parents & Students Reviews
        </Typography>
        <Typography
          sx={{
            textAlign: "center",
            color: "text.secondary",
            maxWidth: "min(720px, 100%)",
            mx: "auto",
            mb: 3,
            fontSize: "0.95rem",
          }}
        >
          Voices from our community — thank you for sharing your experience with Elimu Plus.
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: BRAND.gold }} />
          </Box>
        ) : reviews.length === 0 ? (
          <Typography sx={{ textAlign: "center", color: "text.secondary", py: 4 }}>
            No published reviews yet. Sign in to the portal to be the first to share feedback.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              gap: { xs: 2, md: 2.5 },
              overflowX: "auto",
              overflowY: "hidden",
              pb: 2,
              mx: { xs: -0.5, sm: 0 },
              px: { xs: 0.5, sm: 0 },
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              "&::-webkit-scrollbar": { height: 8 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "rgba(12, 35, 64, 0.25)",
                borderRadius: 4,
              },
            }}
          >
            {reviews.map((review) => {
              const avatarSrc = review.profile_picture
                ? schoolPortalMediaUrl(review.profile_picture)
                : null;
              const label = roleLabel(review.reviewer_role);

              return (
                <Card
                  key={review.id}
                  elevation={0}
                  sx={{
                    flex: "0 0 auto",
                    width: CARD_WIDTH,
                    minHeight: 320,
                    scrollSnapAlign: "start",
                    borderRadius: 2.5,
                    border: `2px solid rgba(201, 162, 39, 0.35)`,
                    background: `linear-gradient(165deg, #ffffff 0%, #f8fafc 45%, rgba(230, 207, 106, 0.12) 100%)`,
                    boxShadow: "0 12px 28px rgba(8, 22, 43, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 18px 36px rgba(8, 22, 43, 0.16)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 6,
                      background: `linear-gradient(90deg, ${BRAND.navyDeep}, ${BRAND.gold})`,
                      borderRadius: "10px 10px 0 0",
                    }}
                  />
                  <CardContent
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      p: 2.5,
                      pt: 2,
                      "&:last-child": { pb: 2.5 },
                    }}
                  >
                    <Avatar
                      src={avatarSrc || undefined}
                      alt={review.name || ""}
                      imgProps={{ referrerPolicy: "no-referrer" }}
                      sx={{
                        width: 72,
                        height: 72,
                        mb: 1.5,
                        border: `3px solid ${BRAND.gold}`,
                        bgcolor: BRAND.navy,
                        color: BRAND.goldMuted,
                        fontWeight: 800,
                        fontSize: "1.5rem",
                        boxShadow: "0 4px 14px rgba(12, 35, 64, 0.2)",
                      }}
                    >
                      {(review.name || "?").charAt(0)}
                    </Avatar>

                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: BRAND.navyDeep,
                        fontSize: "1.05rem",
                        lineHeight: 1.25,
                        mb: 0.5,
                      }}
                    >
                      {review.name || "Community member"}
                    </Typography>

                    {label ? (
                      <Chip
                        label={label}
                        size="small"
                        sx={{
                          height: 22,
                          mb: 1,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          bgcolor: "rgba(201, 162, 39, 0.15)",
                          color: BRAND.navyDeep,
                          border: `1px solid rgba(201, 162, 39, 0.35)`,
                        }}
                      />
                    ) : null}

                    <Rating
                      value={Number(review.rating) || 0}
                      readOnly
                      size="small"
                      sx={{ color: BRAND.gold, mb: 1.5 }}
                    />

                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(8, 22, 43, 0.88)",
                        lineHeight: 1.55,
                        flex: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 6,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      {review.comment || ""}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
}
