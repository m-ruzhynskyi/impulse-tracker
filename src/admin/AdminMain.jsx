import { useState, useEffect } from "react";
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

const UsersList = () => {
  const [todayData, setTodayData] = useState({
    deltev: 0,
    cris: 0,
    malte: 0,
    mnSold: 0,
    mnNot: 0,
    kpSold: 0,
    kpNot: 0,
    totalSum: 0,
  });
  const [workers, setWorkers] = useState([]); // Список сотрудников
  const [userIds, setUserIds] = useState([]);
  const [userDataMap, setUserDataMap] = useState({}); // Состояние для хранения данных каждого пользователя

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const workersCollection = collection(db, "info", "workers", "data");
        const workerDocs = await getDocs(workersCollection);

        const loadedWorkers = workerDocs.docs.map((doc) => {
          const data = doc.data();
          return {
            id: Object.values(data) || "", // Проверка на случай отсутствия id
            name: Object.keys(data) || "", // Проверка на случай отсутствия имени
          };
        });

        setWorkers(loadedWorkers);
        setUserIds(loadedWorkers[0].id);
        console.log("Сотрудники загружены:", loadedWorkers);
      } catch (error) {
        console.error("Ошибка при загрузке данных сотрудников:", error);
      }
    };

    fetchWorkers();
  }, []);

  useEffect(() => {
    if (userIds.length === 0) return;

    const date = new Date();
    const today = `${date.getDate().toString().padStart(2, "0")}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${date.getFullYear()}`;

    const unsubscribes = [];

    userIds.forEach((userId) => {
      const todayDocRef = doc(db, userId, today);

      const unsubscribe = onSnapshot(todayDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = { userId, ...docSnapshot.data() };

          setUserDataMap((prevMap) => ({
            ...prevMap,
            [userId]: {
              deltev: userData.deltev || 0,
              cris: userData.cris || 0,
              malte: userData.malte || 0,
              mnSold: userData.mnSold || 0,
              mnNot: userData.mnNot || 0,
              kpSold: userData.kpSold || 0,
              kpNot: userData.kpNot || 0,
              totalSum: userData.totalSum || 0,
            },
          }));

          const newTotalData = Object.values(userDataMap).reduce(
            (acc, data) => {
              acc.deltev += data.deltev;
              acc.cris += data.cris;
              acc.malte += data.malte;
              acc.mnSold += data.mnSold;
              acc.mnNot += data.mnNot;
              acc.kpSold += data.kpSold;
              acc.kpNot += data.kpNot;
              acc.totalSum += data.totalSum;
              return acc;
            },
            {
              deltev: 0,
              cris: 0,
              malte: 0,
              mnSold: 0,
              mnNot: 0,
              kpSold: 0,
              kpNot: 0,
              totalSum: 0,
            }
          );

          setTodayData(newTotalData);
        } else {
          console.log(
            `Документ данных для пользователя ${userId} за ${today} не найден.`
          );
        }
      });

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
    
  }, [userIds, userDataMap]);

  return (
    <div>
      <h2>Суммарные данные за сегодня</h2>
      <p>Deltev: {todayData.deltev}</p>
      <p>Cris: {todayData.cris}</p>
      <p>Malte: {todayData.malte}</p>
      <p>mnSold: {todayData.mnSold}</p>
      <p>mnNot: {todayData.mnNot}</p>
      <p>kpSold: {todayData.kpSold}</p>
      <p>kpNot: {todayData.kpNot}</p>
      <p>Total Sum: {todayData.totalSum}₴</p>

      <h2>Данные по каждому пользователю</h2>
      {Object.entries(userDataMap).map(([userId, data]) => (
        <div key={userId}>
          <h3>Пользователь {userId}</h3>
          <p>Deltev: {data.deltev}</p>
          <p>Cris: {data.cris}</p>
          <p>Malte: {data.malte}</p>
          <p>mnSold: {data.mnSold}</p>
          <p>mnNot: {data.mnNot}</p>
          <p>kpSold: {data.kpSold}</p>
          <p>kpNot: {data.kpNot}</p>
          <p>Total Sum: {data.totalSum}₴</p>
        </div>
      ))}
    </div>
  );
};

export default UsersList;
