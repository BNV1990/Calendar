import React, { useState, useRef, useEffect } from "react";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { TbClockHour8 } from "react-icons/tb";
import { GoSun } from "react-icons/go";
import { MdOutlineNightlight } from "react-icons/md";

interface CalendarProps {
  calendarRows: React.JSX.Element[];
  currentDate: Date;
  monthNames: string[];
  prevMonth: () => void;
  nextMonth: () => void;
  totalHours: number;
  dayHours: number;
  nightHours: number;
}

type AnimationDirection = "none" | "left" | "right";

const Calendar: React.FC<CalendarProps> = ({
  calendarRows,
  currentDate,
  monthNames,
  prevMonth,
  nextMonth,
  totalHours,
  dayHours,
  nightHours,
}) => {
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [animationDirection, setAnimationDirection] =
    useState<AnimationDirection>("none");
  const calendarRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    const threshold = 50; // Minimum swipe distance
    const distance = touchStartX - touchEndX;

    if (distance > threshold) {
      setAnimationDirection("left");
      nextMonth();
    } else if (distance < -threshold) {
      setAnimationDirection("right");
      prevMonth();
    }
    setTouchStartX(0);
    setTouchEndX(0);
  };

  useEffect(() => {
    if (animationDirection !== "none") {
      const handler = setTimeout(() => {
        setAnimationDirection("none");
      }, 300); // Match this duration with your CSS animation duration
      return () => clearTimeout(handler);
    }
  }, [animationDirection]);

  return (
    <div
      className={`calendar-container ${animationDirection}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={calendarRef}
    >
      <div className="calendar-header">
        <div className="month-navigation">
          <button id="prev-month-button" onClick={(e) => { e.stopPropagation(); prevMonth(); }} onTouchStart={(e) => { e.stopPropagation(); prevMonth(); }} style={{ minWidth: '44px', minHeight: '44px', zIndex: 10 }}>
            <FaCaretLeft /> <span className="button-text">Попередній</span>
          </button>
          <h2 id="month-year-header">{`${
            monthNames[currentDate.getMonth()]
          } ${currentDate.getFullYear()}`}</h2>
          <button id="next-month-button" onClick={(e) => { e.stopPropagation(); nextMonth(); }} onTouchStart={(e) => { e.stopPropagation(); nextMonth(); }} style={{ minWidth: '44px', minHeight: '44px', zIndex: 10 }}>
            <span className="button-text">Наступний</span> <FaCaretRight />
          </button>
        </div>
      </div>

      {/* Monthly Summary Mobile */}
      <div
        className="monthly-summary-content mobile-view"
        style={{ marginBottom: "20px" }}
      >
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

      <div className="calendar-table-container">
        <table id="calendar-table">
          <thead>
            <tr>
              <th>Пн</th>
              <th>Вт</th>
              <th>Ср</th>
              <th>Чт</th>
              <th>Пт</th>
              <th>Сб</th>
              <th>Нд</th>
            </tr>
          </thead>
          <tbody id="calendar-body">{calendarRows}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Calendar;
