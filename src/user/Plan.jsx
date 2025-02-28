import React from "react";
import { useDateRange } from "../hooks/useDateRange";
import { useFirebaseData } from "../hooks/useFirebaseData";
import { format } from "date-fns";
import { formatDate } from "../functions/dateUtils";
import "../styles/user/plan.css";

const GoalsAndFactsComponent = () => {
  const { quantOfDays, dayToStart, startDate, endDate } = useDateRange();
  const { values, facts, summary } = useFirebaseData(quantOfDays, dayToStart);

  if (!startDate || !endDate) {
    return <section className="plan">Завантаження даних...</section>;
  }

  return (
    <section className="plan">
      <h2 className="plan__header">Мета і факт по датах</h2>
      <div className="plan__dates-container">
        {Array.from({ length: quantOfDays }).map((_, index) => {
          const currentDate = new Date(dayToStart);
          currentDate.setDate(currentDate.getDate() + index);
          const formattedDate = format(currentDate, "yyyy-MM-dd");
          const date = formatDate(dayToStart, index);

          return (
            <div key={formattedDate} className="plan__date-card">
              <h3 className="plan__date-title">
                {format(currentDate, "dd.MM.yyyy")}{" "}
                {facts[date] >= values[date] ? "✅" : "❌"}
              </h3>
              <div className="plan__data-row">
                <span className="plan__label">Ціль:</span>
                <span className="plan__value">{values[date] || "N/A"}</span>
              </div>
              <div className="plan__data-row">
                <span className="plan__label">Факт:</span>
                <span className="plan__value">{facts[date] || "N/A"}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="plan__summary">
        <p>
          <strong>Запланована сума:</strong> {summary} грн
        </p>
      </div>
    </section>
  );
};

export default GoalsAndFactsComponent;
