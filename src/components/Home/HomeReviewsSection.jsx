import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Rating,
  Avatar,
  CircularProgress,
  Chip,
  Divider,
} from "@mui/material";

const BRAND = {
  navy: "#0c2340",
  navyDeep: "#08162b",
  gold: "#c9a227",
  goldMuted: "#e6cf6a",
};

const REVIEWS_API = "/api/reviews/approved";

async function fetchApprovedReviews() {
  try {
    const res = await fetch(`${REVIEWS_API}?limit=100`);
    if (!res.ok) throw new Error(String(res.status));
    const ct = res.headers.get("content-type");
    if (!ct || !ct.includes("application/json")) throw new Error("Not JSON");
    const text = await res.text();
    if (!text?.trim()) throw new Error("Empty");
    const data = JSON.parse(text);
    if (data.success && Array.isArray(data.data)) return data.data;
    return [];
  } catch {
    return [];
  }
}

export default function HomeReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchApprovedReviews().then((list) => {
      if (!cancelled) setReviews(list);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
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
          Parents & Teachers Reviews
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
            No reviews yet. Be the first to share feedback on our Reviews page.
          </Typography>
        ) : (
          <Paper
            elevation={0}
            sx={{
              border: `1px solid rgba(12, 35, 64, 0.12)`,
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "#fafcfe",
            }}
          >
            <Box
              sx={{
                maxHeight: { xs: 380, sm: 440, md: 520 },
                overflowY: "auto",
                px: { xs: 1.5, sm: 2 },
                py: 2,
                "&::-webkit-scrollbar": { width: 8 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "rgba(12, 35, 64, 0.25)",
                  borderRadius: 4,
                },
              }}
            >
              {reviews.map((review, idx) => (
                <Box key={review.id || idx}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      py: 1.75,
                      alignItems: "flex-start",
                    }}
                  >
                    <Avatar
                      alt={review.name || ""}
                      sx={{
                        bgcolor: BRAND.navy,
                        color: BRAND.goldMuted,
                        width: 48,
                        height: 48,
                        fontWeight: 700,
                      }}
                    >
                      {(review.name || "?").charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Typography sx={{ fontWeight: 700, color: BRAND.navyDeep }}>
                          {review.name || "Anonymous"}
                        </Typography>
                        {review.location ? (
                          <Chip
                            label={review.location}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              bgcolor: "rgba(201, 162, 39, 0.12)",
                              color: BRAND.navy,
                            }}
                          />
                        ) : null}
                      </Box>
                      <Rating
                        value={Number(review.rating) || 0}
                        readOnly
                        size="small"
                        sx={{ color: BRAND.gold, mb: 1 }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.primary",
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {review.comment || ""}
                      </Typography>
                    </Box>
                  </Box>
                  {idx < reviews.length - 1 && <Divider />}
                </Box>
              ))}
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
