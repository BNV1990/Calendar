import React from "react";
import styles from "./ShiftToggle.module.css";

export interface ShiftToggleProps { // Export the interface
  selectedShiftIndex: number;
  onShiftChange: (index: number) => void;
  disabled: boolean; // Add disabled prop
}

const SHIFT_LABELS = ["Зміна 1", "Зміна 2", "Зміна 3", "Зміна 4"];

const ShiftToggle: React.FC<ShiftToggleProps> = ({
  selectedShiftIndex,
  onShiftChange,
  disabled, // Destructure disabled prop
}) => {
  return (
    <div className={`${styles.toggleContainer} ${disabled ? styles.disabled : ""}`}>
      {SHIFT_LABELS.map((label, index) => (
        <button
          key={index}
          className={`${styles.toggleButton} ${
            selectedShiftIndex === index ? styles.active : ""
          }`}
          onClick={() => onShiftChange(index)}
          disabled={disabled} // Apply disabled attribute
        >
          {label}
        </button>
      ))}
      <div
        className={styles.toggleSlider}
        style={{ transform: `translateX(${selectedShiftIndex * 100}%)` }}
      ></div>
    </div>
  );
};

export default ShiftToggle;
