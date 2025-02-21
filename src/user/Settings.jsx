import PlanCreator from "../Components/PlanCreator/PlanCreator";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
} from "@mui/joy";

export default function Settings() {
  return (
    <section className={"settings"}>
      <AccordionGroup variant="soft">
        <Accordion>
          <AccordionSummary>План</AccordionSummary>
          <AccordionDetails>
            <PlanCreator />
          </AccordionDetails>
        </Accordion>
      </AccordionGroup>
    </section>
  );
}
