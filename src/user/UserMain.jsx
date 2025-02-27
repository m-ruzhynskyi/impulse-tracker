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

  const [products, setProducts] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [totalSum, setTotalSum] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const docRef = doc(db, "info", "impulse", "data", "impulses");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Получены данные из Firebase:", data);

        const productList = Object.entries(data)
          .map(([name, priceStr]) => {
            const price = parseInt(priceStr, 10);
            return { name, price };
          })
          .filter((product) => !isNaN(product.price));

        console.log("Распарсенные товары:", productList);

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
        } else {
          const newUserData = {
            productCounts: initialProductState,
            totalSum: 0,
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

  useEffect(() => {
    const initializeData = async () => {
      const initialProductState = await loadProducts();
      await loadUserData(initialProductState);
    };

    initializeData();
    // eslint-disable-next-line
  }, []);

  const calculateSum = (productCountsObj) => {
    return products.reduce((sum, product) => {
      const count = productCountsObj[product.name] || 0;
      return sum + count * product.price;
    }, 0);
  };

  const updateFirestore = async (updatedCounts, newSum) => {
    if (userEmail) {
      try {
        const docRef = doc(db, userEmail, dateString);
        await updateDoc(docRef, {
          productCounts: updatedCounts,
          totalSum: newSum,
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

      const newCount = isSold
        ? currentCount + 1
        : allowNegative
          ? currentCount - 1
          : Math.max(0, currentCount - 1);

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
                <button
                  className="user-main__button"
                  onClick={() => handleOperation(product.name, true)}
                >
                  +
                </button>
                <p className="user-main__count">
                  {productCounts[product.name] || 0}
                </p>
                <button
                  className="user-main__button"
                  onClick={() => handleOperation(product.name, false)}
                >
                  -
                </button>
              </div>
              <p className="user-main__cell">
                {(productCounts[product.name] || 0) * product.price}₴
              </p>
            </div>
          ))}

          <p className="user-totalSum" colSpan="3">
            Sum: {totalSum}₴
          </p>
        </div>
      )}
    </section>
  );
}
