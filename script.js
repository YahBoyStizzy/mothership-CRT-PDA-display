/* =====================
   GAME STATE
===================== */

const defaultState = {
  corruptionMode: "OFF",
  locations: {
    BRIDGE: { unlocked: true, logs: ["Bridge log: power fluctuations detected."] },
    MEDICAL: { unlocked: true, logs: ["Medical log: triage overwhelmed."] },
    ENGINEERING: { unlocked: false, logs: ["Engineering log: reactor offline."] },
    HABITATION: { unlocked: true, logs: ["Hab log: evacuation incomplete."] },
    CARGO: { unlocked: true, logs: ["Cargo log: motion detected."] }
  },
  crew: {
    "CAPT. HOLLIS": "UNKNOWN",
    "DR. KLINE": "ACTIVE",
    "ENG. TORRES": "MISSING"
  },
  objectives: [
    "RESTORE POWER",
    "LOCATE SURVIVORS",
    "MAINTAIN OXYGEN LEVELS"
  ]
};

let gameState = JSON.parse(localStorage.getItem("mothershipState")) || structuredClone(defaultState);

function saveState() {
  localStorage.setItem("mothershipState", JSON.stringify(gameState));
}

/* =====================
   TERMINAL OUTPUT
===================== */

const content = document.getElementById("content");
const terminal = document.getElementById("terminal");

function write(text, delay = 20) {
  return new Promise(resolve => {
    let i = 0;
    const interval = setInterval(() => {
      content.textContent += text[i++];
      terminal.scrollTop = terminal.scrollHeight;
      if (i >= text.length) {
        clearInterval(interval);
        resolve();
      }
    }, delay);
  });
}

async function boot() {
  content.textContent = "";
  await write("SYS_BOOT SEQ 00.77\n");
  await write("DATA INTEGRITY: " + gameState.corruptionMode + "\n\n");
  await write("TYPE HELP FOR COMMANDS\n\n> ");
}

setTimeout(boot, 10000);

/* =====================
   COMMAND HANDLING
===================== */

async function handleCommand(cmd) {
  cmd = cmd.toUpperCase();

  if (cmd === "HELP") {
    await write("\nCOMMANDS:\n");
    await write("LOCATIONS, MAP, OBJECTIVES, CREW\n");
    await write("TYPE LOCATION NAME TO ACCESS\n");
    return;
  }

  if (cmd === "LOCATIONS") {
    await write("\nLOCATIONS:\n");
    Object.entries(gameState.locations).forEach(([k,v]) =>
      write(`- ${k}${v.unlocked ? "" : " [LOCKED]"}\n`)
    );
    return;
  }

  if (cmd === "MAP") {
    await write("\n[BRIDGE]--[HAB]\n   |       |\n[ENG]--[MED]--[CARGO]\n");
    return;
  }

  if (cmd === "OBJECTIVES") {
    await write("\nOBJECTIVES:\n");
    gameState.objectives.forEach(o => write(`- ${o}\n`));
    return;
  }

  if (cmd === "CREW") {
    await write("\nCREW MANIFEST:\n");
    Object.entries(gameState.crew).forEach(([n,s]) => write(`- ${n}: ${s}\n`));
    return;
  }

  if (gameState.locations[cmd]) {
    const loc = gameState.locations[cmd];
    if (!loc.unlocked) {
      await write(`\nACCESS DENIED: ${cmd}\n`);
      return;
    }
    await write(`\nACCESSING: ${cmd}\n`);
    loc.logs.forEach(l => write(`- ${l}\n`));
    return;
  }

  await write("\nUNKNOWN COMMAND\n");
}

let input = "";

document.addEventListener("keydown", async e => {
  if (!terminal) return;
  if (e.key === "Enter") {
    await handleCommand(input);
    input = "";
    await write("\n> ");
  } else if (e.key === "Backspace") {
    input = input.slice(0, -1);
    content.textContent = content.textContent.slice(0, -1);
  } else if (e.key.length === 1) {
    input += e.key;
    content.textContent += e.key;
  }
});
