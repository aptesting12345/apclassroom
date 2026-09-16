(() => {
  const script = document.currentScript;
  const home = script?.dataset.home || "index.html";
  const calculatorIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect width="16" height="20" x="4" y="2" rx="2"/>
      <line x1="8" x2="16" y1="6" y2="6"/>
      <line x1="8" x2="8" y1="10" y2="10"/>
      <line x1="12" x2="12" y1="10" y2="10"/>
      <line x1="16" x2="16" y1="10" y2="10"/>
      <line x1="8" x2="8" y1="14" y2="14"/>
      <line x1="12" x2="12" y1="14" y2="14"/>
      <line x1="16" x2="16" y1="14" y2="14"/>
      <line x1="8" x2="8" y1="18" y2="18"/>
      <line x1="12" x2="12" y1="18" y2="18"/>
      <line x1="16" x2="16" y1="18" y2="18"/>
    </svg>`;

  function hasAccessCookie() {
    return document.cookie
      .split(";")
      .some(part => part.trim() === "calc_ready=1");
  }

  window.returnToCalculator = function returnToCalculator() {
    window.location.href = home;
  };

  if (window.location.protocol !== "file:" && !hasAccessCookie()) {
    window.location.replace(home);
    return;
  }

  function installCalculator() {
    const style = document.createElement("style");
    style.textContent = `
      .game-calculator-trigger {
        position: fixed; right: max(16px, env(safe-area-inset-right)); bottom: max(16px, env(safe-area-inset-bottom));
        width: 48px; height: 48px; padding: 0; border: 1px solid rgba(255,255,255,.34); border-radius: 50%;
        display: grid; place-items: center; color: #fff; background: #202124; box-shadow: 0 8px 24px rgba(0,0,0,.24);
        cursor: pointer; z-index: 9000; transition: transform 140ms ease, box-shadow 140ms ease;
      }
      .game-calculator-trigger:hover { transform: translateY(-2px); box-shadow: 0 11px 28px rgba(0,0,0,.28); }
      .game-calculator-trigger:focus-visible, .game-calculator-close:focus-visible, .game-calculator-key:focus-visible {
        outline: 3px solid #8ab4f8; outline-offset: 2px;
      }
      .game-calculator-trigger svg { width: 24px; height: 24px; }
      .game-calculator-overlay {
        position: fixed; inset: 0; display: none; place-items: center; padding: 18px;
        background: rgba(20, 24, 31, .72); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); z-index: 10000;
      }
      .game-calculator-overlay.open { display: grid; }
      .game-calculator-shell {
        width: min(100%, 360px); padding: 18px; border: 1px solid rgba(255,255,255,.1); border-radius: 8px;
        color: #f8fafc; background: #17191d; box-shadow: 0 24px 80px rgba(0,0,0,.5); font-family: Arial, Helvetica, sans-serif;
      }
      .game-calculator-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
      .game-calculator-title { margin: 0; font-size: 17px; font-weight: 750; letter-spacing: 0; }
      .game-calculator-close {
        width: 38px; height: 38px; padding: 0; border: 0; border-radius: 50%; display: grid; place-items: center;
        color: #d8dce3; background: #292c32; font: 24px/1 Arial, sans-serif; cursor: pointer;
      }
      .game-calculator-display {
        min-height: 94px; margin-bottom: 12px; padding: 14px 16px; border: 1px solid #363941; border-radius: 6px;
        display: flex; flex-direction: column; justify-content: flex-end; text-align: right; background: #0f1114; overflow: hidden;
      }
      .game-calculator-history { min-height: 18px; color: #9aa0a9; font-size: 14px; }
      .game-calculator-readout { color: #fff; font-size: 34px; line-height: 1.25; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
      .game-calculator-keys { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
      .game-calculator-key {
        min-width: 0; height: 54px; padding: 0; border: 1px solid #3b3e45; border-radius: 6px;
        color: #f4f5f7; background: #292c32; font: 700 18px/1 Arial, sans-serif; cursor: pointer;
      }
      .game-calculator-key:hover { background: #343840; }
      .game-calculator-key.operator { color: #202124; border-color: #fbbc04; background: #fbbc04; }
      .game-calculator-key.utility { color: #d2e3fc; background: #24334b; }
      .game-calculator-key.equals { color: #fff; border-color: #1a73e8; background: #1a73e8; }
      @media (max-height: 620px) {
        .game-calculator-overlay { align-items: start; overflow-y: auto; }
        .game-calculator-key { height: 46px; }
        .game-calculator-display { min-height: 72px; }
      }
    `;
    document.head.appendChild(style);

    const trigger = document.createElement("button");
    trigger.className = "game-calculator-trigger";
    trigger.type = "button";
    trigger.setAttribute("aria-label", "Open calculator");
    trigger.title = "Open calculator";
    trigger.innerHTML = calculatorIcon;

    const overlay = document.createElement("div");
    overlay.className = "game-calculator-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "game-calculator-title");
    overlay.innerHTML = `
      <section class="game-calculator-shell">
        <header class="game-calculator-head">
          <h2 class="game-calculator-title" id="game-calculator-title">Calculator Readiness</h2>
          <button class="game-calculator-close" type="button" aria-label="Return to game" title="Return to game">&times;</button>
        </header>
        <div class="game-calculator-display" aria-live="polite">
          <div class="game-calculator-history"></div>
          <div class="game-calculator-readout">0</div>
        </div>
        <div class="game-calculator-keys">
          <button class="game-calculator-key utility" type="button" data-action="clear">AC</button>
          <button class="game-calculator-key utility" type="button" data-action="backspace" aria-label="Backspace">&#9003;</button>
          <button class="game-calculator-key utility" type="button" data-action="percent">%</button>
          <button class="game-calculator-key operator" type="button" data-operator="/">&divide;</button>
          <button class="game-calculator-key" type="button" data-digit="7">7</button>
          <button class="game-calculator-key" type="button" data-digit="8">8</button>
          <button class="game-calculator-key" type="button" data-digit="9">9</button>
          <button class="game-calculator-key operator" type="button" data-operator="*">&times;</button>
          <button class="game-calculator-key" type="button" data-digit="4">4</button>
          <button class="game-calculator-key" type="button" data-digit="5">5</button>
          <button class="game-calculator-key" type="button" data-digit="6">6</button>
          <button class="game-calculator-key operator" type="button" data-operator="-">&minus;</button>
          <button class="game-calculator-key" type="button" data-digit="1">1</button>
          <button class="game-calculator-key" type="button" data-digit="2">2</button>
          <button class="game-calculator-key" type="button" data-digit="3">3</button>
          <button class="game-calculator-key operator" type="button" data-operator="+">+</button>
          <button class="game-calculator-key" type="button" data-action="sign">+/&minus;</button>
          <button class="game-calculator-key" type="button" data-digit="0">0</button>
          <button class="game-calculator-key" type="button" data-action="decimal">.</button>
          <button class="game-calculator-key equals" type="button" data-action="equals">=</button>
        </div>
      </section>`;
    document.body.append(trigger, overlay);

    const readout = overlay.querySelector(".game-calculator-readout");
    const history = overlay.querySelector(".game-calculator-history");
    const close = overlay.querySelector(".game-calculator-close");
    let current = "0";
    let stored = null;
    let operator = null;
    let resetNext = false;

    function format(value) {
      if (!Number.isFinite(value)) return "Error";
      return String(Math.round((value + Number.EPSILON) * 100000000) / 100000000).slice(0, 14);
    }
    function render() {
      readout.textContent = current;
      history.textContent = stored !== null && operator ? `${stored} ${{ "+": "+", "-": "-", "*": "x", "/": "/" }[operator]}` : "";
    }
    function clear() {
      current = "0";
      stored = null;
      operator = null;
      resetNext = false;
      render();
    }
    function digit(value) {
      if (resetNext || current === "Error") {
        current = value;
        resetNext = false;
      } else if (current === "0") current = value;
      else if (current.length < 14) current += value;
      render();
    }
    function decimal() {
      if (resetNext || current === "Error") {
        current = "0";
        resetNext = false;
      }
      if (!current.includes(".")) current += ".";
      render();
    }
    function calculate() {
      if (stored === null || !operator) return;
      const a = Number(stored);
      const b = Number(current);
      const result = operator === "+" ? a + b : operator === "-" ? a - b : operator === "*" ? a * b : b === 0 ? NaN : a / b;
      current = format(result);
      stored = null;
      operator = null;
      resetNext = true;
      render();
    }
    function choose(next) {
      if (operator && !resetNext) calculate();
      stored = current;
      operator = next;
      resetNext = true;
      render();
    }
    function open() {
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
      window.dispatchEvent(new CustomEvent("gamecalculatorchange", { detail: { open: true } }));
      close.focus();
    }
    function dismiss() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
      window.dispatchEvent(new CustomEvent("gamecalculatorchange", { detail: { open: false } }));
      trigger.focus();
    }

    trigger.addEventListener("click", open);
    close.addEventListener("click", dismiss);
    overlay.addEventListener("click", event => {
      if (event.target === overlay) dismiss();
      const key = event.target.closest(".game-calculator-key");
      if (!key) return;
      if (key.dataset.digit) digit(key.dataset.digit);
      if (key.dataset.operator) choose(key.dataset.operator);
      if (key.dataset.action === "clear") clear();
      if (key.dataset.action === "decimal") decimal();
      if (key.dataset.action === "equals") calculate();
      if (key.dataset.action === "percent") { current = format(Number(current) / 100); render(); }
      if (key.dataset.action === "sign") { current = format(Number(current) * -1); render(); }
      if (key.dataset.action === "backspace") { current = current.length > 1 ? current.slice(0, -1) : "0"; render(); }
    });
    document.addEventListener("keydown", event => {
      if (!overlay.classList.contains("open")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (/^[0-9]$/.test(event.key)) digit(event.key);
      else if (["+", "-", "*", "/"].includes(event.key)) choose(event.key);
      else if (event.key === ".") decimal();
      else if (event.key === "Enter" || event.key === "=") calculate();
      else if (event.key === "Backspace") { current = current.length > 1 ? current.slice(0, -1) : "0"; render(); }
      else if (event.key === "Escape") dismiss();
    }, true);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-calculator-back]").forEach(link => {
      link.setAttribute("aria-label", "Back to games");
      link.title = "Back to games";
      link.addEventListener("click", event => {
        event.preventDefault();
        window.returnToCalculator();
      });
    });
    installCalculator();
  });
})();
