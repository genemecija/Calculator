const calcDisplay = document.querySelector("#calcDisplay");
calcDisplay.textContent = "0";

const buttons = document.querySelectorAll(".calcButton");
const audio = document.querySelector("audio")

window.addEventListener("keydown", buttonWasPressed);
buttons.forEach(button => button.addEventListener("click", buttonWasPressed));
buttons.forEach(button =>
  button.addEventListener("transitionend", removeTransition)
);

let eq = {
  n1: null,
  operation: null,
  n2: null
};
let prevOp = {
  operation: null,
  n2: null
};

const add = (n1, n2) => n1 + n2;
const subtract = (n1, n2) => n1 - n2;
const multiply = (n1, n2) => n1 * n2;
const divide = (n1, n2) => n1 / n2;

const updateDisplay = num => {
  if (num == ".") {
    calcDisplay.textContent += ".";
    return;
  } else if (num == "0.") {
    calcDisplay.textContent = num;
    return;
  }
  if (!num) {
    calcDisplay.textContent = 0;
    return;
  }
  calcDisplay.textContent = String(num);
  // if (String(num).indexOf('e') != -1) {
  //     calcDisplay.textContent = String(num)
  //     return
  // } else {
  //     calcDisplay.textContent = String(Number(num))
  //     return
  // }
};
const clearPreviousOperation = function() {
  prevOp.n2 = null;
  prevOp.operation = null;
};
const clearButtonPressed = function() {
  if (eq.n1 && !eq.operation) {
    eq.n1 = null;
    updateDisplay(eq.n1);
  } else if (eq.n1 && eq.n2) {
    eq.n2 = null;
    updateDisplay(eq.n2);
  }
};
const allClearButtonPressed = function() {
  eq.n1 = null;
  eq.n2 = null;
  eq.operation = null;
  clearPreviousOperation();
  updateDisplay(eq.n1);
};
const backspacePressed = function() {
  if (eq.n1 && !eq.operation && !eq.n2 && !prevOp.n2) {
    eq.n1 = String(eq.n1).slice(0, -1);
    if (eq.n1 == "") {
      eq.n1 = 0;
    }
    updateDisplay(eq.n1);
  } else if (eq.n1 && eq.n2 && !prevOp.n2) {
    eq.n2 = String(eq.n2).slice(0, -1);
    if (eq.n2 == "") {
      eq.n2 = 0;
    }
    updateDisplay(eq.n2);
  }
};

const changeSignPressed = function() {
  clearPreviousOperation();
  if (!eq.n2 && !eq.operation) {
    eq.n1 *= -1;
    updateDisplay(eq.n1);
  } else if (eq.n1 && eq.operation) {
    eq.n2 *= -1;
    updateDisplay(eq.n2);
  }
};

function calculate(num1, num2, operation) {
  eq.n2 = Number(eq.n2);
  eq.n1 = operation(num1, num2);
  prevOp.n2 = eq.n2;
  prevOp.operation = eq.operation;
  eq.n2 = null;
  eq.operation = null;
  return formatForDisplay(eq.n1);
}

function operatorPressed(operator) {
  if (eq.n1 && eq.operation && eq.n2) {
    eq.n2 = Number(eq.n2);
    updateDisplay(calculate(eq.n1, eq.n2, eq.operation));
    eq.operation = operator;
  } else if (eq.n1) {
    eq.n1 = Number(eq.n1);
    eq.operation = operator;
    clearPreviousOperation();
  }
}

function formatForDisplay(num) {
  if (num == "0.") {
    return num;
  }
  let output = num;
  let isNegative = false;

  // If the if the length of the number is greater than the display length
  if (String(output).length > 10) {
    // If number is negative, make positive
    if (output < 0) {
      output *= -1;
      isNegative = true;
    }

    // Find location of '.'
    let decLocation = String(output).indexOf(".");
    if (decLocation == -1) {
      output = String(output) + ".";
      decLocation = String(output).indexOf(".");
    }

    // Get digits before decimal
    let digitsBeforeDecimal = String(output).slice(0, decLocation);
    // Set digits before decimal to a single non-zero digit
    let decShifts = 0;

    while (digitsBeforeDecimal == 0) {
      // For cases like 0.1234 or 0.0000245
      output *= 10;
      decLocation = String(output).indexOf(".");
      digitsBeforeDecimal = String(output).slice(0, decLocation);
      decShifts -= 1;
    }
    while (digitsBeforeDecimal >= 100000) {
      // For cases like 10.123456 or 24398234.23432
      output /= 10;
      decLocation = String(output).indexOf(".");
      digitsBeforeDecimal = String(output).slice(0, decLocation);
      decShifts += 1;
    }
    if (decShifts == 0) {
      if (isNegative) {
        output = Number(output) * -1;
      }
      output = Number(String(output).slice(0, 10));

      eq.n1 = output;
    } else {
      const spacer = isNegative ? 2 : 1;
      output = Number(
        String(output).slice(0, 10 - (spacer + String(decShifts).length))
      );
      // Change back to negative (if sign previously changed) before adding 'e' notation
      if (isNegative) {
        output = String(Number(output) * -1);
      }
      output += `e${decShifts}`;
    }
    return output;
  }

  return output;
}

// Removes 'pressed' state one transform completion
function removeTransition(e) {
  if (e.propertyName !== "transform") return;
  e.target.classList.remove("pressed");
}

// Main function for button presses
function buttonWasPressed(e) {
  // Play button click sound
  audio.currentTime = 0;
  audio.play();

  // This section adds the 'pressed' class to the triggering Element, causing the animation,
  // as well as setting the buttonPressed variable used in determining calculator functions to execute
  let key = null;
  let buttonPressed = null;

  // If a keyboard press was identified, set the key variable to equal an identifier
  if (e.key) {
    switch (e.key) {
      case "+":
        key = "add";
        break;
      case "Enter":
        key = "=";
        break;
      case "Escape":
        key = "allClear";
        break;
      default:
        key = e.key;
    }
    // Set the key to equal the div element matching the identifier
    key = document.querySelector(`div[id="${key}"]`);

    // Set the buttonPressed variable to the identifier if the key identifier matches the available calc button identifiers
    if (
      [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "+",
        "-",
        "*",
        "x",
        "/",
        "=",
        ".",
        "Escape",
        "Enter",
        "Backspace"
      ].includes(e.key) == true
    ) {
      buttonPressed = e.key;
    } else {
      return;
    }
  } else {
    // If no keyboard key-press was identified, set values based on the div that triggered the event
    key = e.target;
    buttonPressed = key.id;
  }
  key.classList.add("pressed");

  switch (buttonPressed) {
    case "":
      break;
    case "Backspace":
      backspacePressed();
      break;
    case "clear":
      clearButtonPressed();
      break;
    case "allClear":
    case "Escape":
      allClearButtonPressed();
      break;
    case "sign":
      changeSignPressed();
      break;
    case "add":
    case "+":
      operatorPressed(add);
      break;
    case "subtract":
    case "-":
      operatorPressed(subtract);
      break;
    case "multiply":
    case "*":
    case "x":
      operatorPressed(multiply);
      break;
    case "divide":
    case "/":
      operatorPressed(divide);
      break;
    case "equals":
    case "=":
    case "Enter":
      if (eq.n1 && eq.operation && eq.n2) {
        eq.n2 = Number(eq.n2);
        updateDisplay(calculate(eq.n1, eq.n2, eq.operation));
      } else if (
        eq.n1 &&
        !eq.operation &&
        !eq.n2 &&
        prevOp.n2 &&
        prevOp.operation
      ) {
        eq.n2 = prevOp.n2;
        eq.operation = prevOp.operation;
        clearPreviousOperation();
        updateDisplay(calculate(eq.n1, eq.n2, eq.operation));
      }
      break;
    default:
      if (prevOp.n2) {
        clearPreviousOperation();
        eq.n1 = null;
      }

      let currentDisplay = calcDisplay.textContent;

      // Accounts for the key ID of 'decimal'
      if (buttonPressed == "decimal" || buttonPressed == ".") {
        buttonPressed = ".";

        // Prevents multiple decimal points
        if (
          (currentDisplay.indexOf(".") != -1 && !eq.operation) ||
          (currentDisplay.indexOf(".") != -1 && eq.n2)
        ) {
          break;
        }
      }

      if (!eq.n1) {
        if (buttonPressed == ".") {
          buttonPressed = "0.";
        }
        eq.n1 = buttonPressed;
        updateDisplay(buttonPressed);
      } else if (eq.n1 && !eq.operation && String(eq.n1).length < 10) {
        if (currentDisplay == "0" && buttonPressed != ".") {
          eq.n1 = buttonPressed;
        } else {
          eq.n1 += buttonPressed;
        }
        updateDisplay(eq.n1);
      } else if (eq.n1 && eq.operation && !eq.n2) {
        if (buttonPressed == ".") {
          buttonPressed = "0.";
        }
        eq.n2 = buttonPressed;
        updateDisplay(buttonPressed);
      } else if (eq.n1 && eq.operation && eq.n2 && String(eq.n2).length < 10) {
        if (currentDisplay == "0" && buttonPressed != ".") {
          eq.n2 = buttonPressed;
        } else {
          eq.n2 += buttonPressed;
        }
        updateDisplay(eq.n2);
      }
      break;
  }
}
