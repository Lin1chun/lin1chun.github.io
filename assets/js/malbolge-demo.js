(() => {
  "use strict";

  const MEMORY_SIZE = 59049;
  const MAX_STEPS = 1000000;
  const LEGAL = "ji*p</vo";
  const SPACE = "\t\r\n\v\f ";
  const XLAT1 =
    '+b(29e*j1VMEKLyC})8&m#~W>qxdRp0wkrUo[D7,XTcA"lI.v%{gJh4G\\-=O@5`_3i<?Z\';FNQuY]szf$!BS/|t:Pn6^Ha';
  const XLAT2 =
    '5z]&gqtyfr$(we4{WP)H-Zn,[%\\3dL+Q;>U!pJS72FhOA1CB6v^=I_0/8|jsb9m<.TVac`uY*MK\'X~xDl}REokN:#?G"i@';
  const POW9 = [1, 9, 81, 729, 6561];
  const CRAZY_TABLE = [
    [4, 3, 3, 1, 0, 0, 1, 0, 0],
    [4, 3, 5, 1, 0, 2, 1, 0, 2],
    [5, 5, 4, 2, 2, 1, 2, 2, 1],
    [4, 3, 3, 1, 0, 0, 7, 6, 6],
    [4, 3, 5, 1, 0, 2, 7, 6, 8],
    [5, 5, 4, 2, 2, 1, 8, 8, 7],
    [7, 6, 6, 7, 6, 6, 4, 3, 3],
    [7, 6, 8, 7, 6, 8, 4, 3, 5],
    [8, 8, 7, 8, 8, 7, 5, 5, 4],
  ];

  function crazy(x, y) {
    let result = 0;

    for (let index = 0; index < POW9.length; index += 1) {
      const power = POW9[index];
      const xDigit = Math.floor(x / power) % 9;
      const yDigit = Math.floor(y / power) % 9;
      result += CRAZY_TABLE[yDigit][xDigit] * power;
    }

    return result;
  }

  function decodeInstruction(cell, position) {
    return XLAT1[(cell - 33 + position) % 94];
  }

  function loadProgram(source) {
    const memory = new Array(MEMORY_SIZE).fill(0);
    let position = 0;

    for (let index = 0; index < source.length; index += 1) {
      const character = source[index];

      if (SPACE.includes(character)) {
        continue;
      }

      const code = source.charCodeAt(index);
      if (code < 33 || code > 126) {
        throw new Error(`Source character ${index + 1} is outside the printable range.`);
      }

      if (!LEGAL.includes(decodeInstruction(code, position))) {
        throw new Error(`Source character ${index + 1} is not a legal original-Malbolge instruction.`);
      }

      if (position >= MEMORY_SIZE) {
        throw new Error("Program is longer than the 59,049-cell Malbolge memory.");
      }

      memory[position] = code;
      position += 1;
    }

    if (position < 2) {
      throw new Error("A standard Malbolge program needs at least two memory cells.");
    }

    while (position < MEMORY_SIZE) {
      memory[position] = crazy(memory[position - 1], memory[position - 2]);
      position += 1;
    }

    return memory;
  }

  function runProgram(source, inputText) {
    const memory = loadProgram(source);
    const input = new TextEncoder().encode(inputText);
    const output = [];
    const decoder = new TextDecoder();
    let accumulator = 0;
    let codePointer = 0;
    let dataPointer = 0;
    let inputPointer = 0;

    for (let steps = 1; steps <= MAX_STEPS; steps += 1) {
      const currentCell = memory[codePointer];
      if (currentCell < 33 || currentCell > 126) {
        return {
          output: decoder.decode(Uint8Array.from(output)),
          steps,
          error: `Execution reached an invalid instruction cell at address ${codePointer}.`,
        };
      }

      const instruction = decodeInstruction(currentCell, codePointer);
      const dataCell = memory[dataPointer];

      if (instruction === "i") {
        codePointer = dataCell;
      } else if (instruction === "<") {
        output.push(accumulator % 256);
      } else if (instruction === "/") {
        accumulator = inputPointer < input.length ? input[inputPointer] : 59048;
        inputPointer += 1;
      } else if (instruction === "*") {
        accumulator = memory[dataPointer] =
          (Math.floor(dataCell / 3) + (dataCell % 3) * 19683) % MEMORY_SIZE;
      } else if (instruction === "j") {
        dataPointer = dataCell;
      } else if (instruction === "p") {
        accumulator = memory[dataPointer] = crazy(accumulator, dataCell);
      } else if (instruction === "v") {
        return {
          output: decoder.decode(Uint8Array.from(output)),
          steps,
          error: "",
        };
      }

      if (memory[codePointer] < 33 || memory[codePointer] > 126) {
        return {
          output: decoder.decode(Uint8Array.from(output)),
          steps,
          error: `Instruction ${instruction} wrote an invalid code cell at address ${codePointer}.`,
        };
      }

      memory[codePointer] = XLAT2.charCodeAt(memory[codePointer] - 33);
      codePointer = (codePointer + 1) % MEMORY_SIZE;
      dataPointer = (dataPointer + 1) % MEMORY_SIZE;
    }

    return {
      output: decoder.decode(Uint8Array.from(output)),
      steps: MAX_STEPS,
      error: `Stopped after ${MAX_STEPS.toLocaleString()} steps without halting.`,
    };
  }

  function initializePlayground(playground) {
    if (playground.dataset.initialized === "true") {
      return;
    }
    playground.dataset.initialized = "true";

    const source = playground.querySelector("[data-malbolge-source]");
    const input = playground.querySelector("[data-malbolge-input]");
    const runButton = playground.querySelector("[data-malbolge-run]");
    const resetButton = playground.querySelector("[data-malbolge-reset]");
    const output = playground.querySelector("[data-malbolge-output] code");
    const status = playground.querySelector("[data-malbolge-status]");
    const initialSource = source.value;
    const initialStatus = status.textContent;

    function setStatus(message, isError = false) {
      status.textContent = message;
      status.classList.toggle("is-error", isError);
    }

    runButton.addEventListener("click", () => {
      try {
        const result = runProgram(source.value, input.value);
        output.textContent = result.output;

        if (result.error) {
          setStatus(`${result.error} Executed ${result.steps.toLocaleString()} steps.`, true);
        } else {
          setStatus(`Halted after ${result.steps.toLocaleString()} VM steps.`);
        }
      } catch (error) {
        output.textContent = "";
        setStatus(error instanceof Error ? error.message : String(error), true);
      }
    });

    resetButton.addEventListener("click", () => {
      source.value = initialSource;
      input.value = "";
      output.textContent = "";
      setStatus(initialStatus);
    });
  }

  function boot() {
    document.querySelectorAll("[data-malbolge-demo]").forEach(initializePlayground);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
