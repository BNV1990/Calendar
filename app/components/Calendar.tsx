import React, { useState } from 'react';
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";

interface CalendarProps {
  calendarRows: React.JSX.Element[];
  currentDate: Date;
  monthNames: string[];
  prevMonth: () => void;
  nextMonth: () => void;
}

const Calendar: React.FC<CalendarProps> = ({
  calendarRows,
  currentDate,
  monthNames,
  prevMonth,
  nextMonth,
}) => {
  const [touchStartX, setTouchStartX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent default to avoid scrolling while swiping
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX;
    const swipeThreshold = 50; // Minimum distance for a swipe

    if (swipeDistance > swipeThreshold) {
      prevMonth();
    } else if (swipeDistance < -swipeThreshold) {
      nextMonth();
    }
  };

  return (
    <>
      <div className="calendar-header">
        <div className="month-navigation">
          <button id="prev-month-button" onClick={prevMonth}>
            <FaCaretLeft /> <span className="button-text">Попередній</span>
          </button>
          <h2 id="month-year-header">{`${
            monthNames[currentDate.getMonth()]
          } ${currentDate.getFullYear()}`}</h2>
          <button id="next-month-button" onClick={nextMonth}>
            <span className="button-text">Наступний</span> <FaCaretRight />
          </button>
        </div>
      </div>

      <div
        className="calendar-table-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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
    </>
  );
};

export default Calendar;
