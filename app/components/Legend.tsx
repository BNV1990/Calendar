import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa"; // Import an arrow icon

const Legend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="legend accordion">
      <h3 className="accordion-header" onClick={toggleAccordion}>
        Пояснення кольорів:
        <span className={`accordion-icon ${isOpen ? 'rotate' : ''}`}>
          <FaChevronDown />
        </span>
      </h3>
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
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
    </div>
  );
};

export default Legend;
