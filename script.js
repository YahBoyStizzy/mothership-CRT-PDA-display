/* =========================
   GM DEVICE TOGGLE
   ========================= */

const CRT = true;
const TABLET = false;

/* =========================
   BOOT SETTINGS
   ========================= */

const BOOT_DELAY = 30000; // 30 seconds
const TYPING_SPEED = 35;

/* =========================
   DEVICE SETUP
   ========================= */

const device = document.querySelector(".device");
const terminal = document.getElementById("content");
const pdaStatus = document.getElementById("pda-status");
const batteryDisplay = document.getElementById("battery");

if (CRT) {
  device.classList.add("crt-mode");
  device.classList.remove("datapad-mode");
}

if (TABLET) {
  device.classList.add("datapad-mode");
  device.classList.remove("crt-mode");
  pdaStatus.style.display = "block";
}

/* =========================
   TERMINAL STATE
   ========================= */

let acceptingInput = false;
let currentInput = "";
let currentLocation = "root";

/* =========================
   PDA BATTERY (COSMETIC)
   ========================= */

let batteryLevel = 87;

function drainBattery() {
  if (!TABLET) return;
  if (batteryLevel > 12) batteryLevel--;
  batteryDisplay.textContent = batteryLevel + "%";
}

setInterval(drainBattery, 60000); // 1% per minute

/* =========================
   BOOT SEQUENCE
   ========================= */

const bootLines = [
  "POWER SIGNAL DETECTED",
  "INITIALIZING SYSTEM CORE",
  "MEMORY CHECK ........ OK",
  "SECURITY LAYERS ...... ACTIVE",
  "LINKING SUBSYSTEMS ...",
  "",
  "WELCOME, USER",
  "TYPE 'help' FOR AVAILABLE COMMANDS",
  ""
];

let bootLine = 0;
let charIndex = 0;

function typeBoot() {
  if (bootLine >= bootLines.length) {
    showPrompt();
    return;
  }

  const line = bootLines[bootLine];

  if (charIndex < line.length) {
    terminal.textContent += line.charAt(charIndex);
    charIndex++;
    setTimeout(typeBoot, TYPING_SPEED);
  } else {
    terminal.textContent += "\n";
    bootLine++;
    charIndex = 0;
    setTimeout(typeBoot, 300);
  }
}

/* =========================
   PROMPT
   ========================= */

function showPrompt() {
  terminal.textContent += `[${currentLocation}]> `;
  acceptingInput = true;
  currentInput = "";
}

/* =========================
   LOCATIONS / SECTIONS
   ========================= */

const locations = {
  root: `
AVAILABLE LOCATIONS:
- logs
- crew
- security
- personal
`,

  logs: `
SYSTEM LOGS:
LOG 001: CREW TRANSFER COMPLETE
LOG 014: DISTRESS SIGNAL RECEIVED
LOG 022: AI RESPONSE DELAY
`,

  crew: `
CREW ROSTER:
- CAPTAIN: STATUS UNKNOWN
- ENGINEER: NO RESPONSE
- MEDICAL: DECEASED
`,

  security: `
SECURITY SYSTEM:
CAMERAS: OFFLINE
LOCKS: PARTIAL CONTROL
ALERT STATUS: AMBER
`,

  personal: `
PERSONAL DATA:
DAILY TASKS:
- CHECK POWER COUPLINGS
- FILE INCIDENT REPORT
- REST (OPTIONAL)
`
};

/* =========================
   COMMAND HANDLER
   ========================= */

function runCommand(cmd) {
  const lower = cmd.toLowerCase();

  if (lower === "help") {
    terminal.textContent += locations.root + "\n";
  }
  else if (locations[lower]) {
    currentLocation = lower;
    terminal.textContent += locations[lower] + "\n";
  }
  else if (lower === "clear") {
    terminal.textContent = "";
  }
  else {
    terminal.textContent += "UNKNOWN COMMAND\n";
  }
}

/* =========================
   INPUT HANDLING
   ========================= */

window.addEventListener("keydown", (e) => {
  if (!acceptingInput) return;

  if (e.key === "Enter") {
    acceptingInput = false;
    terminal.textContent += "\n";
    runCommand(currentInput);
    showPrompt();
  }
  else if (e.key === "Backspace") {
    if (currentInput.length > 0) {
      currentInput = currentInput.slice(0, -1);
      terminal.textContent = terminal.textContent.slice(0, -1);
    }
  }
  else if (e.key.length === 1) {
    currentInput += e.key;
    terminal.textContent += e.key;
  }
});

/* =========================
   INITIAL POWER-OFF STATE
   ========================= */

terminal.textContent = "";
acceptingInput = false;

setTimeout(() => {
  typeBoot();
}, BOOT_DELAY);
