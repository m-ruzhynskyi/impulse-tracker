export default function menuController(exit = false) {
  const body = document.querySelector("body");
  const wrapper = document.querySelector("#wrapper");
  const menuCheckbox = document.querySelector("#menuCheckbox");
  const section = wrapper?.childNodes[1];

  if (!body || !wrapper || !section) return;

  body.classList.toggle("menuOpenedBody", !exit);
  section.classList.toggle("menuOpenedMain", !exit);

  menuCheckbox.checked = !exit;
}
