import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentsIcon from "@mui/icons-material/Payments";
import LayersIcon from "@mui/icons-material/Layers";
import HistoryIcon from "@mui/icons-material/History";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import Swal from "sweetalert2";
import {
  fetchMyParentFeeInvoices,
  fetchMyParentFeeInvoicePdf,
  fetchMyParentFeeReceiptPdf,
  postMyParentMpesaStkPush,
  fetchMpesaStkPushStatus,
  getPortalAuthUser,
} from "../api";
import {
  PortalPageShell,
  PortalPageHero,
  PortalPageContent,
  PortalSurfaceCard,
  PortalLoading,
  PortalEmptyState,
  PortalPrimaryButton,
} from "../components/Portal/portalUi";
import { PORTAL, portalChipSx, portalPrimaryButtonSx } from "../components/Portal/portalShared";

function getStoredUserPhone() {
  const user = getPortalAuthUser();
  return user?.phone ? String(user.phone).trim() : "";
}

function statusChipProps(status) {
  const s = String(status || "").toLowerCase();
  if (s === "paid") return { label: "Paid", color: "success" };
  if (s === "partial") return { label: "Partially paid", color: "warning" };
  if (s === "sent") return { label: "Awaiting payment", color: "info" };
  return { label: status || "—", color: "default" };
}

function AmountCell({ label, value, highlight }) {
  return (
    <Box
      sx={{
        textAlign: { xs: "left", sm: "center" },
        py: { xs: 1, sm: 1.25 },
        px: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        bgcolor: highlight ? "rgba(201, 162, 39, 0.1)" : PORTAL.sky,
        border: `1px solid ${highlight ? PORTAL.borderGold : PORTAL.border}`,
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: 800, display: "block", letterSpacing: "0.05em", textTransform: "uppercase", color: PORTAL.inkSoft, fontSize: "0.68rem" }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: { xs: "1.15rem", md: "1.25rem" },
          color: highlight ? PORTAL.navyDeep : PORTAL.inkMuted,
          mt: 0.35,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function halfPhaseLabel(phase) {
  return phase === "first_half" ? "1st half" : phase === "second_half" ? "2nd half" : String(phase || "Half");
}

function HalfBreakdownPanel({ phase }) {
  const items = Array.isArray(phase?.items) ? phase.items.filter((it) => it?.name || it?.amount) : [];
  const phaseTotal = Number(phase?.amount || 0);
  const itemsSum = items.reduce((s, it) => s + Number(it?.amount || 0), 0);

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        width: "100%",
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        bgcolor: "#fff",
        border: `1px solid ${PORTAL.border}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
        <PaymentsIcon sx={{ fontSize: 18, color: PORTAL.gold }} />
        <Typography sx={{ fontWeight: 800, color: PORTAL.navyDeep }}>{halfPhaseLabel(phase?.phase)}</Typography>
        <Typography sx={{ fontWeight: 800, ml: "auto", color: PORTAL.navyDeep }}>
          KES {phaseTotal.toLocaleString()}
        </Typography>
      </Stack>

      {items.length > 0 ? (
        <Stack spacing={0.75} component="ul" sx={{ m: 0, pl: 2.25, listStyle: "disc" }}>
          {items.map((it, i) => (
            <Box component="li" key={`${phase?.phase}-${i}-${it.name}`} sx={{ display: "list-item" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1} sx={{ width: "100%", pr: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, minWidth: 0, color: PORTAL.inkMuted }}>
                  {it.name || "Fee item"}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: "nowrap", color: PORTAL.navyDeep }}>
                  KES {Number(it.amount || 0).toLocaleString()}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" sx={{ color: PORTAL.inkSoft }}>
          No line items listed for this half — total shown above.
        </Typography>
      )}

      {items.length > 0 && Math.abs(itemsSum - phaseTotal) > 0.02 ? (
        <Typography variant="caption" sx={{ display: "block", mt: 1, color: PORTAL.inkSoft }}>
          Items subtotal: KES {itemsSum.toLocaleString()}
        </Typography>
      ) : null}
    </Box>
  );
}

function paymentMethodLabel(method) {
  const m = String(method || "").toLowerCase();
  if (m === "mpesa") return "M-Pesa";
  if (m === "portal") return "Parent portal";
  if (m === "manual") return "Cash / bank";
  return method || "—";
}

function formatPaymentDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function PaymentHistoryPanel({ payments, onDownloadReceipt, downloadingReceiptId }) {
  const rows = Array.isArray(payments) ? payments : [];

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 800, display: "block", mb: 1.25, letterSpacing: "0.05em", textTransform: "uppercase", color: PORTAL.inkSoft }}
      >
        Payment history
      </Typography>
      <Box
        sx={{
          width: "100%",
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          bgcolor: PORTAL.sky,
          border: `1px solid ${PORTAL.border}`,
          boxSizing: "border-box",
        }}
      >
        {rows.length === 0 ? (
          <Typography variant="body2" sx={{ color: PORTAL.inkSoft }}>
            No payments recorded yet.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {rows.map((payment) => (
              <Box
                key={payment.id || `${payment.paid_at}-${payment.amount}`}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: "#fff",
                  border: `1px solid ${PORTAL.border}`,
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1}
                >
                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
                    <HistoryIcon sx={{ fontSize: 17, color: PORTAL.gold }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, color: PORTAL.navyDeep }}>
                        KES {Number(payment.amount || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: PORTAL.inkMuted, fontWeight: 600 }}>
                        {paymentMethodLabel(payment.payment_method)} · {formatPaymentDate(payment.paid_at)}
                      </Typography>
                      {payment.receipt_number ? (
                        <Typography variant="caption" sx={{ color: PORTAL.inkSoft, fontWeight: 600 }}>
                          Receipt {payment.receipt_number}
                        </Typography>
                      ) : null}
                    </Box>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                    {payment.reference ? (
                      <Typography variant="body2" sx={{ color: PORTAL.inkSoft, fontWeight: 600 }}>
                        Ref: {payment.reference}
                      </Typography>
                    ) : null}
                    {payment.id ? (
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={downloadingReceiptId === payment.id}
                        onClick={() => onDownloadReceipt(payment)}
                        startIcon={
                          downloadingReceiptId === payment.id ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <DownloadOutlinedIcon />
                          )
                        }
                        sx={{ fontWeight: 700, borderColor: PORTAL.border, color: PORTAL.navyDeep }}
                      >
                        Receipt PDF
                      </Button>
                    ) : null}
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

function FeeInvoiceCard({ inv, onPay, onDownload, downloading, onDownloadReceipt, downloadingReceiptId }) {
  const chip = statusChipProps(inv.status);
  const termTotal = Number(inv.term_fee_amount || inv.amount_due || 0);
  const paid = Number(inv.amount_paid || 0);
  const balance = Number(inv.balance || 0);
  const pct = termTotal > 0 ? Math.min(100, Math.round((paid / termTotal) * 100)) : 0;

  return (
    <PortalSurfaceCard sx={{ width: "100%" }}>
      <Stack spacing={2.25} sx={{ width: "100%" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontFamily: PORTAL.fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.35rem", sm: "1.5rem" },
                color: PORTAL.navyDeep,
                lineHeight: 1.2,
              }}
            >
              {inv.student?.name || "Student"}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.75, flexWrap: "wrap" }}>
              <ReceiptLongIcon sx={{ fontSize: 17, color: PORTAL.gold }} />
              <Typography variant="body2" sx={{ color: PORTAL.inkMuted, fontWeight: 600 }}>
                Invoice {inv.invoice_number}
                {inv.status ? ` · ${inv.status}` : ""}
              </Typography>
            </Stack>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={chip.label} color={chip.color} sx={{ fontWeight: 700 }} />
            {inv.level_name ? (
              <Chip
                size="small"
                icon={<LayersIcon sx={{ fontSize: "16px !important" }} />}
                label={inv.level_name}
                variant="outlined"
                sx={{ fontWeight: 600, borderColor: PORTAL.border }}
              />
            ) : null}
          </Stack>
        </Stack>

        <Box sx={{ width: "100%" }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
            <Typography variant="caption" sx={{ color: PORTAL.inkSoft, fontWeight: 700 }}>
              Payment progress
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: PORTAL.navyDeep }}>
              {pct}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              width: "100%",
              height: 10,
              borderRadius: 5,
              bgcolor: PORTAL.border,
              "& .MuiLinearProgress-bar": {
                borderRadius: 5,
                bgcolor: pct >= 100 ? "#16a34a" : PORTAL.gold,
              },
            }}
          />
        </Box>

        <Grid container spacing={1.5} sx={{ width: "100%", m: 0 }}>
          <Grid item xs={12} sm={4}>
            <AmountCell label="Term fee" value={`KES ${termTotal.toLocaleString()}`} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <AmountCell label="Paid" value={`KES ${paid.toLocaleString()}`} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <AmountCell label="Balance" value={`KES ${balance.toLocaleString()}`} highlight />
          </Grid>
        </Grid>

        {Number(inv.credit_balance || 0) > 0.01 ? (
          <Alert severity="success" sx={{ borderRadius: 2, width: "100%" }}>
            Credit on this level: <strong>KES {Number(inv.credit_balance).toLocaleString()}</strong> (overpayment).
            This counts toward fee requirements for this term/level.
          </Alert>
        ) : null}

        {Array.isArray(inv.payment_breakdown) && inv.payment_breakdown.length > 0 ? (
          <Box sx={{ width: "100%" }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, display: "block", mb: 1.25, letterSpacing: "0.05em", textTransform: "uppercase", color: PORTAL.inkSoft }}
            >
              What each half includes
            </Typography>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{
                width: "100%",
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                bgcolor: PORTAL.sky,
                border: `1px solid ${PORTAL.border}`,
                boxSizing: "border-box",
              }}
            >
              {["first_half", "second_half"].map((phaseKey) => {
                const ph =
                  inv.payment_breakdown.find((p) => p.phase === phaseKey) ||
                  inv.payment_breakdown.find((p) => String(p.phase).includes(phaseKey));
                if (!ph) return null;
                return <HalfBreakdownPanel key={phaseKey} phase={ph} />;
              })}
            </Stack>
          </Box>
        ) : null}

        <PaymentHistoryPanel
          payments={inv.payments}
          onDownloadReceipt={onDownloadReceipt}
          downloadingReceiptId={downloadingReceiptId}
        />

        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end" spacing={1.25} sx={{ pt: 0.5 }}>
          <Button
            variant="outlined"
            disabled={downloading}
            onClick={() => onDownload(inv)}
            startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : <DownloadOutlinedIcon />}
            sx={{
              alignSelf: { xs: "stretch", sm: "flex-end" },
              minWidth: { sm: 180 },
              fontWeight: 700,
              borderColor: PORTAL.border,
              color: PORTAL.navyDeep,
            }}
          >
            {downloading ? "Preparing PDF…" : "Download invoice"}
          </Button>
          <PortalPrimaryButton
            disabled={balance <= 0}
            onClick={() => onPay(inv)}
            startIcon={<PaymentsIcon />}
            sx={{
              alignSelf: { xs: "stretch", sm: "flex-end" },
              minWidth: { sm: 200 },
              opacity: balance <= 0 ? 0.65 : 1,
            }}
          >
            {balance <= 0 ? "Fully paid" : "Pay with M-Pesa"}
          </PortalPrimaryButton>
        </Stack>
      </Stack>
    </PortalSurfaceCard>
  );
}

export default function PortalFeesPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState("");
  const [payDlg, setPayDlg] = useState(null);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState(() => getStoredUserPhone());
  const [paying, setPaying] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await fetchMyParentFeeInvoices();
      setInvoices(rows);
    } catch (e) {
      setError(e.message || "Could not load fees.");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const totals = useMemo(() => {
    let balance = 0;
    for (const inv of invoices) {
      balance += Number(inv.balance || 0);
    }
    return { balance, count: invoices.length };
  }, [invoices]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const closePayDialog = () => {
    setPayDlg(null);
    setAmount("");
    setPhone(getStoredUserPhone());
  };

  const openPayDialog = (inv) => {
    setPayDlg(inv);
    setAmount(String(Number(inv.balance || 0) || ""));
    setPhone(getStoredUserPhone());
  };

  const downloadInvoicePdf = async (inv) => {
    if (!inv?.id) return;
    setDownloadingId(inv.id);
    setError("");
    try {
      const blob = await fetchMyParentFeeInvoicePdf(inv.id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      setError(e.message || "Could not download invoice PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const downloadReceiptPdf = async (payment) => {
    if (!payment?.id) return;
    setDownloadingReceiptId(payment.id);
    setError("");
    try {
      const blob = await fetchMyParentFeeReceiptPdf(payment.id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      setError(e.message || "Could not download receipt PDF.");
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  const fireSwal = (options) =>
    Swal.fire({
      confirmButtonColor: PORTAL.gold,
      ...options,
      didOpen: (popup) => {
        const container = Swal.getContainer();
        if (container) container.style.zIndex = "2000";
        options.didOpen?.(popup);
      },
    });

  const submitMpesaPay = async () => {
    if (!payDlg) return;
    const val = Number(amount);
    const phoneVal = String(phone || "").trim();
    if (!phoneVal) {
      await fireSwal({ icon: "warning", title: "Enter your M-Pesa number" });
      return;
    }
    if (!Number.isFinite(val) || val <= 0) {
      await fireSwal({ icon: "warning", title: "Enter a valid amount" });
      return;
    }
    setPaying(true);
    try {
      const invoiceId = payDlg.id;
      const stk = await postMyParentMpesaStkPush(invoiceId, {
        phone_number: phoneVal,
        amount: val,
      });

      closePayDialog();
      await sleep(200);

      await fireSwal({
        icon: "info",
        title: "Check your phone",
        text: stk.message || "Enter your M-Pesa PIN on your phone to complete payment.",
        timer: 4000,
        showConfirmButton: false,
      });

      const checkoutId = stk.checkout_request_id;
      let finalStatus = null;
      for (let i = 0; i < 40; i += 1) {
        await sleep(3000);
        finalStatus = await fetchMpesaStkPushStatus(checkoutId);
        if (finalStatus.status === "completed" || finalStatus.status === "failed") break;
      }

      await load();

      if (finalStatus?.status === "completed") {
        const paymentId = finalStatus.fee_payment_id;
        const result = await fireSwal({
          icon: "success",
          title: "Payment received",
          html: `
            <p style="margin:0;text-align:left">
              M-Pesa receipt: <strong>${finalStatus.mpesa_receipt_number || "—"}</strong><br/>
              Amount: <strong>KES ${Number(finalStatus.amount || val).toLocaleString()}</strong><br/>
              Your school payment receipt is ready to download.
            </p>
          `,
          showCancelButton: Boolean(paymentId),
          confirmButtonText: paymentId ? "Download receipt PDF" : "OK",
          cancelButtonText: "Close",
        });
        if (paymentId && result.isConfirmed) {
          await downloadReceiptPdf({ id: paymentId });
        }
      } else if (finalStatus?.status === "failed") {
        await fireSwal({
          icon: "error",
          title: "Payment not completed",
          text: finalStatus.result_desc || "The M-Pesa request was cancelled or failed.",
        });
      } else {
        await fireSwal({
          icon: "warning",
          title: "Payment pending",
          text: "We did not receive confirmation yet. If you completed payment on your phone, refresh this page in a moment.",
        });
      }
    } catch (e) {
      closePayDialog();
      await sleep(200);
      await fireSwal({ icon: "error", title: "M-Pesa payment failed", text: e.message });
    } finally {
      setPaying(false);
    }
  };

  return (
    <PortalPageShell>
      <PortalPageHero
        fullWidth
        icon={<AccountBalanceWalletOutlinedIcon />}
        title="School fees"
        subtitle="Pay any amount toward your child's invoice. Partial payments are applied to the 1st half, then the 2nd half."
        chip={
          !loading && totals.count > 0 ? (
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
              <Chip
                size="small"
                label={`${totals.count} invoice${totals.count === 1 ? "" : "s"}`}
                sx={{ ...portalChipSx(), bgcolor: "rgba(255,255,255,0.12)", color: "#fff", borderColor: PORTAL.borderGold }}
              />
              <Chip
                size="small"
                icon={<PaymentsIcon sx={{ fontSize: "16px !important", color: `${PORTAL.goldMuted} !important` }} />}
                label={
                  totals.balance > 0
                    ? `KES ${totals.balance.toLocaleString()} outstanding`
                    : "All paid up"
                }
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
          <PortalLoading label="Loading your invoices…" />
        ) : invoices.length === 0 ? (
          <PortalEmptyState
            icon={<ReceiptLongIcon />}
            title="No invoices yet"
            description="The school will send an invoice when fees are ready for your linked students. You'll be able to pay securely with M-Pesa from here."
          />
        ) : (
          <Stack spacing={2}>
            {invoices.map((inv) => (
              <FeeInvoiceCard
                key={inv.id || inv.invoice_number}
                inv={inv}
                onPay={openPayDialog}
                onDownload={downloadInvoicePdf}
                downloading={downloadingId === inv.id}
                onDownloadReceipt={downloadReceiptPdf}
                downloadingReceiptId={downloadingReceiptId}
              />
            ))}
          </Stack>
        )}

        <Dialog
          open={Boolean(payDlg)}
          onClose={() => !paying && closePayDialog()}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: { borderRadius: 3, border: `1px solid ${PORTAL.border}`, overflow: "hidden" },
          }}
        >
          <Box sx={{ height: 4, background: PORTAL.navyGradient }} />
          <DialogTitle sx={{ fontWeight: 800, fontFamily: PORTAL.fontDisplay, color: PORTAL.navyDeep, pb: 1 }}>
            Pay with M-Pesa
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 0.5, color: PORTAL.inkMuted, fontWeight: 600 }}>
              {payDlg?.student?.name || "Student"} · {payDlg?.invoice_number}
            </Typography>
            <Box
              sx={{
                mb: 2.5,
                p: 1.5,
                borderRadius: 2,
                bgcolor: PORTAL.sky,
                border: `1px solid ${PORTAL.border}`,
              }}
            >
              <Typography variant="caption" sx={{ color: PORTAL.inkSoft, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Balance due
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: "1.35rem", color: PORTAL.navyDeep }}>
                KES {Number(payDlg?.balance || 0).toLocaleString()}
              </Typography>
            </Box>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="M-Pesa phone number"
                placeholder="07XX XXX XXX or 2547XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                helperText="Safaricom number that will receive the M-Pesa prompt."
              />
              <TextField
                fullWidth
                label="Amount to pay (KES)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                helperText="You may pay part or all of the balance."
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, pt: 0 }}>
            <Button onClick={closePayDialog} disabled={paying} sx={{ fontWeight: 600, color: PORTAL.inkMuted }}>
              Cancel
            </Button>
            <Button variant="contained" disableElevation disabled={paying} onClick={() => void submitMpesaPay()} sx={portalPrimaryButtonSx()}>
              {paying ? "Waiting for M-Pesa…" : "Send M-Pesa prompt"}
            </Button>
          </DialogActions>
        </Dialog>
      </PortalPageContent>
    </PortalPageShell>
  );
}
