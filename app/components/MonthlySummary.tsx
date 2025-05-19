import React from 'react';

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
    <div className="hours-summary">
    </div>
  );
};

export default MonthlySummary;
