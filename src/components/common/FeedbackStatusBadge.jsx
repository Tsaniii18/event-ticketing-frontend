import { FEEDBACK_STATUS_CONFIG as STATUS_CONFIG } from "../../utils";

export default function FeedbackStatusBadge({
  status,
  completedLabel = "Selesai",
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.waiting;
  const StatusIcon = config.icon;

  return (
    <span
      className={`ui-badge ${config.className}`}
    >
      <StatusIcon size={14} />
      {status === "completed" ? completedLabel : config.label}
    </span>
  );
}
