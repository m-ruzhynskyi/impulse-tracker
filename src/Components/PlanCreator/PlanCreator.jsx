import React, { useState } from "react";
import RenderDatePicker from "./DatePicker";

export default function PlanCreator() {
  const [quantOfDays, setQuantOfDays] = useState(0);

  return (
    <div>
      <RenderDatePicker setQuantOfDays={(e) => setQuantOfDays(e)} />
    </div>
  );
}
