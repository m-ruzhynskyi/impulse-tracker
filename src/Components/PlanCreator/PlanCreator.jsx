import React from "react";
import { useDateRange } from "../../hooks/useDateRange";
import { useFirebaseData } from "../../hooks/useFirebaseData";
import CustomDatePicker from "./DatePicker.jsx";
import DayList from "./DayList/DayList";
import { Button, Snackbar, Alert } from "@mui/material";
import "../../styles/user/settings/plan/placCreator.css";

const PlanCreator = () => {
  const {
    quantOfDays,
    dayToStart,
    startDate,
    endDate,
    setQuantOfDays,
    setDayToStart,
    setStartDate,
    setEndDate,
  } = useDateRange();

  const {
    values,
    summary,
    snackbarOpen,
    setSnackbarOpen,
    handleInputChange,
    saveData,
  } = useFirebaseData(quantOfDays, dayToStart);

  return (
    <div className="plan-creator">
      <CustomDatePicker
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        setQuantOfDays={setQuantOfDays}
        setDayToStart={setDayToStart}
      />

      <DayList
        quantOfDays={quantOfDays}
        dayToStart={dayToStart}
        values={values}
        handleInputChange={handleInputChange}
      />

      <div className="plan-creator__footer">
        <p className="plan-creator__footer__sum">Всього: {summary}</p>
        <div className="plan-creator__footer__save-button-wrapper">
          <Button
            className="plan-creator__footer__save-button"
            onClick={saveData}
            disabled={!quantOfDays}
            variant="contained"
          >
            Зберегти
          </Button>
        </div>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Дані успішно збережено!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PlanCreator;
