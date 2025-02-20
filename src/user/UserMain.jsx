import "../styles/user/user.css";
import { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export default function UserMain() {
  const userEmail = auth.currentUser?.email.split("@")[0];
  const date = new Date();
  const dateString = `${date.getDate().toString().padStart(2, "0")}-${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${date.getFullYear()}`;

  const initialState = {
    aage: 0,
    sigfrid: 0,
    totalSum: 0,
  };

  const [state, setState] = useState(initialState);

  const calculateSum = (updatedState) => {
    return (
      updatedState.aage * 125 +
      updatedState.sigfrid * 300
    );
  };

  const loadData = async () => {
    if (userEmail) {
      const docRef = doc(db, userEmail, dateString);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setState(docSnap.data());
      } else {
        await setDoc(docRef, initialState);
      }
    }
  };

  const updateFirestore = async (field, value) => {
    if (userEmail) {
      const docRef = doc(db, userEmail, dateString);
      await updateDoc(docRef, { [field]: value });
    }
  };

  const updateTotalSum = async (newSum) => {
    if (userEmail) {
      const docRef = doc(db, userEmail, dateString);
      await updateDoc(docRef, { totalSum: newSum });
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  const handleOperation = (field, isSold, allowNegative = false) => {
    setState((prevState) => {
      const newValue = isSold
        ? prevState[field] + 1
        : allowNegative
        ? prevState[field] - 1
        : Math.max(0, prevState[field] - 1);

      const updatedState = { ...prevState, [field]: newValue };

      updateFirestore(field, newValue);

      if (["aage", "sigfrid"].includes(field)) {
        const newSum = calculateSum(updatedState);
        updateTotalSum(newSum);
        updatedState.totalSum = newSum;
      }

      return updatedState;
    });
  };

  return (
    <section className="user-main">
      <h1 className="user-main__title">{dateString}</h1>
      <div className="user-main__table">
        <div className="user-main__row user-main__header">
          <p className="user-main__cell user-main__cell--title">Title</p>
          <p className="user-main__cell two-buttons">Sold</p>
          <p className="user-main__cell">Total</p>
        </div>

        <div className="user-main__row">
          <p className="user-main__cell user-main__cell--title">Aage</p>
          <div className="user-main__cell two-buttons">
            <button
              className="user-main__button"
              onClick={() => handleOperation("aage", true)}
            >
              +
            </button>
            <p className="user-main__count">{state.aage}</p>
            <button
              className="user-main__button"
              onClick={() => handleOperation("aage", false)}
            >
              -
            </button>
          </div>
          <p className="user-main__cell">{state.aage * 125}₴</p>
        </div>

        <div className="user-main__row">
          <p className="user-main__cell user-main__cell--title">Sigfrid</p>
          <div className="user-main__cell two-buttons">
            <button
              className="user-main__button"
              onClick={() => handleOperation("sigfrid", true)}
            >
              +
            </button>
            <p className="user-main__count">{state.sigfrid}</p>
            <button
              className="user-main__button"
              onClick={() => handleOperation("sigfrid", false)}
            >
              -
            </button>
          </div>
          <p className="user-main__cell">{state.sigfrid * 300}₴</p>
        </div>

        <p className="user-totalSum" colSpan="3">
          Sum: {state.totalSum}₴
        </p>
      </div>
    </section>
  );
}
