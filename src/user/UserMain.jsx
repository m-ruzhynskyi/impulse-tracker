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
    deltev: 0,
    cris: 0,
    malte: 0,
    mnSold: 0,
    mnNot: 0,
    kpSold: 0,
    kpNot: 0,
    totalSum: 0, // New field to store the sum
  };

  const [state, setState] = useState(initialState);

  // Function to calculate the total sum
  const calculateSum = (updatedState) => {
    return (
      updatedState.cris * 125 +
      updatedState.deltev * 70 +
      updatedState.malte * 85
    );
  };

  // Function to load data from Firestore if it exists
  const loadData = async () => {
    if (userEmail) {
      const docRef = doc(db, userEmail, dateString);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setState(docSnap.data());
      } else {
        // Initialize Firestore with default values if no document exists
        await setDoc(docRef, initialState);
      }
    }
  };

  // Function to update a single field in Firestore
  const updateFirestore = async (field, value) => {
    if (userEmail) {
      const docRef = doc(db, userEmail, dateString);
      await updateDoc(docRef, { [field]: value });
    }
  };

  // Function to update the total sum in Firestore
  const updateTotalSum = async (newSum) => {
    if (userEmail) {
      const docRef = doc(db, userEmail, dateString);
      await updateDoc(docRef, { totalSum: newSum });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Unified operation function that updates both local state and Firestore
  const handleOperation = (field, isSold, allowNegative = false) => {
    setState((prevState) => {
      const newValue = isSold
        ? prevState[field] + 1
        : allowNegative
        ? prevState[field] - 1
        : Math.max(0, prevState[field] - 1);

      const updatedState = { ...prevState, [field]: newValue };

      // Update Firestore for the specific field
      updateFirestore(field, newValue);

      // If the field affects the total sum, recalculate and update
      if (["cris", "deltev", "malte"].includes(field)) {
        const newSum = calculateSum(updatedState);
        updateTotalSum(newSum); // Update total sum in Firestore
        updatedState.totalSum = newSum; // Update total sum locally
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
          <p className="user-main__cell">NOT</p>
          <p className="user-main__cell">Total</p>
        </div>

        <div className="user-main__row">
          <p className="user-main__cell user-main__cell--title">Deltev</p>
          <div className="user-main__cell two-buttons">
            <button
              className="user-main__button"
              onClick={() => handleOperation("deltev", true)}
            >
              +
            </button>
            <p className="user-main__count">{state.deltev}</p>
            <button
              className="user-main__button"
              onClick={() => handleOperation("deltev", false)}
            >
              -
            </button>
          </div>
          <p className="user-main__cell">-</p>
          <p className="user-main__cell">{state.deltev * 70}₴</p>
        </div>

        <div className="user-main__row">
          <p className="user-main__cell user-main__cell--title">Cris</p>
          <div className="user-main__cell two-buttons">
            <button
              className="user-main__button"
              onClick={() => handleOperation("cris", true)}
            >
              +
            </button>
            <p className="user-main__count">{state.cris}</p>
            <button
              className="user-main__button"
              onClick={() => handleOperation("cris", false)}
            >
              -
            </button>
          </div>
          <p className="user-main__cell">-</p>
          <p className="user-main__cell">{state.cris * 125}₴</p>
        </div>

        <div className="user-main__row">
          <p className="user-main__cell user-main__cell--title">Malte</p>
          <div className="user-main__cell two-buttons">
            <button
              className="user-main__button"
              onClick={() => handleOperation("malte", true)}
            >
              +
            </button>
            <p className="user-main__count">{state.malte}</p>
            <button
              className="user-main__button"
              onClick={() => handleOperation("malte", false)}
            >
              -
            </button>
          </div>
          <p className="user-main__cell">-</p>
          <p className="user-main__cell">{state.malte * 85}₴</p>
        </div>

        <div className="user-main__row">
          <p className="user-main__cell user-main__cell--title">КП</p>
          <div className="user-main__cell two-buttons-one">
            <button
              className="user-main__button"
              onClick={() => handleOperation("kpSold", true)}
            >
              +
            </button>
            <p className="user-main__count">{state.kpSold}</p>
          </div>
          <div className="user-main__cell one-button">
            <p className="user-main__count">{state.kpNot}</p>
            <button
              className="user-main__button"
              onClick={() => handleOperation("kpNot", false, true)}
            >
              -
            </button>
          </div>
          <p className="user-main__cell">
            {state.kpSold + Math.abs(state.kpNot)}
          </p>
        </div>

        <div className="user-main__row">
          <p className="user-main__cell user-main__cell--title">МН</p>
          <div className="user-main__cell two-buttons-one">
            <button
              className="user-main__button"
              onClick={() => handleOperation("mnSold", true)}
            >
              +
            </button>
            <p className="user-main__count">{state.mnSold}</p>
          </div>
          <div className="user-main__cell one-button">
            <p className="user-main__count">{state.mnNot}</p>
            <button
              className="user-main__button"
              onClick={() => handleOperation("mnNot", false, true)}
            >
              -
            </button>
          </div>
          <p className="user-main__cell">
            {state.mnSold + Math.abs(state.mnNot)}
          </p>
        </div>

        <p className="user-totalSum" colSpan="3">
          Sum: {state.totalSum}₴
        </p>
      </div>
    </section>
  );
}
