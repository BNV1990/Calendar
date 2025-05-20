import React from "react";

const Legend = () => {
  return (
    <div className="legend">
      <div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {/* Desktop view */}
          <div className="legend-items-container">
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
    </div>
  );
};

export default Legend;
