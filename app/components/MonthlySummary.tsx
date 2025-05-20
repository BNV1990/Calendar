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
        <div>
          <BsClock size={18} />
          <span>{totalHours}</span>
        </div>
        <div>
          <BsSun size={18} />
          <span>{dayHours}</span>
        </div>
        <div>
          <BsMoon size={18} />
          <span>{nightHours}</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary;
