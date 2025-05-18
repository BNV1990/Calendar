import React from 'react';

const Legend: React.FC = () => {
  return (
    <div className="legend">
      <h3>Легенда:</h3>
      <p>
        <span className="legend-color day-shift-legend"></span> Денна зміна
      </p>
      <p>
        <span className="legend-color night-shift-legend"></span> Нічна зміна
      </p>
      <p>
        <span className="legend-color off-day-legend"></span> Вихідний день
      </p>
    </div>
  );
};

export default Legend;
