import React from "react";
import styles from "./ShiftToggle.module.css";

interface ShiftToggleProps {
  selectedShiftIndex: number;
  onShiftChange: (index: number) => void;
}

const SHIFT_LABELS = ["Зміна 1", "Зміна 2", "Зміна 3", "Зміна 4"];

const ShiftToggle: React.FC<ShiftToggleProps> = ({
  selectedShiftIndex,
  onShiftChange,
}) => {
  return (
    <div className={styles.toggleContainer}>
      {SHIFT_LABELS.map((label, index) => (
        <button
          key={index}
          className={`${styles.toggleButton} ${
            selectedShiftIndex === index ? styles.active : ""
          }`}
          onClick={() => onShiftChange(index)}
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
