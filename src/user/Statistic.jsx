import { useState, useEffect } from "react";
import { doc, collection, getDocs, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import "../styles/user/statistic.css";

const Statistic = () => {
  const [todayData, setTodayData] = useState({
    totalSum: 0,
  });
  const [workers, setWorkers] = useState([]);
  const [userIds, setUserIds] = useState([]);
  const [userDataMap, setUserDataMap] = useState({});
  const [products, setProducts] = useState({});

  // Загрузка списка товаров и цен
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsDocRef = doc(db, "info", "impulse", "data", "impulses");
        const docSnapshot = await getDoc(productsDocRef);

        if (docSnapshot.exists()) {
          const productData = docSnapshot.data();
          const formattedProducts = {};

          // Преобразование формата "Bornholm"375" в объект {name: "Bornholm", price: 375}
          Object.entries(productData).forEach(([key, value]) => {
            const productName = key;
            const productPrice = parseInt(value);
            formattedProducts[productName] = productPrice;
          });

          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных товаров:", error);
      }
    };

    fetchProducts();
  }, []);

  // Загрузка списка работников
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const workersCollection = collection(db, "info", "workers", "data");
        const workerDocs = await getDocs(workersCollection);

        const loadedWorkers = workerDocs.docs.map((doc) => {
          const data = doc.data();
          return {
            id: Object.values(data) || "",
            name: Object.keys(data) || "",
          };
        });

        setWorkers(loadedWorkers);
        setUserIds(loadedWorkers[0].id);
      } catch (error) {
        console.error("Ошибка при загрузке данных сотрудников:", error);
      }
    };

    fetchWorkers();
  }, []);

  // Загрузка данных пользователей
  useEffect(() => {
    if (userIds.length === 0 || Object.keys(products).length === 0) return;

    const date = new Date();
    const today = `${date.getDate().toString().padStart(2, "0")}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${date.getFullYear()}`;

    const fetchUserData = async () => {
      let newUserDataMap = {};
      let newTotalData = { totalSum: 0 };

      // Инициализируем счетчики для каждого продукта
      Object.keys(products).forEach((productName) => {
        newTotalData[productName] = 0;
      });

      for (const userId of userIds) {
        const todayDocRef = doc(db, userId, today);
        const docSnapshot = await getDoc(todayDocRef);

        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          const productCounts = userData.productCounts || {};

          let userTotalSum = userData.totalSum || 0;
          let calculatedUserData = {
            totalSum: userTotalSum,
          };

          // Обрабатываем все продукты для пользователя
          Object.keys(products).forEach((productName) => {
            const count = productCounts[productName] || 0;
            calculatedUserData[productName] = count;

            // Добавляем к общей сумме
            newTotalData[productName] += count;
          });

          newUserDataMap[userId] = calculatedUserData;
          newTotalData.totalSum += userTotalSum;
        }
      }

      setUserDataMap(newUserDataMap);
      setTodayData(newTotalData);
    };

    fetchUserData();
  }, [userIds, products]);

  // Получение имени работника по ID
  const getWorkerName = (userId) => {
    for (const worker of workers) {
      const index = worker.id.indexOf(userId);
      if (index !== -1) {
        return worker.name[index];
      }
    }
    return "Неизвестный";
  };

  // Рассчет стоимости проданных товаров
  const calculateProductTotal = (productName, count) => {
    return (products[productName] || 0) * count;
  };

  return (
    <section className="admin-table">
      <div className="admin-table__today-summary">
        <h2 className="admin-table__header">Сумарні дані за сьогодні</h2>
        <div className="admin-table__row admin-table__row--header">
          {Object.keys(products).map((productName) => (
            <p
              key={productName}
              className="admin-table__cell admin-table__cell--header"
            >
              {productName}
            </p>
          ))}
          <p className="admin-table__cell admin-table__cell--header">Сума</p>
        </div>
        <div className="admin-table__row">
          {Object.keys(products).map((productName) => (
            <p key={productName} className="admin-table__cell">
              {todayData[productName] || 0}
            </p>
          ))}
          <p className="admin-table__cell">{todayData.totalSum}</p>
        </div>
      </div>

      <h2 className="admin-table__header">Дані по кожному користувачу</h2>
      {Object.entries(userDataMap).map(([userId, data]) => (
        <div key={userId} className="admin-table__user-wrapper">
          <h3 className="admin-table__user-header">
            {getWorkerName(userId)} :
          </h3>
          <div className="admin-table__user-data">
            <div className="admin-main__row admin-main__header">
              <p className="admin-main__cell admin-main__cell--title">Товар</p>
              <p className="admin-main__cell">Продано</p>
              <p className="admin-main__cell">Сума</p>
            </div>
            {Object.keys(products).map((productName) => (
              <div key={productName} className="admin-main__row">
                <p className="admin-main__cell admin-main__cell--title">
                  {productName}
                </p>
                <p className="admin-main__cell">{data[productName] || 0}</p>
                <p className="admin-main__cell">
                  {calculateProductTotal(productName, data[productName] || 0)}
                </p>
              </div>
            ))}
            <p className={"admin-main__sum-data"}>Сума: {data.totalSum}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Statistic;
