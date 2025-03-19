import "../styles/user/complexStat.css";
import {useState, useEffect} from "react";
import {doc, getDoc, setDoc} from "firebase/firestore";
import {auth, db} from "../firebase/config";

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

  const todayDocRef = doc(db, "complexes", userId, "data", dateString);

  useEffect(() => {
    const initializeData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        // Reference to user's complexes for the current date
        const docSnap = await getDoc(todayDocRef);

        let data;
        if (docSnap.exists()) {
          // Load existing data from Firebase
          data = docSnap.data();
        } else {
          // Create initial data if it doesn’t exist
          data = {
            "КП": {sold: 0, not: 0},
            "МН": {sold: 0, not: 0},
            "СП": {sold: 0, not: 0},
          };
          await setDoc(todayDocRef, data);
        }

        // Calculate sums for display
        const complexesWithSums = {};
        Object.entries(data).forEach(([complex, values]) => {
          const total = values.sold + values.not;
          const sumPercentage = total > 0 ? Math.round((values.sold / total) * 100) : 0;
          complexesWithSums[complex] = {
            ...values,
            sum: `${sumPercentage}%`,
          };
        });

        setComplexes(complexesWithSums);
      } catch (error) {
        console.error("Error initializing data:", error);
      }
      setIsLoading(false);
    };

    initializeData();
  }, [userId, dateString]);

  // Handle incrementing/decrementing sold or not counts and update Firebase
  const handleOperation = async (complex, field, increment) => {
    if (!userId) return;

    // Update local data
    const newData = {...complexes};
    if (increment) {
      newData[complex][field] += 1;
    } else {
      newData[complex][field] = Math.max(0, newData[complex][field] - 1);
    }

    // Prepare data for Firebase (exclude sum)
    const dataForFirebase = {};
    Object.entries(newData).forEach(([comp, values]) => {
      dataForFirebase[comp] = {sold: values.sold, not: values.not};
    });

    try {
      // Update Firebase
      await setDoc(todayDocRef, dataForFirebase);

      // Calculate sums for display
      const updatedComplexes = {};
      Object.entries(dataForFirebase).forEach(([comp, values]) => {
        const total = values.sold + values.not;
        const sumPercentage = total > 0 ? Math.round((values.sold / total) * 100) : 0;
        updatedComplexes[comp] = {
          ...values,
          sum: `${sumPercentage}%`,
        };
      });

      // Update state
      setComplexes(updatedComplexes);
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  if (isLoading) {
    return <div className="user-main">Loading...</div>;
  }

  if (!userId) {
    return <div className="user-main">Please log in to view your complexes.</div>;
  }

  if (Object.keys(complexes).length === 0) {
    return <div className="user-main">No complex data available.</div>;
  }

  return (
    <section className="complex-stat">
      <div className="complex-stat__table">
        <div className="complex-stat__row">
          <p className="complex-stat__cell complex-stat__cell--title">Title</p>
          <p className="complex-stat__cell two-buttons">Sold</p>
          <p className="complex-stat__cell">NOT</p>
          <p className="complex-stat__cell">Total</p>
        </div>

        {Object.entries(complexes).map(([complex, data]) => (
          <div className="complex-stat__row" key={complex}>
            <p className="complex-stat__cell complex-stat__cell--title">{complex}</p>
            <div className="complex-stat__cell two-buttons-one">
              <button
                className="complex-stat__button"
                onClick={() => handleOperation(complex, "sold", false)}
              >
                -
              </button>
              <p className="complex-stat__count">{data.sold}</p>
              <button
                className="complex-stat__button"
                onClick={() => handleOperation(complex, "sold", true)}
              >
                +
              </button>
            </div>
            <div className="complex-stat__cell one-button">
              <button
                className="complex-stat__button"
                onClick={() => handleOperation(complex, "not", false)}
              >
                -
              </button>
              <p className="complex-stat__count">{data.not}</p>
              <button
                className="complex-stat__button"
                onClick={() => handleOperation(complex, "not", true)}
              >
                +
              </button>
            </div>
            <p className="complex-stat__cell">{data.sum}</p>
          </div>
        ))}
      </div>
    </section>
  );

}