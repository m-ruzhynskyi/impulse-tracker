import "../styles/user/user.css";
import { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useDateRange } from "../hooks/useDateRange";
import { formatDate, getRangeId } from "../functions/dateUtils";
import ComplexStat from "../Components/ComplexStat";

export default function UserMain() {
  const userEmail = auth.currentUser?.email.split("@")[0];
  const date = new Date();
  const dateString = `${date.getDate().toString().padStart(2, "0")}-${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${date.getFullYear()}`;

  const [products, setProducts] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [totalSum, setTotalSum] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputModeEnabled, setInputModeEnabled] = useState(false);
  const [customPrices, setCustomPrices] = useState({});
  const [soldInputValues, setSoldInputValues] = useState({});

  const { quantOfDays, dayToStart, startDate, endDate } = useDateRange();
  const [factUpdated, setFactUpdated] = useState(false);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const docRef = doc(db, "info", "impulse", "data", "impulses");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        const productList = Object.entries(data)
          .map(([name, priceStr]) => {
            const price = parseInt(priceStr, 10);
            return { name, price };
          })
          .filter((product) => !isNaN(product.price));

        setProducts(productList);

        const initialProductState = {};
        productList.forEach((product) => {
          initialProductState[product.name] = 0;
        });

        setError(null);
        setIsLoading(false);
        return initialProductState;
      } else {
        console.warn("Документ не найден в Firebase.");
        setError("Данные товаров не найдены. Проверьте путь в Firebase.");
        setProducts([]);
        setIsLoading(false);
        return {};
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setError("Ошибка загрузки товаров из Firebase");
      setProducts([]);
      setIsLoading(false);
      return {};
    }
  };

  const loadUserData = async (initialProductState) => {
    if (userEmail) {
      try {
        const docRef = doc(db, userEmail, dateString);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setProductCounts(userData.productCounts || {});
          setTotalSum(userData.totalSum || 0);
          if (userData.customPrices) {
            setCustomPrices(userData.customPrices);
          }
        } else {
          const newUserData = {
            productCounts: initialProductState,
            totalSum: 0,
            customPrices: {},
          };
          await setDoc(docRef, newUserData);
          setProductCounts(initialProductState);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Ошибка загрузки данных пользователя");
        setProductCounts(initialProductState);
      }
    }
  };

  const loadSettings = async () => {
    try {
      const settingsDocRef = doc(db, "info/impulse/data", "settings");
      const settingsDoc = await getDoc(settingsDocRef);

      if (settingsDoc.exists()) {
        const settings = settingsDoc.data();
        setInputModeEnabled(settings.inputModeEnabled || false);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const initialProductState = await loadProducts();
      await loadUserData(initialProductState);
      await loadSettings();
    };

    initializeData();
    // eslint-disable-next-line
  }, []);

  const handleCustomPriceChange = (productName, value) => {
    const price = value === '' ? '' : parseInt(value, 10);
    const updatedPrices = {
      ...customPrices,
      [productName]: price
    };

    // Update state with the new prices
    setCustomPrices(updatedPrices);

    // Create a temporary function to calculate sum with the updated prices
    const calculateTempSum = () => {
      return products.reduce((sum, product) => {
        const count = productCounts[product.name] || 0;
        const productPrice = product.name === productName 
          ? (isNaN(price) ? 0 : price) 
          : (updatedPrices[product.name] !== undefined 
              ? (isNaN(updatedPrices[product.name]) ? 0 : updatedPrices[product.name]) 
              : product.price);
        return sum + count * productPrice;
      }, 0);
    };

    // Recalculate total sum with the new price
    const newSum = calculateTempSum();
    setTotalSum(newSum);

    // Update Firestore with the new prices and sum
    updateFirestore(productCounts, newSum);
  };

  const handleSoldInputChange = (productName, value) => {
    const soldValue = value === '' ? '' : parseInt(value, 10);
    setSoldInputValues({
      ...soldInputValues,
      [productName]: soldValue
    });
  };

  const handleAddSold = (productName) => {
    const soldValue = soldInputValues[productName] || 0;
    if (soldValue <= 0) return;

    setProductCounts((prevCounts) => {
      const currentCount = prevCounts[productName] || 0;
      const product = products.find((p) => p.name === productName);

      if (!product) return prevCounts;

      const newCount = currentCount + soldValue;
      const countChange = soldValue;

      if (countChange !== 0) {
        const price = inputModeEnabled && customPrices[productName] !== undefined 
          ? (isNaN(customPrices[productName]) ? 0 : customPrices[productName]) 
          : product.price;
        updateFactInFirebase(countChange * price);
      }

      const updatedCounts = {
        ...prevCounts,
        [productName]: newCount,
      };

      const newSum = calculateSum(updatedCounts);
      setTotalSum(newSum);

      updateFirestore(updatedCounts, newSum);

      // Reset the input field after adding
      setSoldInputValues({
        ...soldInputValues,
        [productName]: ''
      });

      return updatedCounts;
    });
  };

  const calculateSum = (productCountsObj) => {
    return products.reduce((sum, product) => {
      const count = productCountsObj[product.name] || 0;
      const price = inputModeEnabled && customPrices[product.name] !== undefined 
        ? customPrices[product.name] 
        : product.price;
      return sum + count * (isNaN(price) ? 0 : price);
    }, 0);
  };

  const updateFactInFirebase = async (change) => {
    if (!dayToStart || quantOfDays <= 0) return;

    try {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      if (currentDate < startDate || currentDate > endDate) {
        return;
      }

      const formattedDate = formatDate(
        dayToStart,
        Math.floor((currentDate - dayToStart) / 86400000),
      );
      const rangeId = getRangeId(quantOfDays, dayToStart);

      if (!rangeId) {
        console.error("Unable to determine range ID");
        return;
      }

      const factRef = doc(db, "impulse", rangeId, "days", formattedDate);
      const factDoc = await getDoc(factRef);

      let currentFact = 0;

      if (factDoc.exists()) {
        currentFact = factDoc.data().fact || 0;
      }

      const newFact = currentFact + change;

      await updateDoc(factRef, {
        fact: newFact,
      });

      setFactUpdated(true);
    } catch (error) {
      console.error("Error updating fact:", error);
    }
  };

  const updateFirestore = async (updatedCounts, newSum) => {
    if (userEmail) {
      try {
        const docRef = doc(db, userEmail, dateString);
        await updateDoc(docRef, {
          productCounts: updatedCounts,
          totalSum: newSum,
          customPrices: inputModeEnabled ? customPrices : {},
        });
      } catch (error) {
        console.error("Error updating data:", error);
        setError("Ошибка сохранения данных");
      }
    }
  };

  const handleOperation = (productName, isSold, allowNegative = false) => {
    setProductCounts((prevCounts) => {
      const currentCount = prevCounts[productName] || 0;
      const product = products.find((p) => p.name === productName);

      if (!product) return prevCounts;

      const newCount = isSold
        ? currentCount + 1
        : allowNegative
          ? currentCount - 1
          : Math.max(0, currentCount - 1);

      const countChange = newCount - currentCount;

      if (countChange !== 0) {
        updateFactInFirebase(countChange * product.price);
      }

      const updatedCounts = {
        ...prevCounts,
        [productName]: newCount,
      };

      const newSum = calculateSum(updatedCounts);
      setTotalSum(newSum);

      updateFirestore(updatedCounts, newSum);

      return updatedCounts;
    });
  };

  useEffect(() => {
    if (factUpdated) {
      const timer = setTimeout(() => {
        setFactUpdated(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [factUpdated]);

  if (isLoading) {
    return <div className="user-main">Loading...</div>;
  }

  return (
    <section className="user-main">
      <h1 className="user-main__title">{dateString}</h1>
      {error && <p className="user-main__error">{error}</p>}
      {products.length === 0 && !isLoading ? (
        <p className="user-main__no-data">Нет доступных товаров в Firebase</p>
      ) : (
        <div className="user-main__table">
          <div className="user-main__row user-main__header">
            <p className="user-main__cell user-main__cell--title">Title</p>
            <p className="user-main__cell two-buttons">Sold</p>
            <p className="user-main__cell">Total</p>
          </div>

          {products.map((product) => (
            <div className="user-main__row" key={product.name}>
              <p className="user-main__cell user-main__cell--title">
                {product.name}
              </p>
              <div className="user-main__cell two-buttons">
                {!inputModeEnabled ? (
                  <>
                    <button
                      className="user-main__button"
                      onClick={() => handleOperation(product.name, false)}
                    >
                      -
                    </button>
                    <p className="user-main__count">
                      {productCounts[product.name] || 0}
                    </p>
                    <button
                      className="user-main__button"
                      onClick={() => handleOperation(product.name, true)}
                    >
                      +
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="number"
                      className="user-main__sold-input"
                      value={soldInputValues[product.name] || ''}
                      onChange={(e) => handleSoldInputChange(product.name, e.target.value)}
                    />
                    <button
                      className="user-main__button"
                      onClick={() => handleAddSold(product.name)}
                    >
                      +
                    </button>
                  </>
                )}
              </div>
              <div className="user-main__cell user-main__cell--sum">
                {(productCounts[product.name] || 0) * 
                  (inputModeEnabled && customPrices[product.name] !== undefined 
                    ? (isNaN(customPrices[product.name]) ? 0 : customPrices[product.name]) 
                    : product.price)
                }₴
              </div>
            </div>
          ))}

          <p className="user-totalSum" colSpan="3">
            Sum: {totalSum}₴
          </p>
        </div>
      )}
      <ComplexStat/>
    </section>
  );
}
