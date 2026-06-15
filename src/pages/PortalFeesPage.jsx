import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentsIcon from "@mui/icons-material/Payments";
import LayersIcon from "@mui/icons-material/Layers";
import Swal from "sweetalert2";
import {
  fetchMyParentFeeInvoices,
  postMyParentMpesaStkPush,
  fetchMpesaStkPushStatus,
} from "../api";

const accent = "#DC2626";
const accentLight = "#FEE2E2";
const accentDark = "#B91C1C";

function getStoredUserPhone() {
  try {
    const raw = localStorage.getItem("marketplace_user");
    if (!raw) return "";
    const user = JSON.parse(raw);
    return String(user?.phone || "").trim();
  } catch {
    return "";
  }
}

const pageShellSx = {
  minHeight: "100vh",
  pb: 3,
  width: "100%",
  maxWidth: "none",
  boxSizing: "border-box",
  background: "linear-gradient(180deg, #FEF2F2 0%, #fff 45%)",
};

const fullWidthCardSx = {
  width: "100%",
  maxWidth: "none",
  alignSelf: "stretch",
  border: "1px solid #f1d5d5",
  borderRadius: 2,
  bgcolor: "rgba(255,255,255,0.98)",
  boxShadow: "none",
};

function statusChipProps(status) {
  const s = String(status || "").toLowerCase();
  if (s === "paid") return { label: "Paid", color: "success" };
  if (s === "partial") return { label: "Partially paid", color: "warning" };
  if (s === "sent") return { label: "Awaiting payment", color: "info" };
  return { label: status || "—", color: "default" };
}

function AmountCell({ label, value, highlight }) {
  return (
    <Box sx={{ textAlign: { xs: "left", sm: "center" }, py: { xs: 0.5, sm: 0 } }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block" }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: { xs: "1.1rem", md: "1.2rem" },
          color: highlight ? accent : "text.primary",
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
        borderRadius: 1.5,
        bgcolor: "#fff",
        border: `1px solid ${accentLight}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
        <PaymentsIcon sx={{ fontSize: 18, color: accentDark }} />
        <Typography sx={{ fontWeight: 800, color: accentDark }}>
          {halfPhaseLabel(phase?.phase)}
        </Typography>
        <Typography sx={{ fontWeight: 800, ml: "auto" }}>KES {phaseTotal.toLocaleString()}</Typography>
      </Stack>

      {items.length > 0 ? (
        <Stack spacing={0.75} component="ul" sx={{ m: 0, pl: 2.25, listStyle: "disc" }}>
          {items.map((it, i) => (
            <Box component="li" key={`${phase?.phase}-${i}-${it.name}`} sx={{ display: "list-item" }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
                spacing={1}
                sx={{ width: "100%", pr: 0.5 }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, minWidth: 0 }}>
                  {it.name || "Fee item"}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  KES {Number(it.amount || 0).toLocaleString()}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No line items listed for this half — total shown above.
        </Typography>
      )}

      {items.length > 0 && Math.abs(itemsSum - phaseTotal) > 0.02 ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          Items subtotal: KES {itemsSum.toLocaleString()}
        </Typography>
      ) : null}
    </Box>
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

  const fireSwal = (options) =>
    Swal.fire({
      confirmButtonColor: accent,
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
        await fireSwal({
          icon: "success",
          title: "Payment received",
          html: `
            <p style="margin:0;text-align:left">
              M-Pesa receipt: <strong>${finalStatus.mpesa_receipt_number || "—"}</strong><br/>
              Amount: <strong>KES ${Number(finalStatus.amount || val).toLocaleString()}</strong>
            </p>
          `,
          confirmButtonText: "OK",
        });
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
    <Box sx={pageShellSx}>
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          pt: 2,
          width: "100%",
          maxWidth: "none",
          boxSizing: "border-box",
        }}
      >
        {error ? (
          <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
            {error}
          </Alert>
        ) : null}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: accent }} />
          </Box>
        ) : (
          <Card elevation={0} sx={fullWidthCardSx}>
            <CardContent sx={{ p: { xs: 2, sm: 3 }, "&:last-child": { pb: { xs: 2, sm: 3 } } }}>
              <Stack spacing={2.5} sx={{ width: "100%" }}>
                <Box sx={{ width: "100%" }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: accentDark, mb: 0.5 }}>
                    School fees
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ width: "100%" }}>
                    Pay any amount toward your child&apos;s invoice. Partial payments are applied to the 1st half,
                    then 2nd half.
                  </Typography>
                  {totals.count > 0 ? (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                      {totals.count} invoice{totals.count === 1 ? "" : "s"}
                      {totals.balance > 0 ? ` · KES ${totals.balance.toLocaleString()} outstanding` : " · all paid up"}
                    </Typography>
                  ) : null}
                </Box>

                {invoices.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 2, border: `1px solid ${accentLight}`, width: "100%" }}>
                    No invoices available yet. The school will send an invoice when fees are ready for your linked
                    students.
                  </Alert>
                ) : (
                  invoices.map((inv, idx) => {
                    const chip = statusChipProps(inv.status);
                    const termTotal = Number(inv.term_fee_amount || inv.amount_due || 0);
                    const paid = Number(inv.amount_paid || 0);
                    const balance = Number(inv.balance || 0);
                    const pct = termTotal > 0 ? Math.min(100, Math.round((paid / termTotal) * 100)) : 0;

                    return (
                      <Box key={inv.id || inv.invoice_number} sx={{ width: "100%" }}>
                        {idx > 0 ? <Divider sx={{ mb: 2.5, borderColor: accentLight }} /> : null}

                        <Stack spacing={2} sx={{ width: "100%" }}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            spacing={1.5}
                            sx={{ width: "100%" }}
                          >
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.1rem", sm: "1.2rem" } }}>
                                {inv.student?.name || "Student"}
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.5, flexWrap: "wrap" }}>
                                <ReceiptLongIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                <Typography variant="body2" color="text.secondary">
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
                                  sx={{ fontWeight: 600 }}
                                />
                              ) : null}
                            </Stack>
                          </Stack>

                          <Box sx={{ width: "100%" }}>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Payment progress
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                {pct}%
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{
                                width: "100%",
                                height: 8,
                                borderRadius: 4,
                                bgcolor: accentLight,
                                "& .MuiLinearProgress-bar": { bgcolor: pct >= 100 ? "#16a34a" : accent },
                              }}
                            />
                          </Box>

                          <Grid container spacing={2} sx={{ width: "100%", m: 0 }}>
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
                            <Alert severity="success" sx={{ borderRadius: 1.5, width: "100%" }}>
                              Credit on this level: <strong>KES {Number(inv.credit_balance).toLocaleString()}</strong>
                              {" "}
                              (overpayment). This counts toward fee requirements for this term/level.
                            </Alert>
                          ) : null}

                          {Array.isArray(inv.payment_breakdown) && inv.payment_breakdown.length > 0 ? (
                            <Box sx={{ width: "100%" }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 700, display: "block", mb: 1 }}
                              >
                                What each half includes
                              </Typography>
                              <Stack
                                direction={{ xs: "column", md: "row" }}
                                spacing={2}
                                sx={{
                                  width: "100%",
                                  p: { xs: 1.5, sm: 2 },
                                  borderRadius: 1.5,
                                  bgcolor: `${accent}06`,
                                  border: `1px solid ${accentLight}`,
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

                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="flex-end"
                            alignItems={{ xs: "stretch", sm: "center" }}
                            sx={{ width: "100%", pt: 0.5 }}
                          >
                            <Button
                              variant="contained"
                              fullWidth={false}
                              disabled={balance <= 0}
                              onClick={() => {
                                setPayDlg(inv);
                                setAmount(String(balance || ""));
                                setPhone(getStoredUserPhone());
                              }}
                              sx={{
                                bgcolor: accent,
                                fontWeight: 700,
                                px: 4,
                                alignSelf: { xs: "stretch", sm: "flex-end" },
                                minWidth: { sm: 160 },
                                "&:hover": { bgcolor: accentDark },
                              }}
                            >
                              {balance <= 0 ? "Fully paid" : "Pay with M-Pesa"}
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>
                    );
                  })
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        <Dialog open={Boolean(payDlg)} onClose={() => !paying && setPayDlg(null)} fullWidth maxWidth="xs">
          <DialogTitle sx={{ fontWeight: 800 }}>Pay with M-Pesa</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {payDlg?.student?.name || "Student"} · {payDlg?.invoice_number}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, fontWeight: 700, color: accent }}>
              Balance: KES {Number(payDlg?.balance || 0).toLocaleString()}
            </Typography>
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
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setPayDlg(null)} disabled={paying}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={paying}
              onClick={() => void submitMpesaPay()}
              sx={{ bgcolor: accent, fontWeight: 700 }}
            >
              {paying ? "Waiting for M-Pesa…" : "Send M-Pesa prompt"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
