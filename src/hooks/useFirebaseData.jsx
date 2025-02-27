import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, collection, getDocs, setDoc } from "firebase/firestore";
import { getRangeId, formatDate } from "../functions/dateUtils";

export const useFirebaseData = (quantOfDays, dayToStart) => {
  const [values, setValues] = useState({});
  const [facts, setFacts] = useState({});
  const [summary, setSummary] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const calculateSum = (vals) => {
    return Object.values(vals).reduce(
      (acc, val) => acc + (Number(val) || 0),
      0,
    );
  };

  const handleInputChange = (date, value) => {
    const newValues = { ...values, [date]: value };
    setValues(newValues);
    setSummary(calculateSum(newValues));
  };

  const loadData = async () => {
    const rangeId = getRangeId(quantOfDays, dayToStart);
    if (!rangeId) return;

    try {
      const rangeRef = doc(db, "impulse", rangeId);
      const rangeDoc = await getDoc(rangeRef);

      if (rangeDoc.exists()) {
        const daysCol = collection(rangeRef, "days");
        const daysSnapshot = await getDocs(daysCol);
        const data = {};
        const facts = {};

        daysSnapshot.forEach((doc) => {
          data[doc.id] = doc.data().goal.toString();
          facts[doc.id] = doc.data().fact.toString();
        });

        setValues(data);
        setFacts(facts);
        setSummary(calculateSum(data));
      } else {
        setValues({});
        setSummary(0);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const saveData = async () => {
    const rangeId = getRangeId(quantOfDays, dayToStart);
    if (!rangeId) return;

    try {
      const rangeRef = doc(db, "impulse", rangeId);

      if (!(await getDoc(rangeRef)).exists()) {
        await setDoc(rangeRef, { created: new Date() });
      }

      for (let i = 0; i < quantOfDays; i++) {
        const date = formatDate(dayToStart, i);
        const dayRef = doc(rangeRef, "days", date);
        await setDoc(
          dayRef,
          {
            goal: Number(values[date]) || 0,
            fact: 0,
          },
          { merge: true },
        );
      }

      setSnackbarOpen(true);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  useEffect(() => {
    if (quantOfDays > 0) loadData();
    // eslint-disable-next-line
  }, [quantOfDays, dayToStart]);

  return {
    values,
    facts,
    summary,
    snackbarOpen,
    setSnackbarOpen,
    handleInputChange,
    saveData,
  };
};
