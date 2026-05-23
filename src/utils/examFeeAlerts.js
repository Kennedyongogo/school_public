import Swal from "sweetalert2";

const accent = "#DC2626";

function feeNumbers(row) {
  const fa = row?.fee_access || {};
  const required = Number(row?.fee_required_amount ?? fa.required_amount ?? 0);
  const paid = Number(row?.fee_amount_paid ?? fa.amount_paid ?? fa.allocation?.total_paid ?? 0);
  return {
    mode: row?.exam_fee_access_mode || fa.mode || "none",
    required,
    paid,
    shortfall: Number(
      row?.fee_amount_shortfall ??
        fa.amount_shortfall ??
        Math.max(0, required - paid)
    ),
  };
}

function amountTable(required, paid, shortfall) {
  return `
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6">Required for this exam</td>
        <td style="padding:8px 0;text-align:right;font-weight:800;border-bottom:1px solid #f3f4f6">KES ${required.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6">Paid on your account</td>
        <td style="padding:8px 0;text-align:right;font-weight:700;border-bottom:1px solid #f3f4f6">KES ${paid.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:${accent};font-weight:700">Still needed</td>
        <td style="padding:8px 0;text-align:right;font-weight:800;color:${accent}">KES ${shortfall.toLocaleString()}</td>
      </tr>
    </table>
  `;
}

function feeAlertTitle(mode) {
  if (mode === "custom_minimum") return "Minimum fee not met";
  if (mode === "first_half_paid") return "First installment not met";
  if (mode === "full_fee_paid") return "Full fee not met";
  return "Fee payment required";
}

/**
 * SweetAlert when student tries to open exam but fee rules are not met.
 * @returns {Promise<boolean>} true — caller should not navigate
 */
export async function showExamFeeBlockedAlert(row) {
  const { mode, required, paid, shortfall } = feeNumbers(row);

  await Swal.fire({
    icon: "warning",
    title: feeAlertTitle(mode),
    html: `<div style="text-align:left;line-height:1.55;font-size:15px">${amountTable(required, paid, shortfall)}</div>`,
    confirmButtonText: "OK",
    confirmButtonColor: accent,
  });
  return true;
}

/** @returns {Promise<boolean>} true if handled as fee error */
export async function showExamFeeErrorFromApi(err) {
  if (!err) return false;
  const feeAccess = err.fee_access;
  if (err.code === "EXAM_FEE_NOT_MET" || feeAccess) {
    await showExamFeeBlockedAlert({
      fee_access: feeAccess,
      exam_fee_access_mode: feeAccess?.mode,
      fee_required_amount: feeAccess?.required_amount,
      fee_amount_paid: feeAccess?.amount_paid,
      fee_amount_shortfall: feeAccess?.amount_shortfall,
    });
    return true;
  }
  return false;
}
