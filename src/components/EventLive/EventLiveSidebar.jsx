import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import BackHandRoundedIcon from "@mui/icons-material/BackHandRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import { useEventInteraction } from "../../hooks/useEventInteraction";

const REACTIONS = [
  "👍",
  "👎",
  "👏",
  "🙌",
  "❤️",
  "😂",
  "😮",
  "😢",
  "😍",
  "🤔",
  "🎉",
  "🔥",
  "💯",
  "✅",
  "❌",
  "⭐",
  "💡",
  "🙋",
];

function authorLabel(author) {
  return author?.full_name || author?.username || "Guest";
}

const CHAT_ROW_ESTIMATE_PX = 72;

function chatListViewportPx(isStaff) {
  return (isStaff ? 10 : 5) * CHAT_ROW_ESTIMATE_PX;
}

const scrollBodySx = {
  flex: "0 0 auto",
  flexShrink: 0,
  overflowY: "auto",
  overflowX: "hidden",
  WebkitOverflowScrolling: "touch",
  overscrollBehavior: "contain",
};

const sidebarSurfaceSx = {
  bgcolor: "background.paper",
  color: "text.primary",
  "& .MuiTypography-root:not(.MuiTypography-colorTextSecondary)": { color: "text.primary" },
  "& .MuiInputBase-input": { color: "text.primary" },
  "& .MuiInputBase-input::placeholder": { color: "text.secondary", opacity: 1 },
};

export default function EventLiveSidebar({
  eventId,
  token,
  socket,
  isStaff,
  userId,
  embedded = false,
  variant = "sidebar",
}) {
  const isDock = variant === "dock";
  const chatListHeight = chatListViewportPx(isStaff);
  const [tab, setTab] = useState(0);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [busy, setBusy] = useState(false);

  const {
    chat,
    reactions,
    raisedHands,
    loading,
    error,
    myHandRaised,
    sendChat,
    markAnswered,
    toggleRaiseHand,
    dismissHand,
    sendReaction,
  } = useEventInteraction({
    eventId,
    token,
    socket,
    isStaff,
    userId,
  });

  const chatMessages = useMemo(() => chat.filter((m) => !m.is_question), [chat]);
  const questions = useMemo(() => chat.filter((m) => m.is_question), [chat]);
  const openQuestionCount = useMemo(() => questions.filter((m) => !m.is_answered).length, [questions]);
  const isQuestionsTab = tab === 1;
  const list = isQuestionsTab ? questions : chatMessages;

  const handleSend = async () => {
    const msg = text.trim();
    if (!msg || busy) return;
    setBusy(true);
    try {
      const postingQuestion = !isStaff && isQuestionsTab && !replyTo;
      await sendChat({
        message: msg,
        is_question: postingQuestion,
        parent_id: replyTo?.id || null,
      });
      setText("");
      setReplyTo(null);
      if (postingQuestion) setTab(1);
    } catch (e) {
      alert(e.message || "Send failed");
    } finally {
      setBusy(false);
    }
  };

  const handleTabChange = (_, next) => {
    setTab(next);
    setReplyTo(null);
    setText("");
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        flex: isDock ? "0 0 auto" : "1 1 auto",
        height: isDock ? "auto" : "100%",
        maxHeight: isDock ? "none" : "100%",
        borderLeft: isDock || embedded ? 0 : { md: 1 },
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        minHeight: isDock ? 0 : 0,
        overflow: "hidden",
        flexShrink: isDock ? 0 : undefined,
        ...sidebarSurfaceSx,
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: embedded ? 0.75 : 1,
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: embedded ? 0.25 : 0.5 }}>
          {isStaff ? "Event interactions" : "Class interactions"}
        </Typography>
        <Stack
          direction="row"
          spacing={0.5}
          flexWrap="nowrap"
          useFlexGap
          sx={{
            overflowX: "auto",
            overflowY: "hidden",
            pb: 0.25,
            WebkitOverflowScrolling: "touch",
            ...(embedded ? { maxHeight: 40 } : {}),
          }}
        >
          {REACTIONS.map((emoji) => (
            <IconButton
              key={emoji}
              size="small"
              aria-label={`React ${emoji}`}
              onClick={() => void sendReaction(emoji)}
              sx={{ fontSize: "1.1rem" }}
            >
              {emoji}
            </IconButton>
          ))}
        </Stack>
        <Stack
          spacing={0.25}
          sx={{
            mt: 0.75,
            minHeight: 100,
            maxHeight: 132,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            pr: 0.5,
          }}
        >
          {reactions.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              Reactions appear here for everyone in the event.
            </Typography>
          ) : (
            reactions.slice(-40).map((r, i) => (
              <Typography
                key={`${r.user_id}-${r.at}-${r.emoji}-${i}`}
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", lineHeight: 1.35, py: 0.15 }}
              >
                <strong>{r.user_name || "Someone"}</strong> {r.emoji}
              </Typography>
            ))
          )}
        </Stack>
      </Box>

      <Box sx={{ px: 1.5, py: embedded ? 0.75 : 1, borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
        {!isStaff ? (
          <Button
            fullWidth
            size="small"
            variant={myHandRaised ? "contained" : "outlined"}
            color={myHandRaised ? "warning" : "primary"}
            startIcon={<BackHandRoundedIcon />}
            onClick={() => void toggleRaiseHand().catch((e) => alert(e.message))}
          >
            {myHandRaised ? "Lower hand" : "Raise hand"}
          </Button>
        ) : null}
        {raisedHands.length > 0 ? (
          <Stack spacing={0.75} sx={{ mt: 1, maxHeight: 120, overflow: "auto" }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Raised hands ({raisedHands.length})
            </Typography>
            {raisedHands.map((h) => (
              <Stack key={h.id} direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Chip
                  size="small"
                  icon={<BackHandRoundedIcon sx={{ fontSize: 16 }} />}
                  label={authorLabel(h.user)}
                  color="warning"
                  variant="outlined"
                  sx={{ maxWidth: "100%", "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }}
                />
                {isStaff ? (
                  <Button size="small" onClick={() => void dismissHand(h.id).catch(() => {})}>
                    Dismiss
                  </Button>
                ) : null}
              </Stack>
            ))}
          </Stack>
        ) : null}
      </Box>

      <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{ minHeight: 40, flexShrink: 0 }}>
        <Tab label={chatMessages.length ? `Chat (${chatMessages.length})` : "Chat"} sx={{ minHeight: 40, py: 0.5 }} />
        <Tab
          label={
            openQuestionCount > 0
              ? `Questions (${openQuestionCount} open)`
              : questions.length
              ? `Questions (${questions.length})`
              : "Questions"
          }
          sx={{ minHeight: 40, py: 0.5 }}
        />
      </Tabs>

      <Box
        sx={{
          ...scrollBodySx,
          px: 1.5,
          py: 1,
          height: isDock ? chatListHeight : undefined,
          minHeight: isDock ? chatListHeight : 0,
          maxHeight: isDock ? chatListHeight : undefined,
          flex: isDock ? "0 0 auto" : 1,
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : error ? (
          <Alert severity="warning" sx={{ mb: 1 }}>
            {error}
          </Alert>
        ) : list.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {isQuestionsTab
              ? isStaff
                ? "No attendee questions yet."
                : "No questions yet. Use this tab to ask the host — it won't appear in general chat."
              : "No chat messages yet."}
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {list.map((m) => (
              <Box
                key={m.id}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: m.is_question ? "action.hover" : "transparent",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Typography variant="caption" color="text.primary" sx={{ fontWeight: 700 }}>
                    {authorLabel(m.author)}
                  </Typography>
                  {m.is_question ? (
                    <Chip
                      size="small"
                      label={m.is_answered ? "Answered" : "Open"}
                      color={m.is_answered ? "success" : "warning"}
                      sx={{ height: 20, fontSize: "0.65rem" }}
                    />
                  ) : null}
                </Stack>
                <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-wrap", mt: 0.25 }}>
                  {m.message}
                </Typography>
                {(m.replies || []).map((r) => (
                  <Box key={r.id} sx={{ mt: 1, pl: 1, borderLeft: 2, borderColor: "primary.main" }}>
                    <Typography variant="caption" color="text.primary" sx={{ fontWeight: 700 }}>
                      {authorLabel(r.author)} (reply)
                    </Typography>
                    <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-wrap" }}>
                      {r.message}
                    </Typography>
                  </Box>
                ))}
                {isStaff && m.is_question ? (
                  <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
                    <Button
                      size="small"
                      startIcon={<ReplyRoundedIcon />}
                      onClick={() => {
                        setReplyTo(m);
                        setTab(1);
                      }}
                    >
                      Reply
                    </Button>
                    {!m.is_answered ? (
                      <Button
                        size="small"
                        startIcon={<CheckCircleOutlineRoundedIcon />}
                        onClick={() => void markAnswered(m.id).catch((e) => alert(e.message))}
                      >
                        Mark answered
                      </Button>
                    ) : null}
                  </Stack>
                ) : null}
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      <Divider sx={{ flexShrink: 0 }} />
      <Box sx={{ p: 1.5, flexShrink: 0 }}>
        {replyTo ? (
          <Typography variant="caption" color="primary" sx={{ display: "block", mb: 0.5 }}>
            Replying to {authorLabel(replyTo.author)}
            <Button size="small" onClick={() => setReplyTo(null)} sx={{ ml: 1, minWidth: 0 }}>
              Cancel
            </Button>
          </Typography>
        ) : null}
        {!replyTo && !isStaff ? (
          <Typography
            variant="caption"
            color={isQuestionsTab ? "warning.main" : "text.secondary"}
            sx={{ display: "block", mb: 0.75, fontWeight: isQuestionsTab ? 600 : 400 }}
          >
            {isQuestionsTab
              ? "Posting to Questions only — the host sees this in Q&A, not in chat."
              : "Posting to Chat only — use Questions to ask the host."}
          </Typography>
        ) : null}
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            fullWidth
            size="small"
            multiline
            maxRows={3}
            placeholder={
              replyTo
                ? "Type your reply…"
                : isStaff
                ? isQuestionsTab
                  ? "Select a question above to reply…"
                  : "Message attendees…"
                : isQuestionsTab
                ? "Ask the host a question…"
                : "Message everyone in chat…"
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isStaff && isQuestionsTab && !replyTo}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
          />
          <IconButton
            color="primary"
            disabled={busy || !text.trim() || (isStaff && isQuestionsTab && !replyTo)}
            onClick={() => void handleSend()}
            aria-label="Send"
          >
            <SendRoundedIcon />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}
