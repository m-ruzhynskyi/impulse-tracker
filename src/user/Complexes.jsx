import React, { useEffect, useState } from 'react';
import { db } from "../firebase/config";
import { doc, getDoc } from 'firebase/firestore';
import '../styles/user/complexes.css';

const Complexes = () => {
  const [todayData, setTodayData] = useState({});
  const [weekData, setWeekData] = useState({});
  const [workers, setWorkers] = useState({});
  const [selectedComplex, setSelectedComplex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weeklyComplexData, setWeeklyComplexData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateShort = (dateStr) => {
    const [day, month] = dateStr.split('-');
    return `${day}.${month}`;
  };

  const getLastWeekDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      dates.push(`${day}-${month}-${year}`);
    }

    return dates;
  };

  const getWeekDateRange = () => {
    const now = new Date();
    const currentDay = now.getDay();

    const monday = new Date(now);
    monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}.${month}`;
    };

    return `${formatDate(monday)} - ${formatDate(sunday)}`;
  };

  const getWorkerNameById = (id) => {
    for (const [name, workerId] of Object.entries(workers)) {
      if (workerId === id) {
        return name;
      }
    }
    return id;
  };

  const loadWorkers = async () => {
    try {
      const workersDoc = await getDoc(doc(db, 'info', 'workers', 'data', 'workers'));
      if (workersDoc.exists()) {
        setWorkers(workersDoc.data());
      }
    } catch (error) {
      console.error('Помилка при завантаженні даних про працівників:', error);
    }
  };

  const loadTodayData = async () => {
    const today = getCurrentDate();
    const workersData = {};

    // Перебираємо всіх працівників
    for (const workerId of Object.values(workers)) {
      try {
        const complexDoc = await getDoc(doc(db, 'complexes', workerId, 'data', today));

        if (complexDoc.exists()) {
          workersData[workerId] = complexDoc.data();
        }
      } catch (error) {
        console.error(`Помилка при завантаженні даних працівника ${workerId}:`, error);
      }
    }

    setTodayData(workersData);
  };

  const loadWeekData = async () => {
    const weekDates = getLastWeekDates();
    const weeklyData = {};

    for (const workerId of Object.values(workers)) {
      try {
        const workerWeeklyData = {};

        for (const date of weekDates) {
          const complexDoc = await getDoc(doc(db, 'complexes', workerId, 'data', date));

          if (complexDoc.exists()) {
            workerWeeklyData[date] = complexDoc.data();
          }
        }

        weeklyData[workerId] = workerWeeklyData;
      } catch (error) {
        console.error(`Помилка при завантаженні даних за тиждень для працівника ${workerId}:`, error);
      }
    }

    setWeekData(weeklyData);
  };

  const calculateWeekStats = () => {
    const stats = {
      'КП': { sold: 0, not: 0 },
      'МН': { sold: 0, not: 0 },
      'СП': { sold: 0, not: 0 }
    };

    Object.values(weekData).forEach(workerData => {
      Object.values(workerData).forEach(dayData => {
        if (dayData['КП']) {
          stats['КП'].sold += (dayData['КП'].sold || 0);
          stats['КП'].not += (dayData['КП'].not || 0);
        }
        if (dayData['МН']) {
          stats['МН'].sold += (dayData['МН'].sold || 0);
          stats['МН'].not += (dayData['МН'].not || 0);
        }
        if (dayData['СП']) {
          stats['СП'].sold += (dayData['СП'].sold || 0);
          stats['СП'].not += (dayData['СП'].not || 0);
        }
      });
    });

    return stats;
  };

  const getWeeklyDataForComplex = (complexType) => {
    const complexData = {};
    const weekDates = getLastWeekDates();

    weekDates.forEach(date => {
      complexData[date] = { sold: 0, not: 0, workers: [] };

      Object.entries(weekData).forEach(([workerId, workerData]) => {
        if (workerData[date] && workerData[date][complexType]) {
          const workerName = getWorkerNameById(workerId);
          const sold = workerData[date][complexType].sold || 0;
          const not = workerData[date][complexType].not || 0;

          if (sold > 0 || not > 0) {
            complexData[date].sold += sold;
            complexData[date].not += not;
            complexData[date].workers.push({
              name: workerName,
              sold,
              not
            });
          }
        }
      });
    });

    return complexData;
  };

  const handleComplexClick = (complexType) => {
    const weeklyData = getWeeklyDataForComplex(complexType);
    setWeeklyComplexData(weeklyData);
    setSelectedComplex(complexType);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedComplex(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadWorkers();
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSalesData = async () => {
      if (Object.keys(workers).length > 0) {
        await loadTodayData();
        await loadWeekData();
        setIsLoading(false);
      }
    };
    fetchSalesData();
  }, [workers]);

  const prepareUserData = () => {
    const userData = {};

    Object.entries(todayData).forEach(([workerId, complexData]) => {
      const workerName = getWorkerNameById(workerId);

      if (!userData[workerName]) {
        userData[workerName] = {};
      }

      ['КП', 'МН', 'СП'].forEach(complexType => {
        if (complexData[complexType]) {
          userData[workerName][complexType] = {
            sold: complexData[complexType].sold || 0,
            not: complexData[complexType].not || 0
          };
        }
      });
    });

    return userData;
  };

  const filterUsersWithPositiveIndicators = (userData) => {
    return Object.fromEntries(
      Object.entries(userData).filter(([userName, complexes]) => {
        return Object.values(complexes).some(complex => complex.sold > 0 || complex.not > 0);
      })
    );
  };

  const weekStats = calculateWeekStats();
  const userData = prepareUserData();
  const filteredUserData = filterUsersWithPositiveIndicators(userData);

  if (isLoading) {
    return (
      <div className="loader-container">
        <div className="loader">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="complexes-container">
      <div className="section-container">
        <h1>Комплекс</h1>
        <h2 className="date-range">Тиждень: {getWeekDateRange()}</h2>

        <div className="complex-stats-container">
          {['КП', 'МН', 'СП'].map(complexType => (
            <div
              key={complexType}
              className="complex-stats"
              onClick={() => handleComplexClick(complexType)}
            >
              <h2>{complexType}</h2>
              <div>
                <span>Продано: {weekStats[complexType].sold}</span>
                <span>Не продано: {weekStats[complexType].not}</span>
                <span>Показник: {(weekStats[complexType].sold / (weekStats[complexType].sold + weekStats[complexType].not) * 100 || 0).toFixed(2)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-container">
        <h2>Дані по кожному користувачу</h2>

        {Object.entries(filteredUserData).map(([userName, userComplexes]) => (
          <div key={userName} className="user-data">
            <h3>{userName}:</h3>
            <table>
              <thead>
                <tr>
                  <th>Комплекс</th>
                  <th>Продано</th>
                  <th>Ні</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(userComplexes).map(([complexType, data]) => (
                  <tr key={complexType}>
                    <td>{complexType}</td>
                    <td>{data.sold}</td>
                    <td>{data.not}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {isModalOpen && selectedComplex && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Дані по комплексу {selectedComplex} за тиждень</h2>
              <button className="close-modal" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <table>
                <thead>
                  <tr>
                    <th className={'modal-body-th'}>Дата</th>
                    <th className={'modal-body-th'}>Продано</th>
                    <th className={'modal-body-th'}>Не продано</th>
                    <th className={'modal-body-th'}>Показник</th>
                    <th className={'modal-body-th'}>Деталі</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(weeklyComplexData).map(([date, data]) => (
                    <tr key={date}>
                      <td className={'modal-body-td'}>{formatDateShort(date)}</td>
                      <td className={'modal-body-td'}>{data.sold}</td>
                      <td className={'modal-body-td'}>{data.not}</td>
                      <td className={'modal-body-td'}>{(data.sold / (data.sold + data.not) * 100 || 0).toFixed(2)}%</td>
                      <td className={'modal-body-td'}>
                        {data.workers.map((worker, index) => (
                          <div key={index} className="worker-details">
                            <strong>{worker.name}:</strong> Продано {worker.sold}, Не продано {worker.not}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complexes;
