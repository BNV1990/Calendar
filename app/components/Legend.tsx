import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa"; // Import an arrow icon
import { TbClockHour8 } from "react-icons/tb";
import { GoSun } from "react-icons/go";
import { MdOutlineNightlight } from "react-icons/md";

interface LegendProps {
  totalHours: number;
  dayHours: number;
  nightHours: number;
}

const Legend: React.FC<LegendProps> = ({
  totalHours,
  dayHours,
  nightHours,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="legend accordion no-accordion-mobile">
      <h3 className="accordion-header" onClick={toggleAccordion}>
        Пояснення кольорів:
        <span style={{ marginLeft: '50px' }}>Підсумок годин за місяць:</span>
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
          {/* Monthly Summary Desktop */}
          <div className="monthly-summary-content desktop-view">
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
        {/* Monthly Summary Mobile */}
        <div className="monthly-summary-content mobile-view">
          <div className="summary-item">
            <TbClockHour8 /> <span>{totalHours}</span>
          </div>
          <div className="summary-item">
            <GoSun /> <span>{dayHours}</span>
          </div>
          <div className="summary-item">
            <MdOutlineNightlight /> <span>{nightHours}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legend;
