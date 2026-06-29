import React from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  fileUploadConfig,
  htmlAcceptFromMimeList,
  parseAssignmentChoices,
} from "../../utils/assignmentQuestionUtils";
import { schoolPortalMediaUrl } from "../../api";
import { PORTAL } from "./portalShared";

export default function AssignmentQuestionInput({
  question,
  value,
  onChange,
  disabled = false,
  uploading = false,
  onUploadFile,
}) {
  const qType = String(question?.question_type || "short_text");
  const choices = parseAssignmentChoices(question);
  const uploadCfg = qType === "file_upload" ? fileUploadConfig(question) : null;
  const uploadedFiles =
    qType === "file_upload" && value && typeof value === "object" && Array.isArray(value.files) ? value.files : [];

  if (qType === "multiple_choice") {
    if (!choices.length) {
      return (
        <Typography variant="body2" color="error">
          No options configured. Edit the assignment and add at least two choices (one per line or comma-separated).
        </Typography>
      );
    }
    return (
      <RadioGroup
        value={String(value || "")}
        onChange={(e) => onChange?.(e.target.value)}
        sx={{ flexDirection: { xs: "column", sm: "row" }, flexWrap: "wrap", gap: { xs: 0, sm: 1 } }}
      >
        {choices.map((opt) => (
          <FormControlLabel
            key={`mc-${opt}`}
            value={opt}
            disabled={disabled}
            control={<Radio size="small" />}
            label={opt}
          />
        ))}
      </RadioGroup>
    );
  }

  if (qType === "multi_select") {
    if (!choices.length) {
      return (
        <Typography variant="body2" color="error">
          No options configured. Ask your teacher to add choices for this question.
        </Typography>
      );
    }
    const selected = Array.isArray(value) ? value : [];
    return (
      <Stack direction={{ xs: "column", sm: "row" }} flexWrap="wrap" useFlexGap spacing={{ xs: 0.25, sm: 1 }}>
        {choices.map((opt) => (
          <FormControlLabel
            key={`ms-${opt}`}
            control={
              <Checkbox
                size="small"
                disabled={disabled}
                checked={selected.includes(opt)}
                onChange={(e) => {
                  const next = e.target.checked ? [...selected, opt] : selected.filter((x) => x !== opt);
                  onChange?.(next);
                }}
              />
            }
            label={opt}
          />
        ))}
      </Stack>
    );
  }

  if (qType === "file_upload") {
    return (
      <Stack spacing={1}>
        {!disabled && uploadCfg?.hint ? (
          <Typography variant="body2" color="text.secondary">
            {uploadCfg.hint}
          </Typography>
        ) : null}
        {!disabled ? (
          <Typography variant="caption" color="text.secondary">
            Upload up to {uploadCfg?.maxFiles || 1} file(s), max {uploadCfg?.maxSizeMb || 10} MB each.
          </Typography>
        ) : null}
        {!disabled ? (
          <Button
            variant="outlined"
            component="label"
            size="small"
            disabled={disabled || uploading || uploadedFiles.length >= (uploadCfg?.maxFiles || 1)}
            sx={{ alignSelf: "flex-start" }}
          >
            {uploading ? "Uploading…" : "Choose file"}
            <input
              type="file"
              hidden
              accept={htmlAcceptFromMimeList(uploadCfg?.accept)}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file && onUploadFile) void onUploadFile(file);
              }}
            />
          </Button>
        ) : null}
        {uploadedFiles.length ? (
          <Stack spacing={1}>
            {uploadedFiles.map((f, fi) => {
              const href = schoolPortalMediaUrl(f.url);
              const isImage =
                String(f.mime || "").startsWith("image/") ||
                /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(String(f.name || f.url || ""));
              return (
                <Box key={`${question?.id || "q"}-file-${fi}`}>
                  {disabled && isImage ? (
                    <Box
                      component="a"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: "block",
                        borderRadius: 1.5,
                        overflow: "hidden",
                        border: "1px solid #e5e7eb",
                        maxWidth: 360,
                      }}
                    >
                      <Box
                        component="img"
                        src={href}
                        alt={f.name || `File ${fi + 1}`}
                        sx={{ width: "100%", maxHeight: 240, objectFit: "contain", display: "block", bgcolor: "#f8fafc" }}
                      />
                    </Box>
                  ) : null}
                  <Typography variant="body2" sx={{ mt: disabled && isImage ? 0.75 : 0 }}>
                    <Box
                      component="a"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ fontWeight: 600, color: disabled ? PORTAL?.navyDeep || "inherit" : undefined }}
                    >
                      {f.name || `File ${fi + 1}`}
                    </Box>
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No file uploaded yet.
          </Typography>
        )}
      </Stack>
    );
  }

  return (
    <TextField
      fullWidth
      multiline
      minRows={qType === "long_text" || qType === "essay" ? 4 : 2}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
    />
  );
}
