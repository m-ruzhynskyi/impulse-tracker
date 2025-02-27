import React from "react";

const DayItem = ({ date, value, onInputChange }) => {
  return (
    <div className="plan-creator__day-item">
      <p className="plan-creator__date">{date}</p>
      <input
        type="number"
        value={value}
        onChange={(e) => onInputChange(date, e.target.value)}
        placeholder="0"
        min="0"
        className="plan-creator__input"
      />
    </div>
  );
};

export default DayItem;
