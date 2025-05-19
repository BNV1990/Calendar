import React from 'react';

const MonthlySummary = () => {
  return (
    <div className="hours-summary" style={{ marginBottom: '20px' }}>
      <h2>Підсумок годин за місяць:</h2>
      <div>
        <p>Загальна кількість годин:<span>192</span></p>
        <p>Денних годин:<span>96</span></p>
        <p>Нічних годин:<span>96</span></p>
      </div>
    </div>
  );
};

export default MonthlySummary;
