import { useState, useEffect } from "react";
import { parseRangeId } from "../functions/dateUtils";
import { db } from "../firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export const useDateRange = () => {
  const [quantOfDays, setQuantOfDays] = useState(0);
  const [dayToStart, setDayToStart] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const findActiveRange = async () => {
    try {
      const impulseRef = collection(db, "impulse");
      const q = query(impulseRef, orderBy("__name__"));
      const snapshot = await getDocs(q);
      const today = new Date();

      let activeRange = null;
      const ranges = [];

      snapshot.forEach((doc) => {
        const range = parseRangeId(doc.id);
        ranges.push(range);
      });

      activeRange = ranges.find((r) => today >= r.start && today <= r.end);
      if (!activeRange) activeRange = ranges.find((r) => r.start > today);

      if (activeRange) {
        const days =
          Math.ceil((activeRange.end - activeRange.start) / 86400000) + 1;
        setStartDate(activeRange.start);
        setEndDate(activeRange.end);
        setDayToStart(activeRange.start);
        setQuantOfDays(days);
      }
    } catch (error) {
      console.error("Error loading ranges:", error);
    }
  };

  useEffect(() => {
    findActiveRange();
  }, []);

  return {
    quantOfDays,
    dayToStart,
    startDate,
    endDate,
    setQuantOfDays,
    setDayToStart,
    setStartDate,
    setEndDate,
  };
};
