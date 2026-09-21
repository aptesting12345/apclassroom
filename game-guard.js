(() => {
  const script = document.currentScript;
  const home = script?.dataset.home || "index.html";
  const calculatorIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>`;
  const joyconIcon = `<svg viewBox="0 0 30 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h2V2Z"/><path d="M21 2h2a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5h-2V2Z"/><path d="M9 2h12v20H9z"/><circle cx="5.6" cy="8" r="1.6"/><path d="M5.6 14v4m-2-2h4"/><circle cx="24.4" cy="16" r="1.6"/><path d="M24.4 6v4m-2-2h4"/></svg>`;

  function hasAccessCookie() {
    return document.cookie.split(";").some(part => part.trim() === "calc_ready=1");
  }

  window.returnToCalculator = () => { window.location.href = home; };

  if (window.location.protocol !== "file:" && !hasAccessCookie()) {
    window.location.replace(home);
    return;
  }

  function installCalculator() {
    const style = document.createElement("style");
    style.textContent = `
      .game-calculator-trigger,.game-calculator-resume{position:fixed;right:max(18px,env(safe-area-inset-right));bottom:max(18px,env(safe-area-inset-bottom));width:54px;height:54px;padding:0;border:1px solid rgba(255,255,255,.3);border-radius:16px;display:grid;place-items:center;color:#fff;background:#172238;box-shadow:0 12px 32px rgba(0,0,0,.28);cursor:pointer;z-index:9000;transition:transform .16s,box-shadow .16s,background .16s}
      .game-calculator-trigger:hover,.game-calculator-resume:hover{transform:translateY(-3px);box-shadow:0 16px 38px rgba(0,0,0,.34);background:#2764e7}
      .game-calculator-trigger:focus-visible,.game-calculator-resume:focus-visible,.game-calculator-key:focus-visible,.game-calculator-expression:focus-visible{outline:3px solid #8db0ff;outline-offset:3px}
      .game-calculator-trigger svg{width:25px;height:25px}.game-calculator-resume svg{width:30px;height:24px}
      .game-calculator-overlay{position:fixed;inset:0;display:none;overflow:auto;color:#fff;background:radial-gradient(circle at 16% 12%,rgba(55,120,255,.25),transparent 30%),radial-gradient(circle at 86% 23%,rgba(45,184,153,.16),transparent 26%),#0b1220;z-index:10000;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
      .game-calculator-overlay:before{content:"";position:fixed;inset:0;opacity:.12;background-image:linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(to bottom,#000,transparent 90%);pointer-events:none}
      .game-calculator-overlay.open{display:block}.game-calculator-page{position:relative;z-index:1;width:min(760px,calc(100% - 32px));min-height:100%;margin:0 auto;padding:34px 0 96px;display:flex;flex-direction:column;justify-content:center}
      .game-calculator-brand{margin-bottom:22px;display:flex;align-items:center;justify-content:space-between;gap:18px}.game-calculator-brand-main{display:flex;align-items:center;gap:12px;font-weight:850;font-size:18px;letter-spacing:-.02em}.game-calculator-brand-mark{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:#2764e7;box-shadow:0 8px 22px rgba(39,100,231,.3);font-size:21px}.game-calculator-paused{display:flex;align-items:center;gap:8px;color:#aeb9ca;font-size:12px;font-weight:700}.game-calculator-paused i{width:7px;height:7px;border-radius:50%;background:#65d5bc;box-shadow:0 0 0 5px rgba(101,213,188,.11)}
      .game-calculator-shell{border:1px solid rgba(255,255,255,.12);border-radius:24px;overflow:hidden;color:#132033;background:#f7f9fc;box-shadow:0 35px 90px rgba(0,0,0,.38)}
      .game-calculator-head{padding:14px 19px;display:flex;align-items:center;justify-content:space-between;color:#a8b3c4;background:#172238;font-size:12px;font-weight:750}.game-calculator-head-status{display:flex;align-items:center;gap:7px}.game-calculator-head-status i{width:7px;height:7px;border-radius:50%;background:#62d3b8}
      .game-calculator-body{padding:18px}.game-calculator-display{min-height:118px;padding:15px 18px;border:1px solid #dfe5ef;border-radius:15px;display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-end;background:#fff;overflow:hidden}.game-calculator-expression{width:100%;min-height:25px;padding:0;border:0;outline:0;color:#627086;background:transparent;text-align:right;font:500 16px/1.4 inherit}.game-calculator-result{width:100%;min-height:55px;color:#132033;text-align:right;font-size:clamp(34px,7vw,48px);line-height:1.15;font-weight:800;letter-spacing:-.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .game-calculator-meta{margin:11px 2px 13px;display:flex;align-items:center;justify-content:space-between;color:#7b8798;font-size:11px;font-weight:750}.game-calculator-modes{display:flex;gap:3px;padding:2px;border-radius:7px;background:#e9edf4}.game-calculator-modes button{padding:3px 8px;border:0;border-radius:5px;color:#677489;background:transparent;font:800 10px/1.4 inherit;cursor:pointer}.game-calculator-modes button.active{color:#2764e7;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.1)}
      .game-calculator-keys{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}.game-calculator-key{min-width:0;min-height:47px;padding:0 4px;border:1px solid #dfe5ee;border-radius:10px;color:#27364c;background:#fff;font:750 14px/1 inherit;box-shadow:0 2px 4px rgba(28,43,69,.03);cursor:pointer;transition:transform .1s,border-color .1s,background .1s}.game-calculator-key:hover{border-color:#b7c7e8;background:#f9fbff}.game-calculator-key:active{transform:translateY(1px)}.game-calculator-key.function{color:#2764e7;background:#edf3ff;border-color:#dce7ff;font-size:12px}.game-calculator-key.operator{color:#2764e7;background:#e6efff;border-color:#cfddfb;font-size:18px}.game-calculator-key.utility{color:#9d3943;background:#fff1f2;border-color:#f6dadd}.game-calculator-key.equals{color:#fff;background:#2764e7;border-color:#2764e7;font-size:20px;box-shadow:0 7px 16px rgba(39,100,231,.24)}.game-calculator-key.zero{grid-column:span 2}
      .game-calculator-resume{display:none;z-index:10001;background:#2764e7}.game-calculator-overlay.open .game-calculator-resume{display:grid}.game-calculator-resume-label{position:fixed;right:max(82px,calc(env(safe-area-inset-right) + 64px));bottom:max(29px,calc(env(safe-area-inset-bottom) + 11px));z-index:10001;padding:8px 11px;border:1px solid rgba(255,255,255,.14);border-radius:9px;color:#dce6f7;background:rgba(23,34,56,.94);font-size:11px;font-weight:800;pointer-events:none}
      body.game-calculator-is-open>.game-calculator-trigger{display:none}
      @media(max-width:620px){.game-calculator-page{width:min(100% - 20px,760px);padding:18px 0 88px;justify-content:flex-start}.game-calculator-brand{margin-bottom:14px}.game-calculator-paused{display:none}.game-calculator-body{padding:11px}.game-calculator-display{min-height:100px}.game-calculator-keys{gap:6px}.game-calculator-key{min-height:44px;font-size:13px}.game-calculator-key.function{font-size:10px}}
      @media(max-height:700px) and (min-width:621px){.game-calculator-page{padding-top:18px;justify-content:flex-start}.game-calculator-brand{margin-bottom:12px}.game-calculator-display{min-height:92px}.game-calculator-key{min-height:41px}}
    `;
    document.head.appendChild(style);

    const trigger = document.createElement("button");
    trigger.className = "game-calculator-trigger";
    trigger.type = "button";
    trigger.setAttribute("aria-label", "Switch to calculator");
    trigger.title = "Switch to calculator";
    trigger.innerHTML = calculatorIcon;

    const overlay = document.createElement("div");
    overlay.className = "game-calculator-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "game-calculator-title");
    overlay.innerHTML = `
      <main class="game-calculator-page">
        <header class="game-calculator-brand">
          <div class="game-calculator-brand-main"><span class="game-calculator-brand-mark">∑</span><span>Calculator Readiness</span></div>
          <span class="game-calculator-paused"><i></i> Game paused in the background</span>
        </header>
        <section class="game-calculator-shell">
          <header class="game-calculator-head"><span id="game-calculator-title">Scientific calculator</span><span class="game-calculator-head-status"><i></i> Ready</span></header>
          <div class="game-calculator-body">
            <div class="game-calculator-display"><input class="game-calculator-expression" inputmode="text" autocomplete="off" spellcheck="false" aria-label="Calculator expression" placeholder="Enter a calculation"><div class="game-calculator-result" aria-live="polite">0</div></div>
            <div class="game-calculator-meta"><span class="game-calculator-memory">Memory: 0</span><div class="game-calculator-modes" aria-label="Angle mode"><button type="button" data-mode="deg" class="active">DEG</button><button type="button" data-mode="rad">RAD</button></div></div>
            <div class="game-calculator-keys">
              <button class="game-calculator-key utility" data-action="clear">AC</button><button class="game-calculator-key utility" data-action="backspace">DEL</button><button class="game-calculator-key function" data-value="(">(</button><button class="game-calculator-key function" data-value=")">)</button><button class="game-calculator-key function" data-value="%">%</button><button class="game-calculator-key operator" data-value="÷">÷</button>
              <button class="game-calculator-key function" data-value="sin(">sin</button><button class="game-calculator-key function" data-value="cos(">cos</button><button class="game-calculator-key function" data-value="tan(">tan</button><button class="game-calculator-key function" data-value="√(">√</button><button class="game-calculator-key function" data-value="^">xʸ</button><button class="game-calculator-key operator" data-value="×">×</button>
              <button class="game-calculator-key function" data-value="ln(">ln</button><button class="game-calculator-key function" data-value="log(">log</button><button class="game-calculator-key function" data-value="π">π</button><button class="game-calculator-key" data-value="7">7</button><button class="game-calculator-key" data-value="8">8</button><button class="game-calculator-key" data-value="9">9</button>
              <button class="game-calculator-key function" data-action="square">x²</button><button class="game-calculator-key function" data-action="memory-add">M+</button><button class="game-calculator-key function" data-action="memory-recall">MR</button><button class="game-calculator-key" data-value="4">4</button><button class="game-calculator-key" data-value="5">5</button><button class="game-calculator-key" data-value="6">6</button>
              <button class="game-calculator-key operator" data-value="−">−</button><button class="game-calculator-key function" data-value="E">e</button><button class="game-calculator-key" data-value="1">1</button><button class="game-calculator-key" data-value="2">2</button><button class="game-calculator-key" data-value="3">3</button><button class="game-calculator-key operator" data-value="+">+</button>
              <button class="game-calculator-key function" data-action="answer">ANS</button><button class="game-calculator-key function" data-action="sign">±</button><button class="game-calculator-key zero" data-value="0">0</button><button class="game-calculator-key" data-value=".">.</button><button class="game-calculator-key equals" data-action="equals">=</button>
            </div>
          </div>
        </section>
        <span class="game-calculator-resume-label">Resume game</span>
        <button class="game-calculator-resume" type="button" aria-label="Resume game" title="Resume game">${joyconIcon}</button>
      </main>`;
    document.body.append(trigger, overlay);

    const expression = overlay.querySelector(".game-calculator-expression");
    const result = overlay.querySelector(".game-calculator-result");
    const memoryLabel = overlay.querySelector(".game-calculator-memory");
    const resumeButton = overlay.querySelector(".game-calculator-resume");
    let angleMode = "deg";
    let memory = 0;
    let lastResult = 0;
    let previousOverflow = "";
    let pausedMedia = [];

    function normalize(raw) {
      let value = raw.trim().replaceAll("×", "*").replaceAll("÷", "/").replaceAll("−", "-").replaceAll("π", "PI").replaceAll("√", "sqrt");
      value = value.replace(/(\d|\)|PI)\s*(?=PI|sin|cos|tan|ln|log|sqrt|\()/g, "$1*").replace(/\^/g, "**").replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
      if (!/^(?:[\d\s.+\-*/%(),]|\*\*|PI|E|sin|cos|tan|ln|log|sqrt|abs)*$/.test(value)) throw new Error("Unsupported expression");
      const trig = angleMode === "deg"
        ? { sin: "((x)=>Math.sin(x*Math.PI/180))", cos: "((x)=>Math.cos(x*Math.PI/180))", tan: "((x)=>Math.tan(x*Math.PI/180))" }
        : { sin: "Math.sin", cos: "Math.cos", tan: "Math.tan" };
      return value.replace(/\bPI\b/g, "Math.PI").replace(/\bE\b/g, "Math.E").replace(/\bsin\b/g, trig.sin).replace(/\bcos\b/g, trig.cos).replace(/\btan\b/g, trig.tan).replace(/\bln\b/g, "Math.log").replace(/\blog\b/g, "Math.log10").replace(/\bsqrt\b/g, "Math.sqrt").replace(/\babs\b/g, "Math.abs");
    }

    function evaluate(showError = false) {
      if (!expression.value.trim()) { result.textContent = "0"; return 0; }
      try {
        const value = Function(`"use strict"; return (${normalize(expression.value)})`)();
        if (!Number.isFinite(value)) throw new Error("Invalid result");
        lastResult = value;
        result.textContent = Number.isInteger(value) ? value.toLocaleString("en-US") : Number(value.toPrecision(12)).toLocaleString("en-US", { maximumFractionDigits: 10 });
        return value;
      } catch (error) {
        if (showError) result.textContent = "Check expression";
        return null;
      }
    }

    function pauseMedia() {
      pausedMedia = [...document.querySelectorAll("audio,video")].filter(item => !item.paused);
      pausedMedia.forEach(item => item.pause());
    }

    function resumeMedia() {
      pausedMedia.forEach(item => item.play().catch(() => {}));
      pausedMedia = [];
    }

    function open() {
      if (overlay.classList.contains("open")) return;
      previousOverflow = document.body.style.overflow;
      overlay.classList.add("open");
      document.body.classList.add("game-calculator-is-open");
      document.body.style.overflow = "hidden";
      pauseMedia();
      window.dispatchEvent(new CustomEvent("gamecalculatorchange", { detail: { open: true } }));
      expression.focus();
    }

    function dismiss() {
      if (!overlay.classList.contains("open")) return;
      overlay.classList.remove("open");
      document.body.classList.remove("game-calculator-is-open");
      document.body.style.overflow = previousOverflow;
      resumeMedia();
      window.dispatchEvent(new CustomEvent("gamecalculatorchange", { detail: { open: false } }));
      trigger.focus();
    }

    trigger.addEventListener("click", open);
    resumeButton.addEventListener("click", dismiss);
    expression.addEventListener("input", () => evaluate());
    overlay.querySelector(".game-calculator-keys").addEventListener("click", event => {
      const key = event.target.closest("button");
      if (!key) return;
      const action = key.dataset.action;
      if (action === "clear") { expression.value = ""; result.textContent = "0"; lastResult = 0; }
      else if (action === "backspace") { expression.value = expression.value.slice(0, -1); evaluate(); }
      else if (action === "equals") evaluate(true);
      else if (action === "square") { expression.value = expression.value ? `(${expression.value})^2` : ""; evaluate(); }
      else if (action === "memory-add") { memory += evaluate() || 0; memoryLabel.textContent = `Memory: ${memory.toLocaleString("en-US", { maximumFractionDigits: 6 })}`; }
      else if (action === "memory-recall") { expression.value += String(memory); evaluate(); }
      else if (action === "answer") { expression.value += String(lastResult); evaluate(); }
      else if (action === "sign") { expression.value = expression.value ? `-(${expression.value})` : "-"; evaluate(); }
      else { expression.value += key.dataset.value || ""; evaluate(); }
      expression.focus();
    });
    overlay.querySelector(".game-calculator-modes").addEventListener("click", event => {
      const button = event.target.closest("button[data-mode]");
      if (!button) return;
      angleMode = button.dataset.mode;
      overlay.querySelectorAll("[data-mode]").forEach(item => item.classList.toggle("active", item === button));
      evaluate();
    });
    document.addEventListener("keydown", event => {
      if (!overlay.classList.contains("open")) return;
      event.stopImmediatePropagation();
      if (event.key === "Escape") { event.preventDefault(); dismiss(); return; }
      if (event.key === "Enter") { event.preventDefault(); evaluate(true); return; }
      if (event.target === expression) return;
      if (/^[0-9.+\-*/()%]$/.test(event.key)) { event.preventDefault(); expression.value += event.key; evaluate(); }
      else if (event.key === "Backspace") { event.preventDefault(); expression.value = expression.value.slice(0, -1); evaluate(); }
    }, true);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-calculator-back]").forEach(link => {
      link.setAttribute("aria-label", "Back to games");
      link.title = "Back to games";
      link.addEventListener("click", event => { event.preventDefault(); window.returnToCalculator(); });
    });
    installCalculator();
  });
})();
