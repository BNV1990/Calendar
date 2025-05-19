import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa"; // Import an arrow icon

interface LegendProps {}

const Legend: React.FC<LegendProps> = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="legend accordion no-accordion-mobile">
      <h3 className="accordion-header" onClick={toggleAccordion}>
        Пояснення кольорів:
        <span className={`accordion-icon ${isOpen ? "rotate" : ""}`}>
          <FaChevronDown />
        </span>
      </h3>
      <div className={`accordion-content ${isOpen ? "open" : ""}`}>
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
