// script.js

// --- Configuration ---
const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const API_BASE_URL = '/api';

// --- DOM Elements ---
const gameBoard = document.getElementById('game-board');
const feedbackPanel = document.getElementById('feedback-panel');
const currentGuessFeedback = document.getElementById('current-guess-feedback');
const submitFeedbackButton = document.getElementById('submit-feedback');
const loadingSpinner = document.getElementById('loading-spinner');
const remainingCandidatesSpan = document.getElementById('remaining-candidates');
const progressBar = document.getElementById('progress-bar');
const currentGuessNumberSpan = document.getElementById('current-guess-number');
const newGameButton = document.getElementById('new-game-button');
const toggleCandidatesButton = document.getElementById('toggle-candidates');
const candidatesListDiv = document.getElementById('candidates-list');
const victoryStateDiv = document.getElementById('victory-state');
const failureStateDiv = document.getElementById('failure-state');
const victoryGuessesCountSpan = document.getElementById('guesses-count-victory');
const solvedWordP = document.getElementById('solved-word');

// --- Game State ---
let currentGuessRow = 0;
let solverGuess = "";
let currentFeedbackPattern = []; // Array of 'B', 'Y', 'G' for the current solverGuess
let gameActive = false;
let totalInitialCandidates = 2309; // This will be updated after the first API call

// --- Starfield Animation ---
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];
const numStars = 500;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initStars() {
    stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.2,
            vx: Math.floor(Math.random() * 50) - 25,
            vy: Math.floor(Math.random() * 50) - 25,
            alpha: Math.random()
        });
    }
}

function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < numStars; i++) {
        let star = stars[i];

        star.x += star.vx * 0.005;
        star.y += star.vy * 0.005;
        star.alpha += (Math.random() - 0.5) * 0.02; // Subtle twinkle

        if (star.alpha > 1) star.alpha = 1;
        if (star.alpha < 0) star.alpha = 0;

        if (star.x < 0 || star.x > canvas.width) star.x = Math.random() * canvas.width;
        if (star.y < 0 || star.y > canvas.height) star.y = Math.random() * canvas.height;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();
    }
    requestAnimationFrame(animateStars);
}

window.addEventListener('resize', () => {
    resizeCanvas();
    initStars();
});

resizeCanvas();
initStars();
animateStars();


// --- Utility Functions ---
function show(element) {
    element.classList.remove('hidden');
}

function hide(element) {
    element.classList.add('hidden');
}

function createTile(letter = '', state = '') {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    if (state) {
        tile.classList.add(state);
    }
    tile.innerHTML = `<span>${letter}</span>`;
    return tile;
}

function updateProgressBar(remaining) {
    const progress = (remaining / totalInitialCandidates) * 100;
    progressBar.style.width = `${progress}%`;
}

function animateNumber(element, start, end, duration) {
    let startTime = null;
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));

    const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const value = Math.floor(progress * range) + start;
        element.textContent = value;
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = end;
        }
    };
    requestAnimationFrame(animate);
}

// --- Game Board Rendering ---
function renderGameBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < MAX_GUESSES; i++) {
        for (let j = 0; j < WORD_LENGTH; j++) {
            gameBoard.appendChild(createTile());
        }
    }
}

function fillGuessRow(guess, row, animate = true) {
    const startIndex = row * WORD_LENGTH;
    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = gameBoard.children[startIndex + i];
        tile.querySelector('span').textContent = guess[i].toUpperCase();
        tile.classList.add('filled');
        if (animate) {
            // Delay for stagger animation
            setTimeout(() => {
                tile.classList.add('flip-in');
            }, i * 100);
        }
    }
}

function applyPatternToRow(pattern, row) {
    const startIndex = row * WORD_LENGTH;
    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = gameBoard.children[startIndex + i];
        tile.classList.remove('green', 'yellow', 'gray'); // Clear previous states
        if (pattern[i] === 'G') {
            tile.classList.add('green');
        } else if (pattern[i] === 'Y') {
            tile.classList.add('yellow');
        } else {
            tile.classList.add('gray');
        }
    }
}

// --- Feedback Panel Interaction ---
function renderFeedbackTiles(guess) {
    currentGuessFeedback.innerHTML = '';
    currentFeedbackPattern = Array(WORD_LENGTH).fill('B'); // Initialize with all gray
    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = createTile(guess[i].toUpperCase(), 'gray');
        tile.dataset.index = i;
        tile.addEventListener('click', handleFeedbackTileClick);
        currentGuessFeedback.appendChild(tile);
    }
    show(feedbackPanel);
}

function handleFeedbackTileClick(event) {
    if (!gameActive) return;

    const tile = event.currentTarget;
    const index = parseInt(tile.dataset.index);
    let currentState = currentFeedbackPattern[index];
    let newState;
    let newClass;

    switch (currentState) {
        case 'B':
            newState = 'Y';
            newClass = 'yellow';
            break;
        case 'Y':
            newState = 'G';
            newClass = 'green';
            break;
        case 'G':
            newState = 'B';
            newClass = 'gray';
            break;
    }

    currentFeedbackPattern[index] = newState;
    tile.classList.remove('gray', 'yellow', 'green');
    tile.classList.add(newClass);

    // Bounce animation
    tile.style.animation = 'none'; // Reset animation
    void tile.offsetWidth; // Trigger reflow
    tile.style.animation = 'tileBounce 0.3s ease-out';
}

// --- API Calls ---
async function sendApiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("API Request Failed:", error);
        alert("An error occurred with the solver. Please try again.");
        hide(loadingSpinner);
        show(newGameButton); // Allow user to restart
        gameActive = false;
        throw error;
    }
}

async function startNewGame() {
    gameActive = true;
    currentGuessRow = 0;
    solverGuess = "";
    currentFeedbackPattern = [];

    // Clear UI
    renderGameBoard();
    hide(feedbackPanel);
    hide(victoryStateDiv);
    hide(failureStateDiv);
    hide(candidatesListDiv);
    toggleCandidatesButton.textContent = "Show Candidates";
    loadingSpinner.classList.remove('hidden'); // Show spinner while starting

    try {
        const data = await sendApiRequest('/start', 'POST');
        solverGuess = data.guess.toLowerCase();
        totalInitialCandidates = data.remaining; // Update total candidates
        animateNumber(remainingCandidatesSpan, 0, data.remaining, 500);
        currentGuessNumberSpan.textContent = "1";
        updateProgressBar(data.remaining);
        
        fillGuessRow(solverGuess, currentGuessRow);
        renderFeedbackTiles(solverGuess);
        currentGuessRow++;
    } catch (error) {
        // Error already handled in sendApiRequest
    } finally {
        hide(loadingSpinner);
    }
}

async function submitFeedback() {
    if (!gameActive) return;
    if (currentGuessRow > MAX_GUESSES) return; // Game over

    hide(feedbackPanel);
    show(loadingSpinner);

    const pattern = currentFeedbackPattern.join('');

    // Apply pattern to the game board row for visual confirmation
    applyPatternToRow(pattern, currentGuessRow - 1); // -1 because currentGuessRow was incremented after filling

    try {
        const data = await sendApiRequest('/guess', 'POST', { guess: solverGuess, pattern: pattern });
        
        animateNumber(remainingCandidatesSpan, parseInt(remainingCandidatesSpan.textContent), data.remaining, 500);
        updateProgressBar(data.remaining);
        currentGuessNumberSpan.textContent = currentGuessRow + 1;

        if (data.solved) {
            gameActive = false;
            victoryGuessesCountSpan.textContent = currentGuessRow;
            solvedWordP.textContent = solverGuess.toUpperCase();
            show(victoryStateDiv);
            confetti(currentGuessRow); // Trigger confetti!
            hide(loadingSpinner);
            hide(newGameButton);
        } else if (currentGuessRow >= MAX_GUESSES) {
            gameActive = false;
            show(failureStateDiv);
            hide(loadingSpinner);
            hide(newGameButton);
        } else {
            solverGuess = data.guess.toLowerCase();
            fillGuessRow(solverGuess, currentGuessRow);
            renderFeedbackTiles(solverGuess);
            currentGuessRow++;
        }
    } catch (error) {
        // Error already handled
    } finally {
        hide(loadingSpinner);
    }
}

async function fetchAndDisplayCandidates() {
    if (candidatesListDiv.classList.contains('hidden')) {
        // Show candidates
        toggleCandidatesButton.textContent = "Hide Candidates";
        candidatesListDiv.innerHTML = 'Loading...';
        show(candidatesListDiv);
        try {
            const data = await sendApiRequest('/candidates', 'GET');
            candidatesListDiv.innerHTML = ''; // Clear loading
            if (data.candidates.length === 0) {
                candidatesListDiv.innerHTML = '<p>No candidates remaining.</p>';
            } else {
                data.candidates.forEach(word => {
                    const chip = document.createElement('span');
                    chip.classList.add('word-chip');
                    chip.textContent = word.toUpperCase();
                    candidatesListDiv.appendChild(chip);
                });
            }
        } catch (error) {
            candidatesListDiv.innerHTML = '<p>Failed to load candidates.</p>';
        }
    } else {
        // Hide candidates
        toggleCandidatesButton.textContent = "Show Candidates";
        hide(candidatesListDiv);
    }
}

// --- Event Listeners ---
newGameButton.addEventListener('click', startNewGame);
submitFeedbackButton.addEventListener('click', submitFeedback);
toggleCandidatesButton.addEventListener('click', fetchAndDisplayCandidates);

// --- Confetti Animation (Pure JS Canvas) ---
function confetti(guesses) {
    const confettiCanvas = document.createElement('canvas');
    confettiCanvas.style.position = 'fixed';
    confettiCanvas.style.top = '0';
    confettiCanvas.style.left = '0';
    confettiCanvas.style.width = '100vw';
    confettiCanvas.style.height = '100vh';
    confettiCanvas.style.pointerEvents = 'none';
    confettiCanvas.style.zIndex = '9999';
    document.body.appendChild(confettiCanvas);

    const CCTX = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    let particles = [];
    const colors = ['#7c3aed', '#10b981', '#f59e0b', '#ffffff']; // Accent colors + white

    function createParticle() {
        return {
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height - confettiCanvas.height, // Start above screen
            radius: Math.random() * 5 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            velocity: {
                x: (Math.random() - 0.5) * 10,
                y: Math.random() * 10 + 5 // Fall downwards
            },
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        };
    }

    const numConfetti = guesses * 30; // More confetti for fewer guesses
    for (let i = 0; i < numConfetti; i++) {
        particles.push(createParticle());
    }

    function animateConfetti() {
        CCTX.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];

            p.x += p.velocity.x;
            p.y += p.velocity.y;
            p.rotation += p.rotationSpeed;

            // Apply some "wind"
            p.velocity.x *= 0.99;
            p.velocity.y += 0.2; // Gravity

            CCTX.save();
            CCTX.translate(p.x, p.y);
            CCTX.rotate(p.rotation * Math.PI / 180);
            CCTX.fillStyle = p.color;
            CCTX.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
            CCTX.restore();

            // Recycle particles that fall off screen
            if (p.y > confettiCanvas.height + p.radius) {
                particles[i] = createParticle();
                particles[i].y = -p.radius; // Reset to top
            }
        }
        requestAnimationFrame(animateConfetti);
    }

    animateConfetti();
    setTimeout(() => {
        confettiCanvas.remove();
    }, 10000); // Remove confetti after 10 seconds
}


// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    renderGameBoard();
    // Automatically start the first game on load
    startNewGame();
});

