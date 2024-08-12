const selectWrapper = document.getElementById("wrapper-select");
const selectLanguage = document.getElementById("language-select");
const tabsButtons = document.querySelectorAll(".table__tabs-item");

selectLanguage.addEventListener("change", handleLanguageChange);
tabsButtons.forEach((tabButton) => tabButton.addEventListener("click", handleSwitchTabs));

function handleBodyLanguage(tBodies, lang) {
  const [englishTBody, frenchTBody] = tBodies;

  if (lang === "en") {
    frenchTBody.classList.remove("active");
    englishTBody.classList.add("active");
  }
  else {
    englishTBody.classList.remove("active");
    frenchTBody.classList.add("active");
  }
}

function handleLanguageChange(event) {
  const currentPan = document.querySelector("table.active");

  selectWrapper.className = `select__wrapper ${event.target.value}`;

  handleBodyLanguage(currentPan.tBodies, event.target.value);
}

function handleSwitchTabs(event) {
  const currentTab = event.target;
  const activeTab = document.querySelector(".table__tabs-item.active");
  const activePan = document.getElementById(activeTab.attributes["aria-controls"].value);
  const currentPan = document.getElementById(currentTab.attributes["aria-controls"].value);

  if (currentTab === activeTab) {
    return;
  }

  activeTab.classList.remove("active");
  activeTab.ariaSelected = false;
  currentTab.classList.add("active");
  currentTab.ariaSelected = true;

  activePan.classList.remove("active");
  currentPan.classList.add("active");

  handleBodyLanguage(currentPan.tBodies, selectLanguage.value);
}
