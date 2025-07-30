"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Legend from "./components/Legend";
import Calendar from "./components/Calendar";
import AutorenewIcon from "./components/AutorenewIcon";
import { BsSave } from "react-icons/bs";
import { PiUsersFour } from "react-icons/pi"; // Import the new icon
import dynamic from "next/dynamic";

import type { ShiftToggleProps } from "./components/ShiftToggle"; // Import the props type

const DynamicShiftToggle = dynamic<ShiftToggleProps>(
  () => import("./components/ShiftToggle"),
  {
    ssr: false,
  }
);

const DynamicBsInfoSquare = dynamic(
  () => import("react-icons/bs").then((mod) => mod.BsInfoSquare),
  { ssr: false }
);

const DynamicFiClock = dynamic(
  () => import("react-icons/fi").then((mod) => mod.FiClock),
  { ssr: false }
);

const DynamicRiRadioButtonLine = dynamic(
  () => import("react-icons/ri").then((mod) => mod.RiRadioButtonLine),
  { ssr: false }
);

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
  const [isLoading, setIsLoading] = useState(true); // New state for loading skeleton
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [baseShiftInfo, setBaseShiftInfo] = useState<ShiftInfo | null>(null); // Initialize to null to prevent hydration mismatch
  const [selectedShiftIndex, setSelectedShiftIndex] = useState(0); // Initialize to 0, will be updated in useEffect
  const selectedShiftIndexRef = useRef(selectedShiftIndex);
  const [calendarRows, setCalendarRows] = useState<React.JSX.Element[]>([]);
  const [isSaved, setIsSaved] = useState(false); // New state for save status
  const [isClient, setIsClient] = useState(false); // New state for client-side rendering
  const [savedShiftBaseDay, setSavedShiftBaseDay] = useState<string | null>(
    null
  ); // New state to hold the saved day from localStorage
  const [showShiftToggleMobile, setShowShiftToggleMobile] = useState(false); // State for shift toggle visibility
  const [showHoursSummary, setShowHoursSummary] = useState(false); // State for hours summary visibility, default to false
  const [showLegend, setShowLegend] = useState(false); // New state for legend visibility, default to false
  const [isClientMounted, setIsClientMounted] = useState(false); // New state for client-side mounting
  const [isOnlineShiftDetectionActive, setIsOnlineShiftDetectionActive] =
    useState(false); // New state for online shift detection

  // State for hours summary
  const [totalHours, setTotalHours] = useState(0);
  const [dayHours, setDayHours] = useState(0);
  const [nightHours, setNightHours] = useState(0);

  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null); // Для ID setTimeout
  const isOnlineRef = useRef(isOnlineShiftDetectionActive); // Реф для isOnlineShiftDetectionActive
  const currentShiftIndexRefFromState = useRef(selectedShiftIndex); // Реф для selectedShiftIndex (як ви вже мали)
  const scheduleNextCheckRef = useRef<(() => void) | null>(null); // Ref for scheduleNextCheck

  const calculateDayNightHoursForShift = (shiftType: string, part: 'full' | 'start' | 'end') => {
    // Night hours in Ukraine are from 22:00 to 06:00
    if (shiftType === 'D') {
        // Day shift 08:00 - 20:00. All 12 hours are day hours.
        return { day: 12, night: 0 };
    }

    if (shiftType === 'N') {
        // Night shift 20:00 - 08:00
        if (part === 'start') {
            // Part from 20:00 to 24:00 on the first day
            // Day part: 20:00-22:00 (2 hours)
            // Night part: 22:00-24:00 (2 hours)
            return { day: 2, night: 2 };
        }
        if (part === 'end') {
            // Part from 00:00 to 08:00 on the second day
            // Night part: 00:00-06:00 (6 hours)
            // Day part: 06:00-08:00 (2 hours)
            return { day: 2, night: 6 };
        }
    }

    return { day: 0, night: 0 };
  };

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
      const calculatedShift = SHIFT_CYCLE_VALUES[cycleIndex];
      console.log(
        `[getShiftForDate] Target: ${targetDate.toLocaleDateString()}, Base: ${baseDateMidnight.toLocaleDateString()}, DiffDays: ${diffInDays}, CycleIndex: ${cycleIndex}, CalculatedShift: ${calculatedShift}`
      );
      return calculatedShift;
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

            let dailyTotalHours = 0;
            let dailyDayHours = 0;
            let dailyNightHours = 0;

            // Determine shift type, class name, and calculate hours
            if (shiftTypeForCell === "D") {
              cellClassName = "day-shift";
              const { day, night } = calculateDayNightHoursForShift('D', 'full');
              dailyDayHours += day;
              dailyNightHours += night;
            } else if (shiftTypeForCell === "N") {
              cellClassName = "night-shift";
              const { day, night } = calculateDayNightHoursForShift('N', 'start');
              dailyDayHours += day;
              dailyNightHours += night;
            } else if (shiftTypeForCell === "O1" || shiftTypeForCell === "O2") {
              cellClassName = "off-day";
              // This is an off day, but might have hours from previous night shift
              if (shiftTypeForPrevDay === "N") {
                const { day, night } = calculateDayNightHoursForShift('N', 'end');
                dailyDayHours += day;
                dailyNightHours += night;
              }
            }
            
            dailyTotalHours = dailyDayHours + dailyNightHours;
            
            if (dailyTotalHours > 0) {
                hoursTextForThisCell = `+${dailyTotalHours}`;
            }

            currentMonthTotalHours += dailyTotalHours;
            currentMonthDayHours += dailyDayHours;
            currentMonthNightHours += dailyNightHours;

            // Check if the current cell is the selected base shift day for highlighting
            if (
              cellDate.getFullYear() === baseShiftInfo.year &&
              cellDate.getMonth() === baseShiftInfo.month &&
              cellDate.getDate() === baseShiftInfo.day
            ) {
              // The base day is always a 'D' shift, so its class is already day-shift
              cellClassName += " highlight-day-shift"; // Append class
              dayNumberStyle = { fontWeight: "bold" };
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

  const determineCurrentShiftIndex = useCallback(() => {
    const now = new Date();
    const effectiveDate = new Date(now);
    const currentHour = now.getHours();
    let targetShiftType: "D" | "N" | null = null;

    // ... (ваша логіка визначення targetShiftType та effectiveDate) ...
    // Додайте логування тут, як ми робили раніше
    console.log(
      `[determineCurrentShiftIndex] Now: ${now.toISOString()}, Hour: ${currentHour}, TargetType: ${targetShiftType}, EffectiveDate: ${effectiveDate.toISOString()}`
    );

    if (currentHour >= 8 && currentHour < 20) {
      targetShiftType = "D"; // Day shift
    } else if (currentHour >= 20) {
      // 20:00 to 23:59
      targetShiftType = "N"; // Night shift (starts today)
    } else if (currentHour >= 0 && currentHour < 8) {
      // 00:00 to 07:59
      targetShiftType = "N"; // Night shift (started yesterday)
      effectiveDate.setDate(effectiveDate.getDate() - 1); // Adjust to previous day
    }

    if (targetShiftType) {
      for (let i = 0; i < FIXED_SHIFT_BASE_DATES.length; i++) {
        const baseInfo = FIXED_SHIFT_BASE_DATES[i];
        const calculatedShift = getShiftForDate(effectiveDate, baseInfo);
        console.log(
          `[determineCurrentShiftIndex] Checking Shift ${i + 1}, BaseDay ${
            baseInfo.day
          }, Calculated ${calculatedShift}`
        );
        if (calculatedShift === targetShiftType) {
          console.log(`[determineCurrentShiftIndex] Match! Index: ${i}`);
          return i;
        }
      }
    }
    console.warn(
      "[determineCurrentShiftIndex] No match. Returning ref value:",
      selectedShiftIndexRef.current
    );
    return currentShiftIndexRefFromState.current; // ВИКОРИСТОВУЙТЕ РЕФ, А НЕ СТАН З ЗАМИКАННЯ
  }, [getShiftForDate]); // Видаліть selectedShiftIndex з залежностей, він тепер не потрібен тут

  const handleShiftChange = useCallback(
    (newShiftIndex: number, isInternalCall: boolean = false) => {
      if (isOnlineShiftDetectionActive && !isInternalCall) {
        console.log(
          "Shift change disabled: Online shift detection is active for manual changes."
        );
        return;
      }
      setSelectedShiftIndex(newShiftIndex);

      // Use the fixed base date for the selected shift
      const selectedFixedBase = FIXED_SHIFT_BASE_DATES[newShiftIndex];

      setBaseShiftInfo({
        year: selectedFixedBase.year,
        month: selectedFixedBase.month,
        day: selectedFixedBase.day,
      });

      // Ensure we are on the current month if the view is not the current month
      setCurrentDate((prevDate) => {
        const today = new Date();
        if (
          prevDate &&
          (prevDate.getMonth() !== today.getMonth() ||
            prevDate.getFullYear() !== today.getFullYear())
        ) {
          return new Date();
        }
        return prevDate;
      });
    },
    [isOnlineShiftDetectionActive]
  ); // Add isOnlineShiftDetectionActive to dependencies

  const saveShift = useCallback(() => {
    if (isOnlineShiftDetectionActive) {
      // If online detection is active, saving is not allowed.
      // No need to deactivate online detection here, as per user's latest feedback.
      return;
    }

    if (baseShiftInfo) {
      const currentBaseDay = baseShiftInfo.day.toString();
      if (savedShiftBaseDay === currentBaseDay) {
        // If currently saved, do nothing (make button "inactive" in terms of action)
      } else {
        // If not saved, save it
        localStorage.setItem("savedBaseDay", currentBaseDay);
        setSavedShiftBaseDay(currentBaseDay); // Update saved state
      }
    } else {
      // No alert, as per user feedback
    }
  }, [baseShiftInfo, savedShiftBaseDay, isOnlineShiftDetectionActive]);

  const clearShift = useCallback(() => {
    // Always return to the current month
    setCurrentDate(new Date());

    if (isOnlineShiftDetectionActive) {
      // If online detection is active, only return to current month, do not change shift
      console.log(
        "Clear Shift: Online detection active, only returning to current month."
      );
      return;
    }

    // If online detection is NOT active, proceed with setting the shift from localStorage
    console.log(
      "Clear Shift: Online detection inactive, setting shift from localStorage."
    );
    const savedDay = localStorage.getItem("savedBaseDay");
    let targetShiftInfo: ShiftInfo;
    let targetVisualShiftIndex: number;

    if (savedDay) {
      const savedDayInt = parseInt(savedDay);
      if (!isNaN(savedDayInt) && savedDayInt >= 1 && savedDayInt <= 4) {
        const foundIndex = FIXED_SHIFT_BASE_DATES.findIndex(
          (shift) => shift.day === savedDayInt
        );
        if (foundIndex !== -1) {
          targetShiftInfo = FIXED_SHIFT_BASE_DATES[foundIndex];
          targetVisualShiftIndex = foundIndex;
        } else {
          targetShiftInfo = FIXED_SHIFT_BASE_DATES[0];
          targetVisualShiftIndex = 0;
          localStorage.removeItem("savedBaseDay");
          setSavedShiftBaseDay(null);
        }
      } else {
        targetShiftInfo = FIXED_SHIFT_BASE_DATES[0];
        targetVisualShiftIndex = 0;
      }

      setBaseShiftInfo(targetShiftInfo);
      setSelectedShiftIndex(targetVisualShiftIndex);
    }
  }, [isOnlineShiftDetectionActive]); // Add isOnlineShiftDetectionActive to dependencies

  useEffect(() => {
    setIsClient(true); // Set to true once component mounts on client side
    setIsClientMounted(true); // Set to true once component mounts on client side
    setCurrentDate(new Date()); // Set current date on client side
    setIsLoading(false); // Set loading to false once client is mounted

    // Load states from localStorage
    const savedShiftToggleState = localStorage.getItem("showShiftToggleMobile");
    if (savedShiftToggleState !== null) {
      setShowShiftToggleMobile(savedShiftToggleState === "true");
    }

    const savedHoursSummaryState = localStorage.getItem("showHoursSummary");
    if (savedHoursSummaryState !== null) {
      setShowHoursSummary(savedHoursSummaryState === "true");
    }

    const savedLegendState = localStorage.getItem("showLegend");
    if (savedLegendState !== null) {
      setShowLegend(savedLegendState === "true");
    }

    const savedOnlineShiftDetectionState = localStorage.getItem(
      "isOnlineShiftDetectionActive"
    );
    if (savedOnlineShiftDetectionState !== null) {
      setIsOnlineShiftDetectionActive(
        savedOnlineShiftDetectionState === "true"
      );
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
    if (isClient) {
      // Ensure localStorage is available
      localStorage.setItem(
        "showShiftToggleMobile",
        String(showShiftToggleMobile)
      );
    }
  }, [showShiftToggleMobile, isClient]);

  useEffect(() => {
    if (isClient) {
      // Ensure localStorage is available
      localStorage.setItem("showHoursSummary", String(showHoursSummary));
    }
  }, [showHoursSummary, isClient]);

  useEffect(() => {
    if (isClient) {
      // Ensure localStorage is available
      localStorage.setItem("showLegend", String(showLegend));
    }
  }, [showLegend, isClient]);

  useEffect(() => {
    if (isClient) {
      // Ensure localStorage is available
      localStorage.setItem("showLegend", String(showLegend));
    }
  }, [showLegend, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(
        "isOnlineShiftDetectionActive",
        String(isOnlineShiftDetectionActive)
      );
    }
    // When online detection is turned OFF, apply the saved shift
    if (isClient && !isOnlineShiftDetectionActive) {
      console.log("Online detection turned OFF. Applying saved shift.");
      const savedDay = localStorage.getItem("savedBaseDay");
      let targetShiftInfo: ShiftInfo;
      let targetVisualShiftIndex: number;

      if (savedDay) {
        const savedDayInt = parseInt(savedDay);
        const foundIndex = FIXED_SHIFT_BASE_DATES.findIndex(
          (shift) => shift.day === savedDayInt
        );

        if (foundIndex !== -1) {
          targetShiftInfo = FIXED_SHIFT_BASE_DATES[foundIndex];
          targetVisualShiftIndex = foundIndex;
        } else {
          targetShiftInfo = FIXED_SHIFT_BASE_DATES[0];
          targetVisualShiftIndex = 0;
          localStorage.removeItem("savedBaseDay");
          setSavedShiftBaseDay(null);
        }
      } else {
        targetShiftInfo = FIXED_SHIFT_BASE_DATES[0];
        targetVisualShiftIndex = 0;
      }

      setBaseShiftInfo(targetShiftInfo);
      setSelectedShiftIndex(targetVisualShiftIndex);
      setCurrentDate(new Date()); // Also ensure we are on the current month
    }
  }, [isOnlineShiftDetectionActive, isClient, setBaseShiftInfo, setSelectedShiftIndex, setSavedShiftBaseDay]); // Added dependencies

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

  // Оновлюємо рефи при зміні відповідних станів
  useEffect(() => {
    isOnlineRef.current = isOnlineShiftDetectionActive;
  }, [isOnlineShiftDetectionActive]);

  useEffect(() => {
    currentShiftIndexRefFromState.current = selectedShiftIndex;
  }, [selectedShiftIndex]);

  // --- Функції, які НЕ залежать від стану напряму, а використовують рефи або передані аргументи ---

  // Define performUpdateAndReschedule as a useCallback
  const performUpdateAndReschedule = useCallback(() => {
    const currentPerformTime = new Date();
    console.log(
      `[performUpdateAndReschedule] Timeout fired or initial call. Current time: ${currentPerformTime.toISOString()}`
    );
    if (!isOnlineRef.current) {
      console.log(
        "[performUpdateAndReschedule] Became offline before action. Aborting."
      );
      return;
    }

    const detectedIndex = determineCurrentShiftIndex();
    console.log(
      `[performUpdateAndReschedule] Detected: ${detectedIndex}, Current in Ref: ${currentShiftIndexRefFromState.current}`
    );

    if (detectedIndex !== currentShiftIndexRefFromState.current) {
      console.log(
        `[performUpdateAndReschedule] Change needed. Calling handleShiftChange(${detectedIndex}, true)`
      );
      handleShiftChange(detectedIndex, true); // Pass true for internal call
    } else {
      console.log("[performUpdateAndReschedule] No change needed.");
    }
    // Recursive call to scheduleNextCheck
    // Use the ref to call scheduleNextCheck to break circular dependency
    if (scheduleNextCheckRef.current) {
      scheduleNextCheckRef.current();
    }
  }, [
    isOnlineRef,
    determineCurrentShiftIndex,
    currentShiftIndexRefFromState,
    handleShiftChange,
  ]);

  const scheduleNextCheck = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    if (!isOnlineRef.current) {
      console.log(
        "[scheduleNextCheck] Online detection is OFF. Not scheduling."
      );
      return;
    }

    const now = new Date();
    const nextChangeTime = new Date(now);
    nextChangeTime.setMinutes(0, 0, 0);
    const currentHour = now.getHours();

    if (currentHour < 8) nextChangeTime.setHours(8);
    else if (currentHour < 20) nextChangeTime.setHours(20);
    else {
      nextChangeTime.setHours(8);
      nextChangeTime.setDate(now.getDate() + 1);
    }

    const msUntilNextChange = nextChangeTime.getTime() - now.getTime();
    console.log(
      `[scheduleNextCheck] Scheduling next check. Now: ${now.toISOString()}, Next change at: ${nextChangeTime.toISOString()}, MS until: ${msUntilNextChange}`
    );

    if (msUntilNextChange <= 0) {
      console.log(
        `[scheduleNextCheck] Time is past (${msUntilNextChange}ms). Scheduling immediate check.`
      );
      timeoutIdRef.current = setTimeout(performUpdateAndReschedule, 50);
      return;
    }

    console.log(
      `[scheduleNextCheck] Next check in ${Math.round(
        msUntilNextChange / 1000
      )}s`
    );
    timeoutIdRef.current = setTimeout(
      performUpdateAndReschedule,
      msUntilNextChange
    );
  }, [timeoutIdRef, isOnlineRef, performUpdateAndReschedule]);

  // Effect to keep scheduleNextCheckRef updated
  useEffect(() => {
    scheduleNextCheckRef.current = scheduleNextCheck;
  }, [scheduleNextCheck]);

  // Основний useEffect для запуску/зупинки
  useEffect(() => {
    if (isOnlineShiftDetectionActive) {
      console.log("[Effect isOnline] Activating online detection.");
      // При першій активації, нам потрібно негайно перевірити та запланувати.
      // Функція scheduleNextCheck сама зробить перевірку, якщо msUntilNextChange <= 0.

      // Потрібно викликати логіку, яка перевіряє та оновлює зміну, а потім планує.
      // Це може бути сама performUpdateAndReschedule з тіла scheduleNextCheck.
      const initialUpdateAndSchedule = () => {
        const currentInitialTime = new Date();
        console.log(
          `[Effect isOnline] Initial call to initialUpdateAndSchedule. Current time: ${currentInitialTime.toISOString()}, isOnlineRef.current: ${
            isOnlineRef.current
          }`
        );
        if (!isOnlineRef.current) {
          console.log(
            "[Effect isOnline] Became offline before initial action. Aborting."
          );
          return;
        }
        const detectedIndex = determineCurrentShiftIndex();
        console.log(
          `[Effect isOnline] Initial Detected: ${detectedIndex}, Current in Ref: ${currentShiftIndexRefFromState.current}`
        );
        if (detectedIndex !== currentShiftIndexRefFromState.current) {
          console.log(
            `[Effect isOnline] Initial Change needed. Calling handleShiftChange(${detectedIndex}, true)`
          );
          handleShiftChange(detectedIndex, true); // Pass true for internal call
        } else {
          console.log("[Effect isOnline] Initial No change needed.");
        }
        scheduleNextCheck(); // Запускаємо цикл планування
      };
      initialUpdateAndSchedule();
    } else {
      console.log(
        "[Effect isOnline] Deactivating online detection. Clearing timeout."
      );
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    }

    return () => {
      console.log("[Effect isOnline] Cleanup. Clearing timeout.");
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, [
    isOnlineShiftDetectionActive,
    determineCurrentShiftIndex,
    handleShiftChange,
    scheduleNextCheck, // Added scheduleNextCheck back to dependencies
  ]);

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
      {isLoading ? (
        <>
          {/* Skeleton for header controls */}
          <div className="header-controls skeleton-header-controls">
            <div className="skeleton-toggle-wrapper">
              <div className="skeleton-toggle-slider"></div>
              <div className="skeleton-toggle-button"></div>
              <div className="skeleton-toggle-button"></div>
              <div className="skeleton-toggle-button"></div>
              <div className="skeleton-toggle-button"></div>
            </div>
            <div className="header-controls__buttons-wrapper">
              <div className="skeleton-icon-button"></div>
              <div className="skeleton-icon-button"></div>
              <div className="skeleton-icon-button"></div>
              <div className="skeleton-icon-button"></div>
              <div className="skeleton-icon-button"></div>
            </div>
          </div>

          {/* Skeleton for calendar header */}
          <div className="calendar-header skeleton-calendar-header">
            <div className="skeleton-nav-button"></div>
            <div className="skeleton-month-display"></div>
            <div className="skeleton-nav-button"></div>
          </div>

          {/* Skeleton for calendar table */}
          <table className="skeleton-calendar-table">
            <thead>
              <tr>
                {[...Array(7)].map((_, i) => (
                  <th key={i} className="skeleton-calendar-th"></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(6)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td
                      key={`${i}-${j}`}
                      className="skeleton-calendar-cell"
                    ></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Skeleton for instruction and legend container */}
          <div className="instruction-and-legend-container">
            <div className="legend-and-summary-container">
              <div className="skeleton-legend-line"></div>
              <div className="skeleton-legend-line short"></div>
            </div>
          </div>
        </>
      ) : (
        <>
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
                disabled={isOnlineShiftDetectionActive} // Pass disabled prop
              />
            </div>

            {/* Wrapper for Save/Refresh buttons - Kept second in JSX structure */}
            <div className="header-controls__buttons-wrapper">
              {/* BsInfoSquare Button */}
              {isClientMounted && (
                <div
                  onClick={() => setShowLegend(!showLegend)}
                  className="icon-button"
                  style={{
                    backgroundColor: showLegend ? "#90c79e" : "#ffffff",
                    border: `1px solid ${showLegend ? "#90c79e" : "#dcdcdc"}`,
                  }}
                >
                  <DynamicBsInfoSquare
                    size={24}
                    color={showLegend ? "#ffffff" : "#555"}
                  />
                </div>
              )}
              {/* Original Clock Button (now always visible) */}
              <div
                onClick={() => {
                  setShowHoursSummary(!showHoursSummary);
                }}
                className="icon-button"
                style={{
                  backgroundColor: showHoursSummary ? "#90c79e" : "#ffffff",
                  border: `1px solid ${
                    showHoursSummary ? "#90c79e" : "#dcdcdc"
                  }`,
                }}
              >
                <DynamicFiClock
                  size={24}
                  color={showHoursSummary ? "#ffffff" : "#555"}
                />
              </div>
              {/* PiUsersFourThin Button (now always visible) */}
              <div
                onClick={() => setShowShiftToggleMobile(!showShiftToggleMobile)}
                className="icon-button"
                style={{
                  backgroundColor: showShiftToggleMobile
                    ? "#90c79e"
                    : "#ffffff",
                  border: `1px solid ${
                    showShiftToggleMobile ? "#90c79e" : "#dcdcdc"
                  }`,
                }}
              >
                <PiUsersFour
                  size={24}
                  color={showShiftToggleMobile ? "#ffffff" : "#555"}
                />
              </div>

              {/* New Online Shift Detection Button */}
              {isClientMounted && (
                <div
                  onClick={() => {
                    setIsOnlineShiftDetectionActive(
                      (prev) => !prev
                    );
                  }}
                  className="icon-button"
                  style={{
                    backgroundColor: isOnlineShiftDetectionActive
                      ? "#90c79e"
                      : "#ffffff",
                    border: `1px solid ${
                      isOnlineShiftDetectionActive ? "#90c79e" : "#dcdcdc"
                    }`,
                  }}
                >
                  <DynamicRiRadioButtonLine
                    size={24}
                    color={isOnlineShiftDetectionActive ? "#ffffff" : "#555"}
                  />
                </div>
              )}

              {/* Existing Save Button (always visible) */}
              <div
                onClick={saveShift}
                className="icon-button"
                style={{
                  backgroundColor:
                    isSaved && !isOnlineShiftDetectionActive
                      ? "#90c79e"
                      : "#ffffff",
                  border: `1px solid ${
                    isSaved && !isOnlineShiftDetectionActive
                      ? "#90c79e"
                      : "#dcdcdc"
                  }`,
                }}
              >
                <BsSave
                  size={24}
                  color={
                    isSaved && !isOnlineShiftDetectionActive
                      ? "#ffffff"
                      : "#555"
                  }
                />
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
              className={`legend-and-summary-container ${
                showLegend ? "legend-visible" : "legend-hidden"
              }`}
              style={{ marginTop: "10px" }}
            >
              <Legend />
            </div>
          </div>

          {/* New container for Save and Reset buttons */}
          <div className="save-reset-buttons-container"></div>
        </>
      )}
    </div>
  );
};

export default UkrainianCalendar;
