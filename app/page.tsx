"use client";

import React, { useEffect, useState, useCallback } from "react";
import Legend from "./components/Legend";
import MonthlySummary from "./components/MonthlySummary";
import Calendar from "./components/Calendar";
import AutorenewIcon from "./components/AutorenewIcon";

interface ShiftInfo {
  year: number;
  month: number;
  day: number;
}

// Define constants outside the component so they are stable references
const SHIFT_CYCLE_VALUES = ["D", "N", "O1", "O2"]; // День, Ніч, Вихідний1, Вихідний2
const UKRAINIAN_MONTH_NAMES = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

const UkrainianCalendar = () => {
  const today = new Date();
  const initialBaseShiftInfo = {
    year: today.getFullYear(),
    month: today.getMonth(),
    day: 1,
  };
  const [currentDate, setCurrentDate] = useState(new Date());
  const [baseShiftInfo, setBaseShiftInfo] = useState<ShiftInfo | null>(
    initialBaseShiftInfo
  ); // Initial state for 1st day
  const [baseDayInput, setBaseDayInput] = useState("1"); // Initial value is "1"
  const [calendarRows, setCalendarRows] = useState<React.JSX.Element[]>([]);

  // State for hours summary
  const [totalHours, setTotalHours] = useState(0);
  const [dayHours, setDayHours] = useState(0);
  const [nightHours, setNightHours] = useState(0);

  const getShiftForDate = useCallback(
    (targetDate: Date, bsInfo: ShiftInfo | null): string | null => {
      if (!bsInfo) return null;

      const baseDateMidnight = new Date(bsInfo.year, bsInfo.month, bsInfo.day);
      const targetDateMidnight = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate()
      );

      const diffInMilliseconds =
        targetDateMidnight.getTime() - baseDateMidnight.getTime();
      const diffInDays = Math.round(diffInMilliseconds / (1000 * 60 * 60 * 24));

      // Use the stable SHIFT_CYCLE_VALUES
      const cycleIndex =
        ((diffInDays % SHIFT_CYCLE_VALUES.length) + SHIFT_CYCLE_VALUES.length) %
        SHIFT_CYCLE_VALUES.length;
      return SHIFT_CYCLE_VALUES[cycleIndex];
    },
    []
  ); // SHIFT_CYCLE_VALUES is a constant from outer scope, so it's stable.
  // exhaustive-deps might suggest adding SHIFT_CYCLE_VALUES here; it's good practice: [SHIFT_CYCLE_VALUES]

  const generateCalendarData = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-11

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Нд) - 6 (Сб)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    let currentMonthTotalHours = 0;
    let currentMonthDayHours = 0;
    let currentMonthNightHours = 0;

    const generatedCalendarRows: React.JSX.Element[] = [];
    let date = 1;

    for (let i = 0; i < 6; i++) {
      // Макс 6 тижнів
      const weekCells: React.JSX.Element[] = [];
      for (let j = 0; j < 7; j++) {
        // 7 днів на тиждень
        if (i === 0 && j < adjustedFirstDay) {
          weekCells.push(
            <td key={`empty-${i}-${j}`} className="empty-cell"></td>
          );
        } else if (date > daysInMonth) {
          weekCells.push(
            <td key={`empty-${i}-${j}`} className="empty-cell"></td>
          );
        } else {
          const cellDate = new Date(year, month, date);
          const today = new Date();
          const isToday =
            date === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          let cellClassName = "";
          let hoursTextForThisCell = "";
          let hoursSpan = null;

          let dayNumberStyle = {};
          if (baseShiftInfo) {
            const shiftTypeForCell = getShiftForDate(cellDate, baseShiftInfo);
            const prevCalendarDay = new Date(year, month, date - 1);
            const shiftTypeForPrevDay = getShiftForDate(
              prevCalendarDay,
              baseShiftInfo
            );

            // Highlight the base shift day if it's a day shift
            if (
              cellDate.getFullYear() === baseShiftInfo.year &&
              cellDate.getMonth() === baseShiftInfo.month &&
              cellDate.getDate() === baseShiftInfo.day &&
              shiftTypeForCell === "D"
            ) {
              cellClassName = "day-shift highlight-day-shift";
              dayNumberStyle = { fontWeight: "bold", color: "red" };
            } else if (shiftTypeForCell === "D") {
              cellClassName = "day-shift";
            } else if (shiftTypeForCell === "N") {
              cellClassName = "night-shift";
            } else {
              cellClassName = "off-day";
            }

            if (shiftTypeForCell === "D") {
              hoursTextForThisCell = "+12";
              currentMonthDayHours += 12;
              currentMonthTotalHours += 12;
            } else if (shiftTypeForCell === "N") {
              hoursTextForThisCell = "+4";
              currentMonthNightHours += 4;
              currentMonthTotalHours += 4;
            } else if (
              (shiftTypeForCell === "O1" || shiftTypeForCell === "O2") &&
              shiftTypeForPrevDay === "N"
            ) {
              hoursTextForThisCell = "+8";
              currentMonthNightHours += 8;
              currentMonthTotalHours += 8;
            }

            if (hoursTextForThisCell !== "") {
              hoursSpan = (
                <span className="hours-indicator">{hoursTextForThisCell}</span>
              );
            }
          }

          if (isToday) {
            cellClassName += " today";
          }

          weekCells.push(
            <td key={date} className={cellClassName}>
              {hoursSpan}
              <span className="day-number" style={dayNumberStyle}>
                {date}
              </span>
            </td>
          );
          date++;
        }
      }
      generatedCalendarRows.push(<tr key={i}>{weekCells}</tr>);
      if (date > daysInMonth) break;
    }

    return {
      rows: generatedCalendarRows,
      totalH: currentMonthTotalHours,
      dayH: currentMonthDayHours,
      nightH: currentMonthNightHours,
    };
  }, [currentDate, baseShiftInfo, getShiftForDate]); // Corrected dependencies

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  const applyShift = () => {
    const day = parseInt(baseDayInput);
    const today = new Date(); // Get current date
    const currentYearVal = today.getFullYear(); // Use current year
    const currentMonthVal = today.getMonth(); // Use current month
    const daysInCurrentMonth = new Date(
      currentYearVal,
      currentMonthVal + 1,
      0
    ).getDate();

    if (isNaN(day) || day < 1 || day > daysInCurrentMonth) {
      alert(
        `Будь ласка, введіть коректний день місяця (1-${daysInCurrentMonth}) для ${UKRAINIAN_MONTH_NAMES[currentMonthVal]} ${currentYearVal}.`
      );
      return;
    }

    // Set baseShiftInfo using the current month and year
    setBaseShiftInfo({
      year: currentYearVal,
      month: currentMonthVal,
      day: day,
    });

    // If the current view is not the current month, navigate to the current month
    if (
      currentDate.getMonth() !== currentMonthVal ||
      currentDate.getFullYear() !== currentYearVal
    ) {
      setCurrentDate(new Date());
    }
  };

  const incrementDay = () => {
    const day = parseInt(baseDayInput);
    const currentMonthVal = new Date().getMonth();
    const currentYearVal = new Date().getFullYear();
    const daysInCurrentMonth = new Date(
      currentYearVal,
      currentMonthVal + 1,
      0
    ).getDate();
    if (!isNaN(day) && day < daysInCurrentMonth) {
      setBaseDayInput((day + 1).toString());
    } else if (isNaN(day)) {
      setBaseDayInput("1");
    }
    // applyShift(); // Removed direct call
  };

  const decrementDay = () => {
    const day = parseInt(baseDayInput);
    if (!isNaN(day) && day > 1) {
      setBaseDayInput((day - 1).toString());
    } else if (isNaN(day)) {
      setBaseDayInput("1");
    }
    // applyShift(); // Removed direct call
  };

  const clearShift = () => {
    setBaseShiftInfo(initialBaseShiftInfo); // Set to initial state for 1st day
    setBaseDayInput("1"); // Set to "1" instead of empty string
    setTotalHours(0);
    setDayHours(0);
    setNightHours(0);
    setCurrentDate(new Date()); // Navigate to current month
  };

  const prevMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Apply shift whenever baseDayInput changes
  useEffect(() => {
    if (isNaN(parseInt(baseDayInput))) return; // Prevent applying shift if input is not a number
    applyShift();
  }, [baseDayInput]); // Dependency on baseDayInput

  useEffect(() => {
    const { rows, totalH, dayH, nightH } = generateCalendarData();
    setCalendarRows(rows);
    setTotalHours(totalH);
    setDayHours(dayH);
    setNightHours(nightH);
  }, [generateCalendarData]);

  return (
    <div className="container">
      <h1>Календар робочих змін</h1>

      <div className="controls">
        <div className="input-and-clear-wrapper">
          {" "}
          {/* New wrapper */}
          <div className="day-input-wrapper">
            {" "}
            {/* Wrapper for input and buttons */}
            <button onClick={decrementDay} className="day-control-button">
              -
            </button>
            <input
              type="number"
              id="base-day-input"
              min="1"
              max="31"
              className="control-day-input"
              value={baseDayInput}
              onChange={(e) => setBaseDayInput(e.target.value)}
            />
            <button onClick={incrementDay} className="day-control-button">
              +
            </button>
          </div>
          <AutorenewIcon onClick={clearShift} />
        </div>{" "}
        {/* End of new wrapper */}
      </div>

      <Calendar
        calendarRows={calendarRows}
        currentDate={currentDate}
        monthNames={UKRAINIAN_MONTH_NAMES}
        prevMonth={prevMonth}
        nextMonth={nextMonth}
      />

      <p className="instruction-text">* Виберіть будь-який день поточного місяця, коли у вас "ДЕННА" зміна!</p>

      <div className="legend-and-summary-container">
        <Legend />

        <MonthlySummary
          totalHours={totalHours}
          dayHours={dayHours}
          nightHours={nightHours}
        />
      </div>
    </div>
  );
};

export default UkrainianCalendar;
