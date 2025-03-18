import "../styles/user/complexStat.css";
import {useState, useEffect} from "react";
import {doc, getDoc, setDoc} from "firebase/firestore";
import {auth, db} from "../firebase/config";

export default function ComplexStat() {
  const date = new Date();
  const dateString = `${date.getDate().toString().padStart(2, "0")}-${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${date.getFullYear()}`;

  const [complexes, setComplexes] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const userId = auth.currentUser?.email?.split("@")[0];

  useEffect(() => {
    const initializeData = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const todayDocRef = doc(db, userId, 'complexes', 'data', dateString);
        const todaySnapshot = await getDoc(todayDocRef);

        if (todaySnapshot.exists()) {
          setComplexes(todaySnapshot.data());
        } else {
          const complexesDocRef = doc(db, 'info', 'complexes');
          const complexesSnapshot = await getDoc(complexesDocRef);

          if (complexesSnapshot.exists()) {
            const complexData = complexesSnapshot.data();
            const complexNames = {
              [complexData.kp]: {sold: 0, not: 0, sum: "0%"},
              [complexData.mn]: {sold: 0, not: 0, sum: "0%"},
              [complexData.sp]: {sold: 0, not: 0, sum: "0%"}
            };

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

  const updateFirestore = async (newComplexes) => {
    if (!userId) return;

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

    setComplexes(updatedComplexes);

    try {
      const complexDocRef = doc(db, userId, 'complexes', 'data', dateString);
      await setDoc(complexDocRef, updatedComplexes);
    } catch (error) {
      console.error("Error updating Firestore:", error);
    }
  };

  const handleOperation = (complex, field, increment) => {
    const newComplexes = {...complexes};

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
  <section className="complex-stat">
    <div className="complex-stat__table">
      <div className="complex-stat__row complex-stat__header">
        <p className="complex-stat__cell complex-stat__cell--title">Title</p>
        <p className="complex-stat__cell two-buttons">Sold</p>
        <p className="complex-stat__cell">NOT</p>
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
        </div>
      ))}
    </div>
  </section>
);

}