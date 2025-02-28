import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useDateRange } from "../hooks/useDateRange";
import "../styles/user/leaders.css";
import dateFormatter from "../functions/dateFormatter";
import { dateDDMMYYYY } from "../functions/dateUtils";

export default function UserRanking() {
  const [rankingData, setRankingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { quantOfDays, dayToStart } = useDateRange();

  useEffect(() => {
    async function fetchRanking() {
      try {
        setIsLoading(true);

        const workersDocRef = doc(db, "info", "workers", "data", "workers");
        const workersSnap = await getDoc(workersDocRef);
        if (!workersSnap.exists()) {
          throw new Error("Дані користувачів не знайдені");
        }
        const workersData = workersSnap.data();

        const workerIds = Object.keys(workersData);
        if (!dayToStart || quantOfDays <= 0) {
          throw new Error("Активний проміжок часу не визначено");
        }

        const ranking = [];
        for (const workerId of workerIds) {
          let userTotal = 0;
          for (let i = 0; i < quantOfDays; i++) {
            const currentDate = new Date(dayToStart);
            currentDate.setDate(currentDate.getDate() + i);
            const dateString = dateDDMMYYYY(currentDate);
            const userDocRef = doc(db, workersData[workerId], dateString);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              userTotal += Number(userData.totalSum) || 0;
            }
          }
          ranking.push({
            workerId: workersData[workerId],
            name: workerId,
            totalSales: userTotal,
          });
        }

        ranking.sort((a, b) => b.totalSales - a.totalSales);
        setRankingData(ranking);
        setError(null);
      } catch (err) {
        console.error("Помилка завантаження рейтингу:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRanking();
  }, [dayToStart, quantOfDays]);
  const startDate = new Date(dayToStart);
  const endDate = new Date(dayToStart);
  endDate.setDate(startDate.getDate() + quantOfDays - 1);
  const dateRange = `${dateFormatter(startDate)} - ${dateFormatter(endDate)}`;

  if (isLoading) {
    return <div className="ranking-loading">Завантаження...</div>;
  }

  if (error) {
    return <div className="ranking-error">❗️ {error}</div>;
  }

  return (
    <section className="user-ranking">
      <div className="ranking-header">
        <h2 className="ranking-title">Рейтинг продажів</h2>
        <span className="ranking-dates">{dateRange}</span>
      </div>

      <div className="ranking-list">
        <div className="list-header">
          <span>Місце</span>
          <span>Працівник</span>
          <span>Сума</span>
        </div>
        {rankingData.map((user, index) => (
          <div
            key={user.workerId}
            className={`list-item ${index === 0 ? "first-place" : ""}`}
          >
            <span className="place-number">{index + 1}</span>
            <span className="user-name">{user.name}</span>
            <span className="sales-amount">
              {user.totalSales.toLocaleString()}₴
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
