import React, { useState } from "react";
import RenderDatePicker from "./DatePicker.jsx";
import '../../styles/user/settings/plan/placCreator.css'

const PlanCreator = () => {
  const [quantOfDays, setQuantOfDays] = useState(0);
  const [dayToStart, setDayToStart] = useState(new Date());
  const [values, setValues] = useState({});
  const [summary, setSummary] = useState(0);

  const formatDate = (daysToAdd) => {
    const date = new Date(dayToStart);
    date.setDate(date.getDate() + daysToAdd);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}`;
  };

  const calculateSum = (newValues) => {
    return Object.values(newValues).reduce((sum, value) => {
      return sum + (Number(value) || 0);
    }, 0);
  };

  const handleInputChange = (date, value) => {
    const newValues = {
      ...values,
      [date]: value
    };
    setValues(newValues);
    setSummary(calculateSum(newValues));
  };

  return (
    <div className="plan-creator">
      <RenderDatePicker setQuantOfDays={setQuantOfDays} setDayToStart={setDayToStart} />

      <div className="plan-creator__days-list">
        {new Array(quantOfDays).fill(0).map((_, i) => {
          const formattedDate = formatDate(i);
          return (
            <div key={i} className="plan-creator__day-item">
              <span className="plan-creator__date">{formattedDate}</span>
              <input
                type="number"
                value={values[formattedDate] || ''}
                onChange={(e) => handleInputChange(formattedDate, e.target.value)}
                placeholder="Введіть суму"
                className="plan-creator__input"
                min={0}
              />
            </div>
          );
        })}
      </div>
      <p className={'plan-creator__day__sum'}>Всього: {summary}</p>
    </div>
  );
};

export default PlanCreator;