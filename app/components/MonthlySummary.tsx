import React, { useState } from 'react';
import { FaChevronDown } from "react-icons/fa"; // Import an arrow icon

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
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="hours-summary accordion">
      <h3 className="accordion-header" onClick={toggleAccordion}>
        Підсумок годин за місяць:
        <span className={`accordion-icon ${isOpen ? 'rotate' : ''}`}>
          <FaChevronDown />
        </span>
      </h3>
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
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
  );
};

export default MonthlySummary;
