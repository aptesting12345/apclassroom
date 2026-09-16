(() => {
  const script = document.currentScript;
  const home = script?.dataset.home || "index.html";

  function hasAccessCookie() {
    return document.cookie
      .split(";")
      .some(part => part.trim() === "calc_ready=1");
  }

  function clearAccess() {
    sessionStorage.removeItem("gameAccess");
    document.cookie = "calc_ready=; Path=/; Max-Age=0; SameSite=Lax";
  }

  window.returnToCalculator = function returnToCalculator() {
    clearAccess();
    window.location.href = home;
  };

  if (window.location.protocol !== "file:" && !hasAccessCookie()) {
    window.location.replace(home);
    return;
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-calculator-back]").forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        window.returnToCalculator();
      });
    });
  });
})();
