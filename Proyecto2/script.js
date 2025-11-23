let playerName = '';
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let correctAnswers = 0;
let timer;
let timeLeft = 20;
let selectedOption = null;
let totalTimeSpent = 0;
let gameStartTime = 0;
let questionStartTime = 0;

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
    timer: document.getElementById('timer'),
    finalScore: document.getElementById('final-score'),
    correctAnswers: document.getElementById('correct-answers'),
    accuracyRate: document.getElementById('accuracy-rate'),
    resultPlayerName: document.getElementById('result-player-name'),
    playAgainBtn: document.getElementById('play-again-btn'),
    newConfigBtn: document.getElementById('new-config-btn'),
    exitGameBtn: document.getElementById('exit-game-btn'),
    questionCategory: document.getElementById('question-category'),
    questionDifficulty: document.getElementById('question-difficulty'),
    resultCategory: document.getElementById('result-category'),
    resultDifficulty: document.getElementById('result-difficulty'),
    resultTotalQuestions: document.getElementById('result-total-questions'),
    resultTotalTime: document.getElementById('result-total-time'),
    averageTime: document.getElementById('average-time'),
    loadingCategory: document.getElementById('loading-category'),
    loadingDifficulty: document.getElementById('loading-difficulty'),
    loadingCount: document.getElementById('loading-count'),
    retryBtn: document.getElementById('retry-btn'),
    configModalBtn: document.getElementById('config-modal-btn'),
    errorModal: document.getElementById('error-modal')
};

const categoryMap = {
    '9': 'Conocimiento General',
    '11': 'Entretenimiento: Cine',
    '17': 'Ciencia y Naturaleza',
    '22': 'Geografía',
    '23': 'Historia',
    '25': 'Arte'
};

const apiCategoryMap = {
    'General Knowledge': '9',
    'Entertainment: Film': '11',
    'Science & Nature': '17',
    'Geography': '22',
    'History': '23',
    'Art': '25'
};

function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    screens[screenName].classList.add('active');
}

function validateConfig() {
    const name = elements.playerName.value.trim();
    const nameError = document.getElementById('name-error');
    
    if (name.length < 2 || name.length > 20) {
        nameError.textContent = 'El nombre debe tener entre 2 y 20 caracteres';
        return false;
    }
    
    nameError.textContent = '';
    const questionCount = parseInt(elements.questionCount.value);
    if (questionCount < 5 || questionCount > 20) {
        alert('La cantidad de preguntas debe ser entre 5 y 20');
        return false;
    }
    
    return true;
}

async function startGame(event) {
    event.preventDefault();
    
    if (!validateConfig()) {
        return;
    }
    
    playerName = elements.playerName.value.trim();
    elements.currentPlayer.textContent = playerName;
    
    showScreen('loading');

    const categoryText = elements.category.options[elements.category.selectedIndex].text;
    const difficultyText = elements.difficulty.options[elements.difficulty.selectedIndex].text;
    const questionCount = elements.questionCount.value;
    
    elements.loadingCategory.textContent = `Categoría: ${categoryText}`;
    elements.loadingDifficulty.textContent = `Dificultad: ${difficultyText}`;
    elements.loadingCount.textContent = `Preguntas: ${questionCount}`;
    
    try {
        await loadQuestionsFromAPI();
        gameStartTime = Date.now();
        showScreen('game');
        showQuestion();
    } catch (error) {
        console.error('Error al cargar preguntas:', error);
        showErrorModal('No se pudieron cargar las preguntas. Por favor, intenta de nuevo.');
    }
}

async function loadQuestionsFromAPI() {
    const questionCount = elements.questionCount.value;
    const difficulty = elements.difficulty.value;
    const category = elements.category.value;

    let apiUrl = `https://opentdb.com/api.php?amount=${questionCount}&type=multiple`;
    
    if (category !== 'any') {
        apiUrl += `&category=${category}`;
    }
    
    if (difficulty !== 'any') {
        apiUrl += `&difficulty=${difficulty}`;
    }
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.response_code === 0) {
            questions = data.results;
        } else {
            if (category !== 'any') {
                console.warn('Error con categoría específica, intentando con categoría aleatoria');
                let fallbackUrl = `https://opentdb.com/api.php?amount=${questionCount}&type=multiple`;
                if (difficulty !== 'any') {
                    fallbackUrl += `&difficulty=${difficulty}`;
                }
                
                const fallbackResponse = await fetch(fallbackUrl);
                const fallbackData = await fallbackResponse.json();
                
                if (fallbackData.response_code === 0) {
                    questions = fallbackData.results;
                } else {
                    throw new Error('No se pudieron cargar las preguntas de la API');
                }
            } else {
                throw new Error('No se pudieron cargar las preguntas de la API');
            }
        }
    } catch (error) {
        throw new Error('Error de conexión: ' + error.message);
    }
}

function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }
    
    const question = questions[currentQuestionIndex];
    questionStartTime = Date.now();
    
    elements.progress.textContent = `${currentQuestionIndex + 1}/${questions.length}`;
    elements.questionText.textContent = decodeHTML(question.question);

    elements.questionCategory.textContent = getCategoryName(question.category);
    elements.questionDifficulty.textContent = getDifficultyName(question.difficulty);
    
    elements.optionsContainer.innerHTML = '';
    
    const options = [...question.incorrect_answers, question.correct_answer];
    shuffleArray(options);
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = decodeHTML(option);
        button.addEventListener('click', () => selectOption(option, question.correct_answer));
        elements.optionsContainer.appendChild(button);
    });

    selectedOption = null;
    elements.nextQuestionBtn.disabled = true;
    elements.gameFeedback.textContent = '';
    elements.gameFeedback.className = 'game-feedback';
    
    startTimer();
}

function getCategoryName(apiCategory) {
    if (apiCategoryMap[apiCategory]) {
        return categoryMap[apiCategoryMap[apiCategory]];
    }
    return apiCategory;
}

function getDifficultyName(difficulty) {
    const difficultyMap = {
        'easy': 'Fácil',
        'medium': 'Medio',
        'hard': 'Difícil'
    };
    return difficultyMap[difficulty] || difficulty;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function selectOption(selected, correct) {
    if (selectedOption !== null) return;
    
    selectedOption = selected;

    const questionTime = (Date.now() - questionStartTime) / 1000;
    totalTimeSpent += questionTime;

    const optionButtons = elements.optionsContainer.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        btn.disabled = true;
        if (decodeHTML(btn.textContent) === correct) {
            btn.classList.add('correct');
        }
    });
    
    optionButtons.forEach(btn => {
        if (decodeHTML(btn.textContent) === selected) {
            if (selected === correct) {
                btn.classList.add('correct');
                handleCorrectAnswer();
            } else {
                btn.classList.add('incorrect');
                handleIncorrectAnswer();
            }
        }
    });

    clearInterval(timer);

    elements.nextQuestionBtn.disabled = false;
}

function handleCorrectAnswer() {
    score += 10;
    correctAnswers++;
    elements.currentScore.textContent = score;
    elements.gameFeedback.textContent = '¡Correcto! +10 puntos';
    elements.gameFeedback.className = 'game-feedback feedback-correct';
}

function handleIncorrectAnswer() {
    elements.gameFeedback.textContent = 'Incorrecto. Sigue intentando.';
    elements.gameFeedback.className = 'game-feedback feedback-incorrect';
}

function startTimer() {
    timeLeft = 20;
    elements.timeLeft.textContent = timeLeft;
    elements.timerProgress.style.width = '100%';
    elements.timer.classList.remove('warning');
    
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
        totalTimeSpent += 20;
        
        const question = questions[currentQuestionIndex];
        const optionButtons = elements.optionsContainer.querySelectorAll('.option-btn');
        
        optionButtons.forEach(btn => {
            btn.disabled = true;
            if (decodeHTML(btn.textContent) === question.correct_answer) {
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
    const totalTime = (Date.now() - gameStartTime) / 1000;
    const averageTime = totalTimeSpent / questions.length;
    
    elements.finalScore.textContent = score;
    elements.correctAnswers.textContent = `${correctAnswers}/${questions.length}`;
    elements.accuracyRate.textContent = `${Math.round((correctAnswers / questions.length) * 100)}%`;
    elements.averageTime.textContent = `${averageTime.toFixed(1)}s`;
    elements.resultPlayerName.textContent = playerName;

    const categoryText = elements.category.options[elements.category.selectedIndex].text;
    const difficultyText = elements.difficulty.options[elements.difficulty.selectedIndex].text;
    elements.resultCategory.textContent = categoryText;
    elements.resultDifficulty.textContent = difficultyText;
    elements.resultTotalQuestions.textContent = questions.length;
    elements.resultTotalTime.textContent = `${totalTime.toFixed(1)}s`;
    
    showScreen('results');
}

function resetGame() {
    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = 0;
    totalTimeSpent = 0;
    elements.currentScore.textContent = '0';
    
    showScreen('game');
    showQuestion();
}

function backToConfig() {
    resetGame();
    showScreen('config');
}

function showErrorModal(message) {
    document.getElementById('error-message').textContent = message;
    elements.errorModal.classList.add('active');
}

function hideErrorModal() {
    elements.errorModal.classList.remove('active');
}

function decodeHTML(html) {
    if (!html) return '';

    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    let decoded = txt.value;
    
    // Luego decodificar URL encoding (como %20, %C3%A1, etc.)
    try {
        decoded = decodeURIComponent(decoded.replace(/\+/g, ' '));
    } catch (e) {
        // Si falla la decodificación URL, mantener el texto decodificado de HTML
        console.warn('Error decoding URL, using HTML decoded version:', e);
    }
    
    return decoded;
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
        const nameError = document.getElementById('name-error');
        
        if (name.length < 2 || name.length > 20) {
            this.style.borderColor = '#e74c3c';
            nameError.textContent = 'El nombre debe tener entre 2 y 20 caracteres';
        } else {
            this.style.borderColor = '#2ecc71';
            nameError.textContent = '';
        }
    });
    
    elements.retryBtn.addEventListener('click', function() {
        hideErrorModal();
        showScreen('loading');
        loadQuestionsFromAPI()
            .then(() => {
                gameStartTime = Date.now();
                showScreen('game');
                showQuestion();
            })
            .catch(error => {
                showErrorModal('Error al cargar las preguntas: ' + error.message);
            });
    });
    
    elements.configModalBtn.addEventListener('click', function() {
        hideErrorModal();
        showScreen('config');
    });
});