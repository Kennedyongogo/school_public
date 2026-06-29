import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { PortalLoading } from "../components/Portal/portalUi";
import { bootAssignmentTake } from "../utils/assignmentTakeBoot";
import PortalAssignmentTakePage from "./PortalAssignmentTakePage";
import PortalPdfAssignmentTakePage from "./PortalPdfAssignmentTakePage";

export default function PortalAssignmentTakeRouter() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bootPayload, setBootPayload] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setBootPayload(null);
      try {
        const payload = await bootAssignmentTake(assignmentId);
        if (!cancelled) setBootPayload(payload);
      } catch (e) {
        if (!cancelled) {
          await Swal.fire({ icon: "error", title: "Could not open", text: e.message });
          navigate("/portal/assignments", { replace: true });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [assignmentId, navigate]);

  if (loading || !bootPayload) {
    return <PortalLoading label="Preparing your assignment…" />;
  }

  const assignmentType = bootPayload.assignment?.assignment_type || "questions";
  if (assignmentType === "pdf_form") {
    return <PortalPdfAssignmentTakePage bootPayload={bootPayload} />;
  }
  return <PortalAssignmentTakePage bootPayload={bootPayload} />;
}
