import React from "react";

const Legend = () => {
  return (
    <div className="legend">
      <h3>
        Пояснення кольорів:
      </h3>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Desktop view */}
          <div className="legend-desktop">
            <p>
              <span className="legend-color day-shift-legend"></span> Денна зміна
            </p>
            <p>
              <span className="legend-color night-shift-legend"></span> Нічна
              зміна
            </p>
            <p>
              <span className="legend-color off-day-legend"></span> Вихідний день
            </p>
          </div>
        </div>
        {/* Mobile view */}
        <div className="legend-mobile">
          <div className="legend-item">
            <span className="legend-color day-shift-legend"></span> Денна
          </div>
          <div className="legend-item">
            <span className="legend-color night-shift-legend"></span> Нічна
          </div>
          <div className="legend-item">
            <span className="legend-color off-day-legend"></span> Вихідний
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legend;
