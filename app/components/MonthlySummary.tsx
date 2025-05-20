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
    <div className="hours-summary" style={{ marginBottom: '20px' }}>
      <h2>Підсумок годин за місяць:</h2>
      <div className="hours-summary-items">
        <p>Загальна кількість годин:<span>{totalHours}</span></p>
        <p>Денних годин:<span>{dayHours}</span></p>
        <p>Нічних годин:<span>{nightHours}</span></p>
      </div>
    </div>
  );
};

export default MonthlySummary;
