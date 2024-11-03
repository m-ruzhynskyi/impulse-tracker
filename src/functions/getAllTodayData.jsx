import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

function getAllTodayData(updateDataCallback) {
  const date = new Date();
  const today = `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getFullYear()}`;

  console.log(`Сегодняшняя дата: ${today}`);

  const userIds = ["111111", "268358"];
  const unsubscribes = [];

  userIds.forEach((userId) => {
    const todayDocRef = doc(db, userId, today);

    console.log(`Устанавливаем слушатель для пользователя: ${userId}`);

    const unsubscribe = onSnapshot(todayDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = { userId, ...docSnapshot.data() };
        console.log(`Получены обновленные данные для пользователя ${userId}:`, userData);

        if (typeof updateDataCallback === "function") {
          updateDataCallback(userData);
        }
      } else {
        console.log(`Документ данных для пользователя ${userId} за ${today} не найден.`);
      }
    });

    unsubscribes.push(unsubscribe);
  });

  return () => {
    unsubscribes.forEach((unsubscribe) => unsubscribe());
    console.log("Все слушатели отписаны");
  };
}

export default getAllTodayData;
