import "../styles/user/test.css";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export default function ComplexStat() {
  // Format current date as DD-MM-YYYY
  const date = new Date();
  const dateString = `${date.getDate().toString().padStart(2, "0")}-${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${date.getFullYear()}`;

  // State for complex data
  const [complexes, setComplexes] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Get user ID from email
  const userId = auth.currentUser?.email?.split("@")[0];

  useEffect(() => {
    const initializeData = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        // First, check if today's data exists
        const todayDocRef = doc(db, userId, 'complexes', 'data', dateString);
        const todaySnapshot = await getDoc(todayDocRef);

        if (todaySnapshot.exists()) {
          // If data exists for today, use it
          setComplexes(todaySnapshot.data());
        } else {
          // If no data for today, fetch complex names and create initial data
          const complexesDocRef = doc(db, 'info', 'complexes');
          const complexesSnapshot = await getDoc(complexesDocRef);

          if (complexesSnapshot.exists()) {
            const complexData = complexesSnapshot.data();
            const complexNames = {
              [complexData.kp]: { sold: 0, not: 0, sum: "0%" },
              [complexData.mn]: { sold: 0, not: 0, sum: "0%" },
              [complexData.sp]: { sold: 0, not: 0, sum: "0%" }
            };

            // Save initial data to Firestore
            await setDoc(todayDocRef, complexNames);
            setComplexes(complexNames);
          }
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [userId, dateString]);

  // Calculate percentage and update Firestore
  const updateFirestore = async (newComplexes) => {
    if (!userId) return;

    // Calculate sum percentages for each complex
    const updatedComplexes = {};

    Object.entries(newComplexes).forEach(([complex, data]) => {
      const total = data.sold + data.not;
      const sumPercentage = total > 0 ? Math.round((data.sold / total) * 100) : 0;

      updatedComplexes[complex] = {
        sold: data.sold,
        not: data.not,
        sum: `${sumPercentage}%`
      };
    });

    // Update state and Firestore
    setComplexes(updatedComplexes);

    try {
      const complexDocRef = doc(db, userId, 'complexes', 'data', dateString);
      await setDoc(complexDocRef, updatedComplexes);
    } catch (error) {
      console.error("Error updating Firestore:", error);
    }
  };

  // Handle incrementing sold or not sold counts
  const handleOperation = (complex, field, increment) => {
    const newComplexes = { ...complexes };

    if (increment) {
      newComplexes[complex][field] += 1;
    } else {
      newComplexes[complex][field] = Math.max(0, newComplexes[complex][field] - 1);
    }

    updateFirestore(newComplexes);
  };

  if (isLoading) {
    return <div className="user-main">Loading...</div>;
  }

  return (
    <section className="user-main">
      <h1 className="user-main__title">{dateString}</h1>
      <div className="user-main__table">
        <div className="user-main__row user-main__header">
          <p className="user-main__cell user-main__cell--title">Title</p>
          <p className="user-main__cell two-buttons">Sold</p>
          <p className="user-main__cell">NOT</p>
          <p className="user-main__cell">Total</p>
        </div>

        {Object.entries(complexes).map(([complex, data]) => (
          <div className="user-main__row" key={complex}>
            <p className="user-main__cell user-main__cell--title">{complex}</p>
            <div className="user-main__cell two-buttons-one">
              <p className="user-main__count">{data.sold}</p>
              <button
                className="user-main__button"
                onClick={() => handleOperation(complex, "sold", true)}
              >
                +
              </button>
              <button
                className="user-main__button"
                onClick={() => handleOperation(complex, "sold", false)}
              >
                -
              </button>
            </div>
            <div className="user-main__cell one-button">
              <p className="user-main__count">{data.not}</p>
              <button
                className="user-main__button"
                onClick={() => handleOperation(complex, "not", true)}
              >
                +
              </button>
              <button
                className="user-main__button"
                onClick={() => handleOperation(complex, "not", false)}
              >
                -
              </button>
            </div>
            <p className="user-main__cell">
              {data.sum}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}