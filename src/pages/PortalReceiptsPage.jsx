import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { fetchMyParentFeeReceipts, fetchMyParentFeeReceiptPdf } from "../api";
import {
  PortalPageShell,
  PortalPageHero,
  PortalPageContent,
  PortalLoading,
  PortalEmptyState,
  PortalPrimaryButton,
} from "../components/Portal/portalUi";
import { PORTAL, portalChipSx, portalPrimaryButtonSx } from "../components/Portal/portalShared";

function paymentMethodLabel(method) {
  const m = String(method || "").toLowerCase();
  if (m === "mpesa") return "M-Pesa";
  if (m === "portal") return "Parent portal";
  if (m === "manual") return "Cash / bank";
  return method || "—";
}

function methodChipStyle(method) {
  const m = String(method || "").toLowerCase();
  if (m === "mpesa") return { bgcolor: "#ECFDF5", color: "#047857", border: "1px solid rgba(5,150,105,0.25)" };
  if (m === "portal") return { bgcolor: PORTAL.sky, color: PORTAL.navyDeep, border: `1px solid ${PORTAL.border}` };
  return { bgcolor: "#F8FAFC", color: PORTAL.inkMuted, border: `1px solid ${PORTAL.border}` };
}

function formatPaymentDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatMonthLabel(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Earlier";
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function ReceiptStatsBar({ stats }) {
  const items = [
    {
      icon: <ReceiptLongIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />,
      label: "Total receipts",
      value: String(stats.count),
    },
    {
      icon: <AccountBalanceWalletOutlinedIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />,
      label: "Total paid",
      value: `KES ${stats.total.toLocaleString()}`,
    },
    {
      icon: <CalendarMonthOutlinedIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />,
      label: "Latest payment",
      value: stats.latestLabel,
      valueSx: { fontSize: { xs: "0.82rem", sm: "0.95rem", md: "1.05rem" }, lineHeight: 1.35 },
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "#fff",
        border: `1px solid ${PORTAL.border}`,
        boxShadow: "0 12px 40px -24px rgba(12, 35, 64, 0.28)",
      }}
    >
      {items.map((item, index) => (
        <Box
          key={item.label}
          sx={{
            minWidth: 0,
            px: { xs: 1.25, sm: 2, md: 2.5 },
            py: { xs: 1.75, sm: 2.25, md: 2.5 },
            textAlign: "center",
            bgcolor: index === 1 ? PORTAL.sky : "#fff",
            borderRight: index < 2 ? `1px solid ${PORTAL.border}` : "none",
          }}
        >
          <Box
            sx={{
              width: { xs: 36, sm: 44 },
              height: { xs: 36, sm: 44 },
              mx: "auto",
              mb: { xs: 0.75, sm: 1 },
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(12, 35, 64, 0.06)",
              color: PORTAL.gold,
            }}
          >
            {item.icon}
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: PORTAL.inkSoft,
              display: "block",
              fontSize: { xs: "0.58rem", sm: "0.68rem" },
              lineHeight: 1.3,
            }}
          >
            {item.label}
          </Typography>
          <Typography
            sx={{
              fontFamily: PORTAL.fontDisplay,
              fontWeight: 800,
              fontSize: { xs: "1.05rem", sm: "1.35rem", md: "1.5rem" },
              color: PORTAL.navyDeep,
              mt: 0.5,
              lineHeight: 1.2,
              wordBreak: "break-word",
              ...(item.valueSx || {}),
            }}
          >
            {item.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function ReceiptTicketCard({ receipt, onDownload, downloading }) {
  const methodStyle = methodChipStyle(receipt.payment_method);

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "#fff",
        border: `1px solid ${PORTAL.border}`,
        boxShadow: "0 16px 48px -28px rgba(12, 35, 64, 0.45)",
        transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: PORTAL.borderGold,
          boxShadow: "0 22px 56px -26px rgba(201, 162, 39, 0.35)",
        },
      }}
    >
      <Box sx={{ height: 5, background: `linear-gradient(90deg, ${PORTAL.navyDeep}, ${PORTAL.gold})` }} />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          minHeight: { md: 168 },
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 2.5 },
            background: `linear-gradient(135deg, ${PORTAL.sky} 0%, #fff 55%)`,
            borderRight: { md: `1px dashed ${PORTAL.border}` },
            position: "relative",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box>
              <Chip
                size="small"
                icon={<VerifiedOutlinedIcon sx={{ fontSize: "16px !important" }} />}
                label="Official receipt"
                sx={{ ...portalChipSx(), mb: 1.25, fontWeight: 800 }}
              />
              <Typography
                sx={{
                  fontFamily: PORTAL.fontDisplay,
                  fontWeight: 800,
                  fontSize: { xs: "1.45rem", sm: "1.65rem" },
                  color: PORTAL.navyDeep,
                  letterSpacing: "0.02em",
                }}
              >
                {receipt.receipt_number || "Receipt"}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={paymentMethodLabel(receipt.payment_method)}
              sx={{ fontWeight: 800, ...methodStyle }}
            />
          </Stack>

          <Stack spacing={0.75} sx={{ mt: 2 }}>
            <Typography sx={{ fontWeight: 700, color: PORTAL.inkMuted }}>
              {receipt.student?.name || "Student"}
            </Typography>
            <Typography variant="body2" sx={{ color: PORTAL.inkSoft, fontWeight: 600 }}>
              Invoice {receipt.invoice?.invoice_number || "—"}
              {receipt.level_name ? ` · ${receipt.level_name}` : ""}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: PORTAL.inkSoft }}>
              <CalendarMonthOutlinedIcon sx={{ fontSize: 17 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatPaymentDate(receipt.paid_at)}
              </Typography>
            </Stack>
            {receipt.reference ? (
              <Typography variant="caption" sx={{ color: PORTAL.inkSoft, fontWeight: 700 }}>
                Reference: {receipt.reference}
              </Typography>
            ) : null}
          </Stack>
        </Box>

        <Box
          sx={{
            width: { xs: "100%", md: 220 },
            p: { xs: 2, sm: 2.5 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: { xs: "stretch", md: "center" },
            textAlign: { md: "center" },
            bgcolor: "#fff",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: PORTAL.inkSoft,
            }}
          >
            Amount paid
          </Typography>
          <Typography
            sx={{
              fontFamily: PORTAL.fontDisplay,
              fontWeight: 800,
              fontSize: { xs: "1.75rem", sm: "2rem" },
              color: PORTAL.navyDeep,
              my: 1,
              lineHeight: 1.1,
            }}
          >
            KES {Number(receipt.amount || 0).toLocaleString()}
          </Typography>
          <PortalPrimaryButton
            fullWidth
            disabled={downloading}
            onClick={() => onDownload(receipt)}
            startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : <DownloadOutlinedIcon />}
            sx={{
              ...portalPrimaryButtonSx(),
              mt: 0.5,
              py: 1.1,
              fontWeight: 800,
              whiteSpace: "nowrap",
              flexWrap: "nowrap",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              fontSize: { xs: "0.8rem", sm: "0.95rem" },
              px: { xs: 1.75, sm: 3 },
              "& .MuiButton-startIcon": {
                marginRight: 0.75,
                marginLeft: 0,
                flexShrink: 0,
              },
            }}
          >
            {downloading ? "Preparing PDF…" : "Download PDF"}
          </PortalPrimaryButton>
        </Box>
      </Box>

      <Box
        sx={{
          height: 10,
          background: `repeating-linear-gradient(90deg, ${PORTAL.border} 0 6px, transparent 6px 12px)`,
          opacity: 0.65,
        }}
      />
    </Box>
  );
}

export default function PortalReceiptsPage() {
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState([]);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await fetchMyParentFeeReceipts();
      setReceipts(rows);
    } catch (e) {
      setError(e.message || "Could not load receipts.");
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    let total = 0;
    let latest = null;
    for (const r of receipts) {
      total += Number(r.amount || 0);
      const t = r.paid_at ? new Date(r.paid_at).getTime() : 0;
      if (!latest || t > latest.t) latest = { t, label: formatPaymentDate(r.paid_at) };
    }
    return {
      count: receipts.length,
      total,
      latestLabel: latest?.label || "—",
    };
  }, [receipts]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const r of receipts) {
      const key = formatMonthLabel(r.paid_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }
    return Array.from(map.entries());
  }, [receipts]);

  const downloadReceipt = async (receipt) => {
    if (!receipt?.id) return;
    setDownloadingId(receipt.id);
    setError("");
    try {
      const blob = await fetchMyParentFeeReceiptPdf(receipt.id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      setError(e.message || "Could not download receipt PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <PortalPageShell>
      <PortalPageHero
        fullWidth
        icon={<ReceiptLongIcon />}
        title="Payment receipts"
        subtitle="Every fee payment generates an official school receipt. Download your records anytime."
        chip={
          !loading && stats.count > 0 ? (
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
              <Chip
                size="small"
                label={`${stats.count} receipt${stats.count === 1 ? "" : "s"}`}
                sx={{ ...portalChipSx(), bgcolor: "rgba(255,255,255,0.12)", color: "#fff", borderColor: PORTAL.borderGold }}
              />
              <Chip
                size="small"
                icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: "16px !important", color: `${PORTAL.goldMuted} !important` }} />}
                label={`KES ${stats.total.toLocaleString()} paid`}
                sx={{ ...portalChipSx(), bgcolor: "rgba(255,255,255,0.12)", color: "#fff", borderColor: PORTAL.borderGold }}
              />
            </Stack>
          ) : null
        }
      />

      <PortalPageContent fullWidth>
        {error ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        ) : null}

        {loading ? (
          <PortalLoading label="Loading your receipts…" />
        ) : receipts.length === 0 ? (
          <PortalEmptyState
            icon={<ReceiptLongIcon />}
            title="No receipts yet"
            description="When you pay school fees, a receipt is created automatically. Your PDF receipts will appear here."
          />
        ) : (
          <Stack spacing={3} sx={{ width: "100%" }}>
            <ReceiptStatsBar stats={stats} />

            {grouped.map(([month, items]) => (
                <Box key={month}>
                  <Typography
                    sx={{
                      fontFamily: PORTAL.fontDisplay,
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: PORTAL.navyDeep,
                      mb: 1.5,
                      pl: 0.5,
                    }}
                  >
                    {month}
                  </Typography>
                  <Stack spacing={2}>
                    {items.map((receipt) => (
                      <ReceiptTicketCard
                        key={receipt.id}
                        receipt={receipt}
                        onDownload={downloadReceipt}
                        downloading={downloadingId === receipt.id}
                      />
                    ))}
                  </Stack>
            </Box>
            ))}
          </Stack>
        )}
      </PortalPageContent>
    </PortalPageShell>
  );
}
