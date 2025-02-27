import PlanCreator from "../Components/PlanCreator/PlanCreator";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  accordionSummaryClasses,
} from "@mui/joy";
import ImpulseEdit from "../Components/edit_and_userController/ImpulseEdit";
import UserEdit from "../Components/edit_and_userController/UserEdit";

import "../styles/user/settings/settings.css";

export default function Settings() {
  return (
    <section className={"settings"}>
      <AccordionGroup
        variant="soft"
        size="lg"
        transition={{
          initial: "0.3s ease-out",
          expanded: "0.2s ease",
        }}
        sx={{
          [`& .${accordionSummaryClasses.button}`]: {
            paddingBlock: "1.5rem",
          },
        }}
        className={"settings__accordions"}
      >
        <Accordion className={"settings__accordions__accordion"}>
          <AccordionSummary>План</AccordionSummary>
          <AccordionDetails>
            <PlanCreator />
          </AccordionDetails>
        </Accordion>
        <Accordion className={"settings__accordions__accordion"}>
          <AccordionSummary>Вибрати енерджі</AccordionSummary>
          <AccordionDetails>
            <ImpulseEdit />
          </AccordionDetails>
        </Accordion>
        <Accordion className={"settings__accordions__accordion"}>
          <AccordionSummary>Керуання співробітнкиами</AccordionSummary>
          <AccordionDetails>
            <UserEdit />
          </AccordionDetails>
        </Accordion>
      </AccordionGroup>
    </section>
  );
}
