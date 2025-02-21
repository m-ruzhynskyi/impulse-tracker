import React from "react";
import DayItem from "./DayItem";

const DayList = ({ quantOfDays, dayToStart, values, handleInputChange }) => {
  const formatDate = (daysToAdd) => {
    const date = new Date(dayToStart);
    date.setDate(date.getDate() + daysToAdd);
    return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  return (
    <div className="plan-creator__days-list">
      {Array.from({ length: quantOfDays }).map((_, i) => (
        <DayItem
          key={i}
          date={formatDate(i)}
          value={values[formatDate(i)] || ""}
          onInputChange={handleInputChange}
        />
      ))}
    </div>
  );
};

export default DayList;
