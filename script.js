
// ==========================================
// 1. MATHEMATICAL OPERATIONS
// ==========================================

// Adds two numbers
function add(a, b) {
    return a + b;
}

// Subtracts the second number from the first
function subtract(a, b) {
    return a - b;
}

// Multiplies two numbers
function multiply(a, b) {
    return a * b;
}

// Divides two numbers
function divide(a, b) {
    if (b === 0) return null;
    return a / b;
}


// ==========================================
// 2. OPERATION SELECTOR
// ==========================================

function operate(operator, a, b) {
    switch (operator) {
        case "+":
            return add(a, b);

        case "-":
            return subtract(a, b);

        case "*":
            return multiply(a, b);

        case "/":
            return divide(a, b);

        default:
            return null;
    }
}


// ==========================================
// 3. CALCULATOR STATE
// ==========================================

// Stores the current number displayed
let displayValue = "0";

// Stores the first number in an operation
let firstOperand = null;

// Stores the selected mathematical operator
let selectedOperator = null;

// Determines whether the next digit starts a new number
let waitingForSecondOperand = false;

// Tracks whether the last action produced a result
let justEvaluated = false;


// ==========================================
// 4. DOM ELEMENTS
// ==========================================

const display = document.querySelector("#display");
const buttons = document.querySelector(".buttons");


// ==========================================
// 5. DISPLAY FUNCTIONS
// ==========================================

// Updates the calculator display
function updateDisplay() {
    display.textContent = displayValue;
}

// Formats results to avoid excessively long decimals
function formatResult(number) {
    if (!Number.isFinite(number)) {
        return "Error";
    }

    if (Math.abs(number) < 1e21) {
        return String(Number(number.toFixed(10)));
    }

    return String(Number(number.toPrecision(12)));
}


// ==========================================
// 6. NUMBER INPUT
// ==========================================

function inputDigit(digit) {
    // Start a fresh calculation after an error
    if (displayValue === "Error" ||
        displayValue === "Nice try! Division by zero.") {
        clearCalculator();
    }

    // Start a new calculation after pressing equals
    if (justEvaluated) {
        displayValue = digit;
        justEvaluated = false;
        updateDisplay();
        return;
    }

    // Start entering the second operand
    if (waitingForSecondOperand) {
        displayValue = digit;
        waitingForSecondOperand = false;
    } else {
        // Prevent unnecessary leading zeros
        displayValue = displayValue === "0"
            ? digit
            : displayValue + digit;
    }

    updateDisplay();
}


// ==========================================
// 7. DECIMAL INPUT
// ==========================================

function inputDecimal() {
    if (displayValue === "Error" ||
        displayValue === "Nice try! Division by zero.") {
        clearCalculator();
    }

    // Start a fresh number after a calculation
    if (justEvaluated) {
        displayValue = "0.";
        justEvaluated = false;
        updateDisplay();
        return;
    }

    // Start the second operand with a decimal
    if (waitingForSecondOperand) {
        displayValue = "0.";
        waitingForSecondOperand = false;
        updateDisplay();
        return;
    }

    // Prevent multiple decimal points
    if (!displayValue.includes(".")) {
        displayValue += ".";
        updateDisplay();
    }
}


// ==========================================
// 8. CALCULATE RESULTS
// ==========================================

function calculate() {
    // Do nothing if the operation is incomplete
    if (
        selectedOperator === null ||
        firstOperand === null ||
        waitingForSecondOperand
    ) {
        return;
    }

    const secondOperand = Number(displayValue);

    // Handle division by zero
    if (selectedOperator === "/" && secondOperand === 0) {
        displayValue = "Nice try! Division by zero.";

        firstOperand = null;
        selectedOperator = null;
        waitingForSecondOperand = false;
        justEvaluated = true;

        updateDisplay();
        return;
    }

    const result = operate(
        selectedOperator,
        firstOperand,
        secondOperand
    );

    displayValue = formatResult(result);

    // Reset the operation state
    firstOperand = null;
    selectedOperator = null;
    waitingForSecondOperand = false;
    justEvaluated = true;

    updateDisplay();
}


// ==========================================
// 9. OPERATOR INPUT
// ==========================================

function inputOperator(nextOperator) {
    if (
        displayValue === "Error" ||
        displayValue === "Nice try! Division by zero."
    ) {
        return;
    }

    const inputValue = Number(displayValue);

    // If an operator already exists and the second
    // number has been entered, calculate first.
    if (
        selectedOperator !== null &&
        !waitingForSecondOperand
    ) {
        calculate();

        // Stop if the previous calculation produced an error
        if (displayValue === "Error" ||
            displayValue === "Nice try! Division by zero.") {
            return;
        }

        firstOperand = Number(displayValue);
    } else if (firstOperand === null) {
        firstOperand = inputValue;
    }

    // Consecutive operators simply replace the previous one
    selectedOperator = nextOperator;

    waitingForSecondOperand = true;
    justEvaluated = false;
}


// ==========================================
// 10. CLEAR CALCULATOR
// ==========================================

function clearCalculator() {
    displayValue = "0";
    firstOperand = null;
    selectedOperator = null;
    waitingForSecondOperand = false;
    justEvaluated = false;

    updateDisplay();
}


// ==========================================
// 11. BACKSPACE
// ==========================================

function backspace() {
    // Ignore backspace after a completed calculation
    // or when the display contains an error
    if (justEvaluated ||
        displayValue === "Error" ||
        displayValue === "Nice try! Division by zero.") {
        return;
    }

    // Do not erase the first operand while waiting
    // for the second operand
    if (waitingForSecondOperand) {
        return;
    }

    // Remove the last entered character
    displayValue = displayValue.length > 1
        ? displayValue.slice(0, -1)
        : "0";

    // Handle negative numbers
    if (displayValue === "-") {
        displayValue = "0";
    }

    updateDisplay();
}


// ==========================================
// 12. BUTTON EVENT LISTENER
// ==========================================

// One event listener handles all calculator buttons
buttons.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) return;

    // Handle number buttons
    if (button.dataset.digit !== undefined) {
        inputDigit(button.dataset.digit);
        return;
    }

    // Handle operator buttons
    if (button.dataset.operator !== undefined) {
        inputOperator(button.dataset.operator);
        return;
    }

    // Handle special action buttons
    switch (button.dataset.action) {
        case "clear":
            clearCalculator();
            break;

        case "backspace":
            backspace();
            break;

        case "decimal":
            inputDecimal();
            break;

        case "equals":
            calculate();
            break;
    }
});


// ==========================================
// 13. KEYBOARD SUPPORT
// ==========================================

document.addEventListener("keydown", (event) => {
    const key = event.key;

    // Number keys
    if (key >= "0" && key <= "9") {
        inputDigit(key);
        return;
    }

    // Mathematical operators
    if (["+", "-", "*", "/"].includes(key)) {
        inputOperator(key);
        return;
    }

    // Decimal point
    if (key === ".") {
        inputDecimal();
        return;
    }

    // Calculate using Enter or =
    if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
        return;
    }

    // Backspace
    if (key === "Backspace") {
        event.preventDefault();
        backspace();
        return;
    }

    // Clear calculator using Escape
    if (key === "Escape") {
        clearCalculator();
    }
});


// ==========================================
// 14. INITIALIZE CALCULATOR
// ==========================================

updateDisplay();
