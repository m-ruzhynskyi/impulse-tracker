import { useState, useEffect } from "react";
import { doc, collection, getDocs, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import "../styles/user/statistic.css";

const Statistic = () => {
  const [todayData, setTodayData] = useState({
    aage: 0,
    sigfrid: 0,
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

    const fetchUserData = async () => {
      let newUserDataMap = {};
      let newTotalData = { aage: 0, sigfrid: 0, totalSum: 0 };

      for (const userId of userIds) {
        const todayDocRef = doc(db, userId, today);
        const docSnapshot = await getDoc(todayDocRef);

        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          newUserDataMap[userId] = {
            aage: userData.aage || 0,
            sigfrid: userData.sigfrid || 0,
            totalSum: userData.totalSum || 0,
          };

          newTotalData.aage += userData.aage || 0;
          newTotalData.sigfrid += userData.sigfrid || 0;
          newTotalData.totalSum += userData.totalSum || 0;
        } else {
          console.log(`Документ данных для пользователя ${userId} за ${today} не найден.`);
        }
      }

      setUserDataMap(newUserDataMap);
      setTodayData(newTotalData);
    };

    fetchUserData();
  }, [userIds]);

  return (
    <section className="admin-table">
      <div className="admin-table__today-summary">
        <h2 className="admin-table__header">Сумарні дані за сьогодні</h2>
        <div className="admin-table__row admin-table__row--header">
          <p className="admin-table__cell admin-table__cell--header">Aage</p>
          <p className="admin-table__cell admin-table__cell--header">Sigfrid</p>
          <p className="admin-table__cell admin-table__cell--header">Сума</p>
        </div>
        <div className="admin-table__row">
          <p className="admin-table__cell">{todayData.aage}</p>
          <p className="admin-table__cell">{todayData.sigfrid}</p>
          <p className="admin-table__cell">{todayData.totalSum}</p>
        </div>
      </div>

      <h2 className="admin-table__header">Дані по кожному користувачу</h2>
      {Object.entries(userDataMap).map(([userId, data]) => (
        <div key={userId} className="admin-table__user-wrapper">
          <h3 className="admin-table__user-header">
            {workers[0]?.name[workers[0]?.id.indexOf(userId)]} :
          </h3>
          <div className="admin-table__user-data">
            <div className="admin-main__row admin-main__header">
              <p className="admin-main__cell admin-main__cell--title">Title</p>
              <p className="admin-main__cell">Sold</p>
              <p className="admin-main__cell">Total</p>
            </div>
            <div className="admin-main__row">
              <p className="admin-main__cell admin-main__cell--title">Aage</p>
              <p className="admin-main__cell">{data.aage}</p>
              <p className="admin-main__cell">{data.aage * 125}</p>
            </div>
            <div className="admin-main__row">
              <p className="admin-main__cell admin-main__cell--title">Sigfrid</p>
              <p className="admin-main__cell">{data.sigfrid}</p>
              <p className="admin-main__cell">{data.sigfrid * 300}</p>
            </div>
            <p className={'admin-main__sum-data'}>Сума: {data.sigfrid * 300 + data.aage * 125}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Statistic;
