import React from "react";
import { BsClock, BsSun, BsMoon } from "react-icons/bs";

interface MonthlySummaryProps {
  totalHours: number;
  dayHours: number;
  nightHours: number;
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  totalHours,
  dayHours,
  nightHours,
}) => {
  return (
    <div className="hours-summary" style={{ marginBottom: "20px" }}>
      <div className="hours-summary-items pc-align-right">
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <BsClock
            size={18}
            style={{
              color: "#333",
              fill: "#333",
              position: "relative",
              top: "2px",
            }}
          />
          <span style={{ color: "#333", verticalAlign: "middle" }}>
            {totalHours}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <BsSun
            size={18}
            style={{
              color: "#333",
              fill: "#333",
              position: "relative",
              top: "2px",
            }}
          />
          <span style={{ color: "#333", verticalAlign: "middle" }}>
            {dayHours}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <BsMoon
            size={18}
            style={{
              color: "#333",
              fill: "#333",
              position: "relative",
              top: "2px",
            }}
          />
          <span style={{ color: "#333", verticalAlign: "middle" }}>
            {nightHours}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary;
