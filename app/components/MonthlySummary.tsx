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
      <h3>Підсумок годин за місяць:</h3>
      <p>
        Загальна кількість годин: <span id="total-hours">{totalHours}</span>
      </p>
      <p>
        Денних годин: <span id="day-hours">{dayHours}</span>
      </p>
      <p>
        Нічних годин: <span id="night-hours">{nightHours}</span>
      </p>
    </div>
  );
};

export default MonthlySummary;
