// Validators section
function isInvalid(guess) {
    if (guess.includes('')) {
        return true;
    }
    if (!dictionary.includes(guess.join(""))) {
        return true;
    }
    return false;
}
// Validators section end

// Listeners section
function assignInputListeners(inputs) {
    inputs.forEach((input, index) => {
        input.addEventListener('keydown', (e) => {
            if (e.repeat) {
                return;
            }

            if (e.key === 'ArrowRight') {
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            } else if (e.key === 'ArrowLeft') {
                if (index > 0) {
                    inputs[index - 1].focus();
                }
            } else if (e.key === 'Backspace') {
                if (!input.value && index > 0) {
                    inputs[index - 1].focus();
                } else {
                    input.value = ''
                }
            } else if (!/^[а-яА-Я]$/.test(e.key)) {
                e.preventDefault();
            } else {
                input.value = ''
            }
        })

        input.addEventListener('input', (e) => {
            let newValue = input.value.toUpperCase();

            if (input.value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }

            if (input.value.length > 1) {
                newValue = newValue.slice(-1);
            }

            input.value = newValue;
        });
    });
}

function assignSubmitButtonListener(submitButton, activeInputs) {
    submitButton.addEventListener('click', () => {
        initGameSate();
        nextStep();
    });
}

let submitButtonEventListener = () => { };
function assignReturnButton(activeInputs) {
    document.removeEventListener('keydown', submitButtonEventListener);

    submitButtonEventListener = (e) => {
        if (e.repeat) {
            return;
        }

        if (e.which === 13) {
            processInputs(activeInputs);
        }
    };

    document.addEventListener('keydown', submitButtonEventListener);
}

function processInputs(activeInputs) {
    const guess = [];

    activeInputs.forEach(e => {
        guess.push(e.value);
    });
    if (isInvalid(guess)) {
        shake(activeInputs);
        return;
    }
    if (guess.toString() === gameState.hiddenWord.toString()) {
        gameState.state = 'win';
    }

    gameState.attempts[gameState.stepNumber] = guess;

    nextStep();
}
// Listeners section end

//Init region
let gameState = {};
function initGameSate() {
    gameState = {
        hiddenWord: [...dictionary[Math.floor((Math.random() * dictionary.length))]],
        attempts: [
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
        ],
        stepNumber: -1,
        maxSteps: 6,
        state: 'running' //win, lose
    }
}
//Init region end

function nextStep() {
    gameState.stepNumber++;

    if (gameState.stepNumber >= gameState.maxSteps && gameState.state !== 'win') {
        gameState.state = 'lose';
    }

    clearScreen();

    const container = document.getElementById("container");

    if (gameState.state === 'win') {
        container.appendChild(createWin());
    } else if (gameState.state === 'lose') {
        container.appendChild(createLose());
    }

    const activeInputs = [];
    gameState.attempts.forEach((row, rowIndex) => {
        const rowContainer = createRow(rowIndex);
        container.appendChild(rowContainer);

        const inputBoxes = row.map((rowElement, colIndex) => {
            return createInput(rowIndex, colIndex, rowElement);
        });
        inputBoxes.forEach((inputBox, index) => {
            rowContainer.appendChild(inputBox);
            if (index === 0 && rowIndex === gameState.stepNumber && gameState.state === 'running') {
                inputBox.focus();
            }
            if (rowIndex == gameState.stepNumber) {
                activeInputs.push(inputBox)
            }
        });
        if (rowIndex === gameState.stepNumber && gameState.state === 'running') {
            assignInputListeners(inputBoxes);
        }
    });

    if (gameState.state === 'running') {
        assignReturnButton(activeInputs);
    } else {
        const submitButton = createSubmitButton();
        container.appendChild(submitButton);
        assignSubmitButtonListener(submitButton, activeInputs);
    }
}

// Drawing region
function clearScreen() {
    document.getElementById("container").innerHTML = '';
}

function createWin() {
    const node = document.createElement("div");
    node.className = "win";
    node.innerText = "ПОБЕДА";
    return node;
}

function createLose() {
    const node = document.createElement("div");
    node.className = "lose";
    node.innerText = gameState.hiddenWord.join("");
    return node;
}

function createRow(index) {
    const node = document.createElement("div");
    node.className = "input-container";
    node.setAttribute("id", `input-container-${index}`);
    return node;
}

function createInput(rowIndex, colIndex, text) {
    const node = document.createElement("input");
    if (rowIndex !== gameState.stepNumber) {
        node.readOnly = true;
    }
    node.className = getClassForInput(rowIndex, colIndex);
    node.setAttribute("id", `input-${rowIndex}-${colIndex}`);
    node.setAttribute("value", text)
    return node;
}

function getClassForInput(row, col, text) {
    if (gameState.stepNumber < row) {
        return "input-box inactive-box before-guess";
    } else if (gameState.stepNumber == row && gameState.state === 'running') {
        return "input-box active-box";
    } else if (gameState.stepNumber == row && gameState.state === 'win') {
        return "input-box inactive-box before-guess";
    } else if (gameState.attempts[row][col] === gameState.hiddenWord[col]) {
        return "input-box inactive-box full-guess";
    } else if (gameState.hiddenWord.includes(gameState.attempts[row][col])) {
        return "input-box inactive-box part-guess";
    } else {
        return "input-box inactive-box wrong-guess";
    }
}

function createSubmitButton() {
    const node = document.createElement("button");
    node.className = "submit-button"
    node.setAttribute("id", "submit-button");
    node.innerHTML = "Еще раз";
    return node;
}

function shake(elements) {
    elements.forEach(e => {
        e.classList.add('shake');
        setTimeout(() => {
            e.classList.remove('shake');
        }, 500);
    });
}
// Drawing region END

document.addEventListener('DOMContentLoaded', () => {
    initGameSate();
    nextStep();
});