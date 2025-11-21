
let playerName = '';
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let correctAnswers = 0;
let timer;
let timeLeft = 20;
let selectedOption = null;

const screens = {
    config: document.getElementById('config-screen'),
    loading: document.getElementById('loading-screen'),
    game: document.getElementById('game-screen'),
    results: document.getElementById('results-screen')
};

const elements = {
    playerName: document.getElementById('player-name'),
    questionCount: document.getElementById('question-count'),
    difficulty: document.getElementById('difficulty'),
    category: document.getElementById('category'),
    startGameBtn: document.getElementById('start-game-btn'),
    currentPlayer: document.getElementById('current-player'),
    currentScore: document.getElementById('current-score'),
    progress: document.getElementById('progress'),
    questionText: document.getElementById('question-text'),
    optionsContainer: document.getElementById('options-container'),
    gameFeedback: document.getElementById('game-feedback'),
    nextQuestionBtn: document.getElementById('next-question-btn'),
    timeLeft: document.getElementById('time-left'),
    timerProgress: document.getElementById('timer-progress'),
    finalScore: document.getElementById('final-score'),
    correctAnswers: document.getElementById('correct-answers'),
    accuracyRate: document.getElementById('accuracy-rate'),
    resultPlayerName: document.getElementById('result-player-name'),
    playAgainBtn: document.getElementById('play-again-btn'),
    newConfigBtn: document.getElementById('new-config-btn'),
    exitGameBtn: document.getElementById('exit-game-btn')
};

function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });

    screens[screenName].classList.add('active');
}

function validateConfig() {
    const name = elements.playerName.value.trim();
    
    if (name.length < 2 || name.length > 20) {
        alert('El nombre debe tener entre 2 y 20 caracteres');
        return false;
    }
    
    const questionCount = parseInt(elements.questionCount.value);
    if (questionCount < 5 || questionCount > 20) {
        alert('La cantidad de preguntas debe ser entre 5 y 20');
        return false;
    }
    
    return true;
}

function startGame(event) {
    event.preventDefault();
    
    if (!validateConfig()) {
        return;
    }
    
    playerName = elements.playerName.value.trim();
    elements.currentPlayer.textContent = playerName;
    
    showScreen('loading');
    
    setTimeout(() => {
        loadQuestions();
        showScreen('game');
        showQuestion();
    }, 2000);
}


function loadQuestions() {
    questions = [
        {
            question: "¿Cuál es la capital de Francia?",
            correct_answer: "París",
            incorrect_answers: ["Londres", "Berlín", "Madrid"],
            category: "Geografía",
            difficulty: "easy"
        },
        {
            question: "¿En qué año llegó el hombre a la luna?",
            correct_answer: "1969",
            incorrect_answers: ["1955", "1975", "1980"],
            category: "Historia",
            difficulty: "medium"
        }
    ];
}

function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }
    
    const question = questions[currentQuestionIndex];
    
    elements.progress.textContent = `${currentQuestionIndex + 1}/${questions.length}`;

    elements.questionText.textContent = question.question;

    elements.optionsContainer.innerHTML = '';

    const options = [...question.incorrect_answers, question.correct_answer];
    shuffleArray(options);
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.addEventListener('click', () => selectOption(option, question.correct_answer));
        elements.optionsContainer.appendChild(button);
    });

    selectedOption = null;
    elements.nextQuestionBtn.disabled = true;
    elements.gameFeedback.textContent = '';
    elements.gameFeedback.className = 'game-feedback';
    
    startTimer();
}

// Función para mezclar array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Función para seleccionar una opción
function selectOption(selected, correct) {
    if (selectedOption !== null) return;
    
    selectedOption = selected;
    
    // Deshabilitar todas las opciones
    const optionButtons = elements.optionsContainer.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correct) {
            btn.classList.add('correct');
        }
    });
    
    // Marcar la seleccionada
    optionButtons.forEach(btn => {
        if (btn.textContent === selected) {
            if (selected === correct) {
                btn.classList.add('correct');
                handleCorrectAnswer();
            } else {
                btn.classList.add('incorrect');
                handleIncorrectAnswer();
            }
        }
    });
    
    // Detener temporizador
    clearInterval(timer);
    
    // Habilitar botón siguiente
    elements.nextQuestionBtn.disabled = false;
}

// Función para manejar respuesta correcta
function handleCorrectAnswer() {
    score += 10;
    correctAnswers++;
    elements.currentScore.textContent = score;
    elements.gameFeedback.textContent = '¡Correcto! +10 puntos';
    elements.gameFeedback.className = 'game-feedback feedback-correct';
}

// Función para manejar respuesta incorrecta
function handleIncorrectAnswer() {
    elements.gameFeedback.textContent = 'Incorrecto. Sigue intentando.';
    elements.gameFeedback.className = 'game-feedback feedback-incorrect';
}

function startTimer() {
    timeLeft = 20;
    elements.timeLeft.textContent = timeLeft;
    elements.timerProgress.style.width = '100%';
    
    timer = setInterval(() => {
        timeLeft--;
        elements.timeLeft.textContent = timeLeft;
        elements.timerProgress.style.width = `${(timeLeft / 20) * 100}%`;
        
        if (timeLeft <= 5) {
            elements.timer.classList.add('warning');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeUp();
        }
    }, 1000);
}

function handleTimeUp() {
    if (selectedOption === null) {
        const question = questions[currentQuestionIndex];
        const optionButtons = elements.optionsContainer.querySelectorAll('.option-btn');
        
        optionButtons.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === question.correct_answer) {
                btn.classList.add('correct');
            }
        });
        
        elements.gameFeedback.textContent = '¡Tiempo agotado!';
        elements.gameFeedback.className = 'game-feedback feedback-incorrect';
        elements.nextQuestionBtn.disabled = false;
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    showQuestion();
}

function endGame() {
    elements.finalScore.textContent = score;
    elements.correctAnswers.textContent = `${correctAnswers}/${questions.length}`;
    elements.accuracyRate.textContent = `${Math.round((correctAnswers / questions.length) * 100)}%`;
    elements.resultPlayerName.textContent = playerName;
    
    showScreen('results');
}

function resetGame() {
    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = 0;
    elements.currentScore.textContent = '0';
    showScreen('game');
    showQuestion();
}

function backToConfig() {
    resetGame();
    showScreen('config');
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('game-config').addEventListener('submit', startGame);
    
    elements.nextQuestionBtn.addEventListener('click', nextQuestion);
    
    elements.playAgainBtn.addEventListener('click', resetGame);
    elements.newConfigBtn.addEventListener('click', backToConfig);
    elements.exitGameBtn.addEventListener('click', function() {
        alert('¡Gracias por jugar!');
        backToConfig();
    });
    
    elements.playerName.addEventListener('input', function() {
        const name = this.value.trim();
        if (name.length < 2 || name.length > 20) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#2ecc71';
        }
    });
});

function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}