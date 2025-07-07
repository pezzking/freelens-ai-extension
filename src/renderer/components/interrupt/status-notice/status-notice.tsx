import { CheckCircle, XCircle } from "lucide-react";
import styleInline from "./status-notice.scss?inline";

interface StatusNoticeProps {
  approved: boolean;
}

const StatusNotice = ({ approved }: StatusNoticeProps) => {
  return (
    <>
      <style>{styleInline}</style>
      <div className={`status-notice-container ${approved ? "status-notice-approved" : "status-notice-rejected"}`}>
        {approved ? (
          <CheckCircle className="status-notice-icon status-notice-approved" />
        ) : (
          <XCircle className="status-notice-icon status-notice-rejected" />
        )}
        <span>{approved ? "This action has been approved" : "This action has not been approved"}</span>
      </div>
    </>
  );
};

export default StatusNotice;
