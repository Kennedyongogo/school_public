import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Rating,
  Stack,
  Avatar,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import Swal from "sweetalert2";
import { submitPortalReview, schoolPortalMediaUrl } from "../../api";

const BRAND = {
  navy: "#0c2340",
  navyDeep: "#08162b",
  gold: "#c9a227",
  red: "#DC2626",
  redDark: "#B91C1C",
};

export default function PortalReviewPromptDialog({
  open,
  onClose,
  onSubmitted,
  user,
  student,
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const displayName = user?.full_name || user?.username || "Community member";
  const avatarSrc = student?.profile_picture
    ? schoolPortalMediaUrl(student.profile_picture)
    : user?.profile_image
      ? schoolPortalMediaUrl(user.profile_image)
      : null;

  const roleLabel = user?.role === "student" ? "Student" : "Parent";

  const handleSubmit = async () => {
    setError(null);
    if (!comment.trim() || comment.trim().length < 10) {
      setError("Please write at least 10 characters about your experience.");
      return;
    }
    setSaving(true);
    try {
      await submitPortalReview({ rating, comment: comment.trim() });
      // Close the MUI dialog before SweetAlert — Dialog z-index (~1300) sits above Swal (~1060).
      onSubmitted?.();
      onClose();
      setSaving(false);
      await Swal.fire({
        icon: "success",
        title: "Thank you!",
        text: "Your review was submitted and will appear on our website after the school approves it.",
        confirmButtonColor: BRAND.red,
        timer: 4000,
        timerProgressBar: true,
        didOpen: () => {
          const container = Swal.getContainer();
          if (container) container.style.zIndex = "2000";
        },
      });
    } catch (e) {
      setError(e.message || "Could not submit review.");
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: BRAND.navyDeep, pr: 2 }}>
        Share your experience
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You can submit one review for Elimu Plus. It will appear on our public website after the school
          approves it.
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Avatar
            src={avatarSrc || undefined}
            alt={displayName}
            sx={{ width: 56, height: 56, bgcolor: BRAND.navy, color: BRAND.gold, fontWeight: 700 }}
          >
            {displayName.charAt(0)}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, color: BRAND.navyDeep }}>{displayName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {roleLabel}
            </Typography>
          </Box>
        </Stack>

        <Typography component="legend" sx={{ fontWeight: 600, mb: 0.5, fontSize: "0.9rem" }}>
          Your rating
        </Typography>
        <Rating
          value={rating}
          onChange={(_, v) => setRating(v || 1)}
          size="large"
          sx={{ color: BRAND.gold, mb: 2 }}
        />

        <TextField
          label="Your review"
          multiline
          minRows={4}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us what you value about the school — academics, community, support…"
          helperText={`${comment.length}/2000 · minimum 10 characters`}
          inputProps={{ maxLength: 2000 }}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, flexWrap: "wrap", gap: 1 }}>
        <Button onClick={onClose} disabled={saving} sx={{ fontWeight: 600 }}>
          Maybe later
        </Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={handleSubmit}
          sx={{
            bgcolor: BRAND.red,
            fontWeight: 700,
            "&:hover": { bgcolor: BRAND.redDark },
          }}
        >
          {saving ? <CircularProgress size={22} color="inherit" /> : "Submit review"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
