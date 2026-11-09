// ---------- Elements ----------
const screen = document.getElementById("screen");
const history = document.getElementById("history");

// ---------- Memory of the calculator ----------
let previousValue = null;   // the first number (stored when an operator is clicked)
let operator = null;        // "+", "-", "*" or "/"
let waitingForNewNumber = false; // true right after clicking an operator or "="
let hasError = false;       // true after something like a division by zero


// ---------- Functions ----------

// Do the math for two numbers
function calculate(a, b, op) {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") {
    if (b === 0) return "Error";   // division by zero
    return a / b;
  }
}

// Turn the operator into the symbol we show on screen
function symbolFor(op) {
  if (op === "*") return "×";
  if (op === "/") return "÷";
  if (op === "-") return "−";
  return op;
}

// Reset everything
function clearAll() {
  screen.textContent = "0";
  history.textContent = "";
  previousValue = null;
  operator = null;
  waitingForNewNumber = false;
  hasError = false;
}

// Show an error message
function showError() {
  screen.textContent = "Can't divide by 0";
  history.textContent = "";
  previousValue = null;
  operator = null;
  hasError = true;
}

// Compute previousValue (operator) screen and return the result
// (returns "Error" if it can't be calculated)
function computeResult() {
  const currentValue = Number(screen.textContent);
  let result = calculate(previousValue, currentValue, operator);

  if (result !== "Error") {
    // removes tiny rounding errors, so 0.1 + 0.2 shows 0.3
    result = parseFloat(result.toFixed(10));
  }
  return result;
}


// ---------- Button handlers ----------

function handleDigit(digit) {
  if (hasError) clearAll();

  if (waitingForNewNumber || screen.textContent === "0") {
    screen.textContent = digit;      // start a new number
    waitingForNewNumber = false;
  } else if (screen.textContent.length < 12) {
    screen.textContent = screen.textContent + digit; // keep typing the same number
  }
}

function handleDecimal() {
  if (hasError) clearAll();

  if (waitingForNewNumber) {
    screen.textContent = "0.";
    waitingForNewNumber = false;
  } else if (!screen.textContent.includes(".")) {
    screen.textContent = screen.textContent + ".";
  }
}

function handleOperator(newOperator) {
  if (hasError) return;

  // If there is already a pending operation (like 2 + 3 then ×), finish it first
  if (operator !== null && !waitingForNewNumber) {
    const result = computeResult();
    if (result === "Error") {
      showError();
      return;
    }
    screen.textContent = result;
  }

  previousValue = Number(screen.textContent);
  operator = newOperator;
  waitingForNewNumber = true;
  history.textContent = previousValue + " " + symbolFor(operator);
}

function handleEquals() {
  if (hasError || operator === null || waitingForNewNumber) return;

  const secondNumber = screen.textContent;
  const result = computeResult();

  if (result === "Error") {
    showError();
    return;
  }

  history.textContent = previousValue + " " + symbolFor(operator) + " " + secondNumber + " =";
  screen.textContent = result;
  previousValue = null;
  operator = null;
  waitingForNewNumber = true;
}


// ---------- Connect the buttons (DOM events) ----------

// digits 0-9
const digitButtons = document.querySelectorAll("[data-digit]");
for (let i = 0; i < digitButtons.length; i++) {
  digitButtons[i].addEventListener("click", function () {
    handleDigit(digitButtons[i].dataset.digit);
  });
}

// + - * /
const operatorButtons = document.querySelectorAll("[data-operator]");
for (let i = 0; i < operatorButtons.length; i++) {
  operatorButtons[i].addEventListener("click", function () {
    handleOperator(operatorButtons[i].dataset.operator);
  });
}

// ".", "=" and "C"
document.getElementById("decimal").addEventListener("click", handleDecimal);
document.getElementById("equals").addEventListener("click", handleEquals);
document.getElementById("clear").addEventListener("click", clearAll);
