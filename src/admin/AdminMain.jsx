import { useState, useEffect } from "react";
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import "../styles/admin/styles.css";

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
  const [workers, setWorkers] = useState([]);
  const [userIds, setUserIds] = useState([]);
  const [userDataMap, setUserDataMap] = useState({});

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
    <div className="admin-table">
      <div className="admin-table__today-summary">
        <h2 className="admin-table__header">Сумарні дані за сьогодні</h2>
        <div className="admin-table__row admin-table__row--header">
          <p className="admin-table__cell admin-table__cell--header">Deltev</p>
          <p className="admin-table__cell admin-table__cell--header">Cris</p>
          <p className="admin-table__cell admin-table__cell--header">Molte</p>
          <p className="admin-table__cell admin-table__cell--header">Сума</p>
          <p className="admin-table__cell admin-table__cell--header">МН</p>
          <p className="admin-table__cell admin-table__cell--header">КП</p>
        </div>
        <div className="admin-table__row">
          <p className="admin-table__cell">{todayData.deltev}</p>
          <p className="admin-table__cell">{todayData.cris}</p>
          <p className="admin-table__cell">{todayData.malte}</p>
          <p className="admin-table__cell">{todayData.totalSum}</p>
          <p className="admin-table__cell">
            {(
              todayData.mnSold /
              (Math.abs(todayData.mnNot) + todayData.mnSold)
            ).toFixed(2) || 0}
          </p>
          <p className="admin-table__cell">
            {(
              todayData.kpSold /
              (Math.abs(todayData.kpNot) + todayData.kpSold)
            ).toFixed(2) || 0}
          </p>
        </div>
      </div>

      <h2 className="admin-table__header">Дані по кожному користувачу</h2>
      {Object.entries(userDataMap).map(([userId, data]) => (
        <div key={userId} className="admin-table__user-wrapper">
          <h3 className="admin-table__user-header">
            {workers[0]["name"][workers[0]["id"].indexOf(userId)]} :
          </h3>
          <div className="admin-table__user-data">
            <div className="admin-main__row admin-main__header">
              <p className="admin-main__cell admin-main__cell--title">Title</p>
              <p className="admin-main__cell">Sold</p>
              <p className="admin-main__cell">NOT</p>
              <p className="admin-main__cell">Total</p>
            </div>
            <div className="admin-main__row">
              <p className="admin-main__cell admin-main__cell--title">Deltev</p>
              <p className="admin-main__cell">{data.deltev}</p>
              <p className="admin-main__cell">-</p>
              <p className="admin-main__cell">{data.deltev * 70}</p>
            </div>
            <div className="admin-main__row">
              <p className="admin-main__cell admin-main__cell--title">Cris</p>
              <p className="admin-main__cell">{data.cris}</p>
              <p className="admin-main__cell">-</p>
              <p className="admin-main__cell">{data.cris * 125}</p>
            </div>
            <div className="admin-main__row">
              <p className="admin-main__cell admin-main__cell--title">Molte</p>
              <p className="admin-main__cell">{data.malte}</p>
              <p className="admin-main__cell">-</p>
              <p className="admin-main__cell">{data.malte * 85}</p>
            </div>
            <div className="admin-main__row">
              <p className="admin-main__cell admin-main__cell--title">MН + </p>
              <p className="admin-main__cell">{data.mnSold}</p>
              <p className="admin-main__cell">{data.mnNot}</p>
              <p className="admin-main__cell">-</p>
            </div>
            <div className="admin-main__row">
              <p className="admin-main__cell admin-main__cell--title">КП </p>
              <p className="admin-main__cell">{data.kpSold}</p>
              <p className="admin-main__cell">{data.kpNot}</p>
              <p className="admin-main__cell">-</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsersList;
