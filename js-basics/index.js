const display = document.getElementById('display');
let currentInput = '';
let previousInput = '';
let operation = null;

// Handle digit and decimal button clicks
document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('click', () => {
        const value = button.getAttribute('data-value');
        if (value === null) return;

        if (value === 'C') {
            clearDisplay();
        } else if (value === '=') {
            calculateResult();
        } else if (['+', '-', '*', '/'].includes(value)) {
            setOperation(value);
        } else {
            appendToDisplay(value);
        }
    });
});

function appendToDisplay(value) {
    if (value === '.' && currentInput.includes('.')) return; // Prevent multiple decimals
    currentInput += value;
    updateDisplay(currentInput);
}

function setOperation(op) {
    if (currentInput === '') return;
    if (previousInput !== '') calculateResult();
    operation = op;
    previousInput = currentInput;
    currentInput = '';
}

function calculateResult() {
    if (operation === null || currentInput === '' || previousInput === '') return;
    const num1 = parseFloat(previousInput);
    const num2 = parseFloat(currentInput);
    let result;

    switch (operation) {
        case '+':
            result = num1 + num2;
            break;
        case '-':
            result = num1 - num2;
            break;
        case '*':
            result = num1 * num2;
            break;
        case '/':
            result = num2 !== 0 ? num1 / num2 : 'Error';
            break;
        default:
            return;
    }

    currentInput = result.toString();
    operation = null;
    previousInput = '';
    updateDisplay(currentInput);
}

function clearDisplay() {
    currentInput = '';
    previousInput = '';
    operation = null;
    updateDisplay('');
}

function updateDisplay(value) {
    display.value = value;
}