import React from 'react';
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css'; // Import Swiper styles
import SwiperCore from 'swiper';

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

  const handleSlideChange = (swiper: SwiperCore) => {
    if (swiper.activeIndex > swiper.previousIndex) {
      nextMonth();
    } else {
      prevMonth();
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

      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        onSlideChange={handleSlideChange}
        allowTouchMove={true} // Enable touch swipe
      >
        <SwiperSlide>
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
        </SwiperSlide>
      </Swiper>
    </>
  );
};

export default Calendar;
