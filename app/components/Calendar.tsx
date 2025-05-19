import React from 'react';
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
    </>
  );
};

/* Стилі для мобільних пристроїв */
const styles = `
@media (max-width: 768px) {
  .calendar-table-container {
    width: 95%;
    margin: 0 auto;
  }
}
`;

export default Calendar;

/* Додаємо стилі до компонента */
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}
