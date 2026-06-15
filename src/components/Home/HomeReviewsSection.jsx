import React, { useEffect, useState } from "react";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import { Box, CircularProgress, Stack, Typography, Rating, Avatar, Chip } from "@mui/material";
import { fetchApprovedPortalReviews, schoolPortalMediaUrl } from "../../api";
import ArrowCarousel from "./ArrowCarousel";
import { HOME, homeBodyFontSize } from "./homeShared";
import { HomeSectionHeader, HomeSectionShell } from "./homeUi";

function roleLabel(role) {
  if (role === "student") return "Student";
  if (role === "parent") return "Parent";
  return null;
}

function ReviewCard({ review }) {
  const avatarSrc = review.profile_picture ? schoolPortalMediaUrl(review.profile_picture) : null;
  const label = roleLabel(review.reviewer_role);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: { xs: 260, md: 280 },
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${HOME.border}`,
        boxShadow: HOME.shadowSm,
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.28s ease",
        "&:hover": {
          borderColor: HOME.borderGold,
          boxShadow: HOME.shadowMd,
          transform: "translateY(-4px)",
        },
      }}
    >
      <Box sx={{ height: 4, background: HOME.navyGradient, flexShrink: 0 }} />

      <Box
        sx={{
          flex: 1,
          p: { xs: 2, sm: 2.5, md: 3 },
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <FormatQuoteRoundedIcon
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            fontSize: 36,
            color: `${HOME.gold}33`,
            pointerEvents: "none",
          }}
        />

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2, pr: 4 }}>
          <Avatar
            src={avatarSrc || undefined}
            alt={review.name || ""}
            imgProps={{ referrerPolicy: "no-referrer" }}
            sx={{
              width: { xs: 52, md: 60 },
              height: { xs: 52, md: 60 },
              border: `2px solid ${HOME.gold}`,
              bgcolor: HOME.navy,
              color: HOME.goldMuted,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {(review.name || "?").charAt(0)}
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontFamily: HOME.fontBody,
                fontWeight: 800,
                color: HOME.navyDeep,
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                lineHeight: 1.25,
                mb: 0.5,
              }}
            >
              {review.name || "Community member"}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
              {label ? (
                <Chip
                  label={label}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    bgcolor: "rgba(201, 162, 39, 0.12)",
                    color: HOME.navyDeep,
                    border: `1px solid ${HOME.borderGold}`,
                  }}
                />
              ) : null}
              <Rating
                value={Number(review.rating) || 0}
                readOnly
                size="small"
                sx={{ color: HOME.gold }}
              />
            </Stack>
          </Box>
        </Stack>

        <Typography
          sx={{
            color: HOME.inkMuted,
            lineHeight: 1.75,
            flex: 1,
            fontSize: homeBodyFontSize,
            fontStyle: "italic",
            display: "-webkit-box",
            WebkitLineClamp: 5,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          &ldquo;{review.comment || ""}&rdquo;
        </Typography>
      </Box>
    </Box>
  );
}

function ReviewsRow({ reviews }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "stretch",
        gap: { xs: 1.5, md: 2 },
        width: "100%",
      }}
    >
      {reviews.map((review) => (
        <Box
          key={review.id}
          sx={{
            flex: { xs: "1 1 auto", md: "1 1 0" },
            width: "100%",
            minWidth: 0,
            display: "flex",
          }}
        >
          <ReviewCard review={review} />
        </Box>
      ))}
    </Box>
  );
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

  const showStaticRow = reviews.length > 0 && reviews.length <= 3;

  return (
    <HomeSectionShell
      id="reviews-section"
      bg={{
        background: `linear-gradient(180deg, #fff 0%, ${HOME.warmWhite} 100%)`,
        py: { xs: 5, md: 7 },
        borderTop: `1px solid ${HOME.border}`,
      }}
    >
      <Box
        sx={{
          width: "100%",
          px: { xs: 1.25, sm: 1.5, md: 2 },
        }}
      >
        <HomeSectionHeader
          eyebrow="Community voices"
          title="What parents &"
          titleAccent="students say"
          subtitle="Feedback from families in our school community."
        />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: HOME.gold }} />
          </Box>
        ) : reviews.length === 0 ? (
          <Typography sx={{ textAlign: "center", color: HOME.inkSoft, py: 2 }}>
            No published reviews yet. Sign in to the portal to share your experience.
          </Typography>
        ) : showStaticRow ? (
          <ReviewsRow reviews={reviews} />
        ) : (
          <ArrowCarousel
            ariaLabel="Parent and student reviews"
            items={reviews}
            visibleMd={3}
            visibleSm={1}
            visibleXs={1}
            renderCard={(review) => <ReviewCard review={review} />}
          />
        )}
      </Box>
    </HomeSectionShell>
  );
}
