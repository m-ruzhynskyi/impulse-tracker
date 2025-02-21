import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/user/settings/plan/datePicker.css";
import dateFormatter from "../../functions/dateFormatter";

export default function RenderDatePicker({
  setQuantOfDays,
  setDayToStart,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const onChange = (dates) => {
    const [start, end] = dates;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start && start < today) return;
    if (end && end < today) return;

    if (start && end) {
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      setStartDate(start);
      setEndDate(end);
      setQuantOfDays(diffDays);
      setDayToStart(start);
      setIsOpen(false);
    } else if (start) {
      setStartDate(start);
      setEndDate(null);
    }
  };

  return (
    <div className="date-picker">
      <p>Тривалість енерджі:</p>
      <div className="render-date-picker-wrapper">
        <div className="render-date-picker">
          <button
            type="button"
            className="date-picker-trigger-btn"
            onClick={() => setIsOpen(!isOpen)}
          >
            {startDate && endDate
              ? `${dateFormatter(startDate)} - ${dateFormatter(endDate)}`
              : "## - ##"}
          </button>

          {isOpen && (
            <div className="calendar">
              <DatePicker
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                selected={startDate}
                selectsRange
                inline
                minDate={new Date()}
                filterDate={(date) => date >= new Date().setHours(0, 0, 0, 0)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
