import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/user/settings/plan/datePicker.css";
import dateFormatter from "../../functions/dateFormatter";

export default function RenderDatePicker({ setQuantOfDays }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const onChange = (dates) => {
    const [start, end] = dates;
    if (start && end && start > end) {
      setStartDate(start);
      setEndDate(end);
    } else {
      setStartDate(start);
      setEndDate(end);
    }
    if (start && end) {
      setIsOpen(false);
      setQuantOfDays(Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
    }
  };

  return (
    <div className={"date-picker"}>
      <p>Тривалість енерджі:</p>
      <div className={"render-date-picker-wrapper"}>
        <div className="render-date-picker">
          <button
            type="button"
            className="date-picker-trigger-btn"
            onClick={() => setIsOpen(!isOpen)}
          >
            {!startDate ? "##" : dateFormatter(startDate)} -{" "}
            {!endDate ? "##" : dateFormatter(endDate)}
          </button>

          {isOpen && (
            <div className="calendar">
              <DatePicker
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                minDate={new Date()}
                showPopperArrow={false}
                selectsRange
                inline
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
