"use client";

import React, { useEffect, useState, useCallback } from "react";
import Legend from "./components/Legend";
import Calendar from "./components/Calendar";
import AutorenewIcon from "./components/AutorenewIcon";
import { BsSave } from "react-icons/bs";
import { PiUsersFourThin } from "react-icons/pi"; // Import the new icon
import { CiClock2 } from "react-icons/ci";
import dynamic from "next/dynamic";

const DynamicShiftToggle = dynamic(() => import("./components/ShiftToggle"), {
  ssr: false,
});

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

// Define fixed base dates for each shift (May 1, 2, 3, 4, 2025)
const FIXED_SHIFT_BASE_DATES: ShiftInfo[] = [
  { year: 2025, month: 4, day: 1 }, // Shift 1: May 1, 2025 (month is 0-indexed)
  { year: 2025, month: 4, day: 2 }, // Shift 2: May 2, 2025
  { year: 2025, month: 4, day: 3 }, // Shift 3: May 3, 2025
  { year: 2025, month: 4, day: 4 }, // Shift 4: May 4, 2025
];

const UkrainianCalendar = () => {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [baseShiftInfo, setBaseShiftInfo] = useState<ShiftInfo | null>(null); // Initialize to null to prevent hydration mismatch
  const [selectedShiftIndex, setSelectedShiftIndex] = useState(0); // Initialize to 0, will be updated in useEffect
  const [calendarRows, setCalendarRows] = useState<React.JSX.Element[]>([]);
  const [isSaved, setIsSaved] = useState(false); // New state for save status
  const [isClient, setIsClient] = useState(false); // New state for client-side rendering
  const [savedShiftBaseDay, setSavedShiftBaseDay] = useState<string | null>(
    null
  ); // New state to hold the saved day from localStorage
  const [showShiftToggleMobile, setShowShiftToggleMobile] = useState(false); // State for shift toggle visibility
  const [showHoursSummary, setShowHoursSummary] = useState(false); // State for hours summary visibility, default to false

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
  );

  const generateCalendarData = useCallback(() => {
    if (!currentDate) return { rows: [], totalH: 0, dayH: 0, nightH: 0 }; // Return empty data if currentDate is null
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
          let shiftTypeForCell = null;
          let shiftTypeForPrevDay = null;

          if (baseShiftInfo) {
            shiftTypeForCell = getShiftForDate(cellDate, baseShiftInfo);
            const prevCalendarDay = new Date(year, month, date - 1);
            shiftTypeForPrevDay = getShiftForDate(
              prevCalendarDay,
              baseShiftInfo
            );

            // Check if the current cell is the selected base shift day
            if (
              cellDate.getFullYear() === baseShiftInfo.year &&
              cellDate.getMonth() === baseShiftInfo.month &&
              cellDate.getDate() === baseShiftInfo.day
            ) {
              cellClassName = "day-shift highlight-day-shift";
              dayNumberStyle = { fontWeight: "bold" };
              hoursTextForThisCell = "+12"; // Always add +12 for the base shift day
              currentMonthDayHours += 12;
              currentMonthTotalHours += 12;
            } else {
              // For other days, apply shift logic based on calculated shiftTypeForCell
              if (shiftTypeForCell === "D") {
                cellClassName = "day-shift";
                hoursTextForThisCell = "+12";
                currentMonthDayHours += 12;
                currentMonthTotalHours += 12;
              } else if (shiftTypeForCell === "N") {
                cellClassName = "night-shift";
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
            }

            if (hoursTextForThisCell !== "") {
              hoursSpan = (
                <span
                  className="hours-indicator"
                  style={{
                    display: showHoursSummary ? "inline-block" : "none",
                    visibility: showHoursSummary ? "visible" : "hidden",
                  }}
                >
                  {hoursTextForThisCell}
                </span>
              );
            }
          } else {
            // If no base shift is set, highlight the 1st day of the current month
            if (date === 1) {
              dayNumberStyle = { fontWeight: "bold" };
            }
            cellClassName = "off-day"; // Default to off-day if no base shift is set
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
  }, [currentDate, baseShiftInfo, getShiftForDate, showHoursSummary]); // showHoursSummary added here

  useEffect(() => {
    setIsClient(true); // Set to true once component mounts on client side
    setCurrentDate(new Date()); // Set current date on client side

    // Load showShiftToggleMobile state from localStorage
    const savedShiftToggleState = localStorage.getItem('showShiftToggleMobile');
    if (savedShiftToggleState !== null) {
      setShowShiftToggleMobile(savedShiftToggleState === 'true');
    }

    // Load showHoursSummary state from localStorage
    const savedHoursSummaryState = localStorage.getItem('showHoursSummary');
    if (savedHoursSummaryState !== null) {
      setShowHoursSummary(savedHoursSummaryState === 'true');
    }

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
  }, []); // Empty dependency array means this runs once on mount

  // Effects to save states to localStorage whenever they change
  useEffect(() => {
    if (isClient) { // Ensure localStorage is available
      localStorage.setItem('showShiftToggleMobile', String(showShiftToggleMobile));
    }
  }, [showShiftToggleMobile, isClient]);

  useEffect(() => {
    if (isClient) { // Ensure localStorage is available
      localStorage.setItem('showHoursSummary', String(showHoursSummary));
    }
  }, [showHoursSummary, isClient]);

  useEffect(() => {
    if (isClient) {
      setSavedShiftBaseDay(localStorage.getItem("savedBaseDay")); // Set the saved day state

      let targetShiftInfo: ShiftInfo;
      let targetVisualShiftIndex: number;

      const savedDay = localStorage.getItem("savedBaseDay");
      if (savedDay) {
        const savedDayInt = parseInt(savedDay);
        const foundIndex = FIXED_SHIFT_BASE_DATES.findIndex(
          (shift) => shift.day === savedDayInt
        );

        if (foundIndex !== -1) {
          targetShiftInfo = FIXED_SHIFT_BASE_DATES[foundIndex];
          targetVisualShiftIndex = foundIndex;
        } else {
          // If saved day is invalid or doesn't match a fixed base date, default to Shift 1
          targetShiftInfo = FIXED_SHIFT_BASE_DATES[0];
          targetVisualShiftIndex = 0;
          localStorage.removeItem("savedBaseDay"); // Clear invalid saved day
          setSavedShiftBaseDay(null);
        }
      } else {
        // No saved shift, default to Shift 1
        targetShiftInfo = FIXED_SHIFT_BASE_DATES[0];
        targetVisualShiftIndex = 0;
      }

      setBaseShiftInfo(targetShiftInfo);
      setSelectedShiftIndex(targetVisualShiftIndex);
    }
  }, [isClient]); // Run this effect when isClient changes to true

  // New useEffect to manage isSaved state based on current selected shift and saved shift
  useEffect(() => {
    if (baseShiftInfo && savedShiftBaseDay && currentDate) {
      // Add currentDate to dependencies
      // Calculate the effective shift index for the current baseShiftInfo.day
      const currentEffectiveShiftIndex =
        (((currentDate.getDate() - baseShiftInfo.day) %
          SHIFT_CYCLE_VALUES.length) +
          SHIFT_CYCLE_VALUES.length) %
        SHIFT_CYCLE_VALUES.length;

      // Calculate the effective shift index for the savedShiftBaseDay
      const savedEffectiveShiftIndex =
        (((currentDate.getDate() - parseInt(savedShiftBaseDay)) %
          SHIFT_CYCLE_VALUES.length) +
          SHIFT_CYCLE_VALUES.length) %
        SHIFT_CYCLE_VALUES.length;

      // Compare the effective shift indices
      setIsSaved(currentEffectiveShiftIndex === savedEffectiveShiftIndex);
    } else {
      setIsSaved(false); // No base shift info or no saved day
    }
  }, [baseShiftInfo, savedShiftBaseDay, currentDate]); // Depend on currentDate as well

  const handleShiftChange = (newShiftIndex: number) => {
    setSelectedShiftIndex(newShiftIndex); // Keep the visual selection correct

    // Use the fixed base date for the selected shift
    const selectedFixedBase = FIXED_SHIFT_BASE_DATES[newShiftIndex];

    setBaseShiftInfo({
      year: selectedFixedBase.year,
      month: selectedFixedBase.month,
      day: selectedFixedBase.day, // Corrected typo here
    });

    // Ensure we are on the current month if the view is not the current month
    const today = new Date();
    if (
      currentDate &&
      (currentDate.getMonth() !== today.getMonth() ||
        currentDate.getFullYear() !== today.getFullYear())
    ) {
      setCurrentDate(new Date());
    }
  };

  const saveShift = () => {
    if (baseShiftInfo) {
      const currentBaseDay = baseShiftInfo.day.toString();
      if (savedShiftBaseDay === currentBaseDay) {
        // If currently saved, do nothing (make button "inactive" in terms of action)
        // No alert, no localStorage.removeItem
      } else {
        // If not saved, save it
        localStorage.setItem("savedBaseDay", currentBaseDay);
        setSavedShiftBaseDay(currentBaseDay); // Update saved state
      }
    } else {
      alert("Немає робочої зміни для збереження.");
    }
  };

  const clearShift = () => {
    // 1. Return to the current month
    setCurrentDate(new Date());

    // 2. Set the shift slider to the shift saved in localStorage
    const savedDay = localStorage.getItem("savedBaseDay");
    let targetShiftInfo: ShiftInfo;
    let targetVisualShiftIndex: number;

    if (savedDay) {
      const savedDayInt = parseInt(savedDay);
      if (!isNaN(savedDayInt) && savedDayInt >= 1 && savedDayInt <= 4) {
        // Assuming days 1-4 correspond to shifts 1-4
        const foundIndex = FIXED_SHIFT_BASE_DATES.findIndex(
          (shift) => shift.day === savedDayInt
        );
        if (foundIndex !== -1) {
          targetShiftInfo = FIXED_SHIFT_BASE_DATES[foundIndex];
          targetVisualShiftIndex = foundIndex; // Assuming visual index matches array index
        } else {
          // Fallback to Shift 1 if saved day doesn't match a fixed base date
          targetShiftInfo = FIXED_SHIFT_BASE_DATES[0];
          targetVisualShiftIndex = 0;
          localStorage.removeItem("savedBaseDay"); // Clear invalid saved day
          setSavedShiftBaseDay(null);
        }
      } else {
        // No saved shift, default to Shift 1
        targetShiftInfo = FIXED_SHIFT_BASE_DATES[0];
        targetVisualShiftIndex = 0;
      }

      setBaseShiftInfo(targetShiftInfo);
      setSelectedShiftIndex(targetVisualShiftIndex);
    }
  };

  const prevMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = prevDate ? new Date(prevDate) : new Date();
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = prevDate ? new Date(prevDate) : new Date();
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  useEffect(() => {
    if (currentDate) {
      // Only generate calendar data if currentDate is not null
      const { rows, totalH, dayH, nightH } = generateCalendarData();
      setCalendarRows(rows);
      setTotalHours(totalH);
      setDayHours(dayH);
      setNightHours(nightH);
    }
    // Update selectedShiftIndex based on currentDate and baseShiftInfo
  }, [generateCalendarData, currentDate, baseShiftInfo, getShiftForDate]); // Removed showHoursSummary from here

  return (
    <div className="container">
      <div className="header-controls">
        {/* Wrapper for ShiftToggle */}
        <div
          className={`header-controls__toggle-wrapper ${
            showShiftToggleMobile
              ? "shift-toggle-wrapper"
              : "shift-toggle-wrapper--hidden"
          }`}
        >
          <DynamicShiftToggle
            selectedShiftIndex={selectedShiftIndex}
            onShiftChange={handleShiftChange}
          />
        </div>

        {/* Wrapper for Save/Refresh buttons - Kept second in JSX structure */}
        <div className="header-controls__buttons-wrapper">
          {/* New Clock Button (always visible) */}
          <div
            onClick={() => {
              setShowHoursSummary(!showHoursSummary);
            }}
            className="icon-button"
            style={{
              backgroundColor: showHoursSummary ? "#90c79e" : "#ffffff",
              border: `1px solid ${showHoursSummary ? "#90c79e" : "#dcdcdc"}`,
            }}
          >
            <CiClock2 size={24} color={showHoursSummary ? "#ffffff" : "#555"} />
          </div>
          {/* PiUsersFourThin Button (now always visible) */}
          <div
            onClick={() => setShowShiftToggleMobile(!showShiftToggleMobile)}
            className="icon-button"
            style={{
              backgroundColor: showShiftToggleMobile ? "#90c79e" : "#ffffff",
              border: `1px solid ${
                showShiftToggleMobile ? "#90c79e" : "#dcdcdc"
              }`,
            }}
          >
            <PiUsersFourThin
              size={24}
              color={showShiftToggleMobile ? "#ffffff" : "#555"}
            />
          </div>

          {/* Existing Save Button (always visible) */}
          <div
            onClick={saveShift}
            className="icon-button"
            style={{
              backgroundColor: isSaved ? "#90c79e" : "#ffffff",
              border: `1px solid ${isSaved ? "#90c79e" : "#dcdcdc"}`,
            }}
          >
            <BsSave size={24} color={isSaved ? "#ffffff" : "#555"} />
          </div>

          <AutorenewIcon onClick={clearShift} />
        </div>
      </div>

      <Calendar
        calendarRows={calendarRows}
        currentDate={currentDate}
        monthNames={UKRAINIAN_MONTH_NAMES}
        prevMonth={prevMonth}
        nextMonth={nextMonth}
        totalHours={totalHours}
        dayHours={dayHours}
        nightHours={nightHours}
        showHoursSummary={showHoursSummary}
      />

      <div className="instruction-and-legend-container">
        <div
          className="legend-and-summary-container"
          style={{ marginTop: "10px" }}
        >
          <Legend />
        </div>
      </div>

      {/* New container for Save and Reset buttons */}
      <div className="save-reset-buttons-container"></div>
    </div>
  );
};

export default UkrainianCalendar;
