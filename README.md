# WORDLE SOLVER

## Entropy-powered AI · Solves in ≤4 guesses

This is a complete, visually stunning Flask web application that optimally solves the NYT Wordle puzzle using an entropy-based algorithm. The app is designed to feel like a premium, polished product with a dark, space-themed aesthetic, glassmorphism UI elements, and smooth animations.

## Features

*   **Optimal Wordle Solving:** Utilizes an entropy-based algorithm to determine the best possible guess at each step, aiming to solve the puzzle in the fewest guesses.
*   **Pre-set First Guess:** Automatically starts with "CRANE," a statistically optimal first guess.
*   **Dynamic UI:** A visually engaging dark theme with a subtle animated starfield background.
*   **Glassmorphism Design:** Frosted glass cards, semi-transparent backgrounds, and soft glowing borders for all UI elements.
*   **Smooth Animations:** Satisfying flip animations for tiles, bounce animations on feedback, and confetti on victory.
*   **Interactive Feedback:** Users can easily provide guess feedback (Green, Yellow, Gray) by clicking on tiles.
*   **Real-time Stats:** Displays remaining candidate words, current guess number, and a progress bar showing how the word pool has narrowed.
*   **Candidate List:** Collapsible section to view the current list of possible answer words.
*   **Victory/Failure States:** Clear and animated indications for solving the Wordle or reaching the guess limit.
*   **Pure Vanilla Stack:** Built with Flask (Python), HTML, CSS, and vanilla JavaScript – no frontend frameworks or external animation libraries.
*   **Mobile Responsive:** Adapts cleanly to various screen sizes.

## Technologies Used

*   **Backend:** Python 3, Flask
*   **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (Vanilla)
*   **Word Lists:** Fetched from public GitHub Gists.

## Setup & Installation

1.  **Clone the repository (or download the files):**
    ```bash
    git clone <repository-url>
    cd wordle-solver
    ```
    *(Note: Replace `<repository-url>` with the actual URL if this were a real repository.)*

2.  **Create a Python Virtual Environment (recommended):**
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows: `venv\Scripts\activate`
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
    This will install Flask and requests.

4.  **Generate Word Lists:**
    The application will automatically run `setup.py` on its first start if `words.py` does not exist. This script fetches the latest Wordle answer and valid guess lists from public Gists and saves them into `words.py`.

## How to Run

1.  **Navigate to the project directory:**
    ```bash
    cd wordle-solver
    ```
    *(Ensure your virtual environment is activated if you created one.)*

2.  **Start the Flask application:**
    ```bash
    python3 app.py
    ```
    The application will start on `http://127.0.0.1:5001/`.

3.  **Open in your browser:**
    Go to `http://127.0.0.1:5001/` in your web browser.

## Usage

1.  Upon opening the app, a new game will automatically start, and the first optimal guess ("CRANE") will appear on the board.
2.  Enter "CRANE" into your actual NYT Wordle game and observe the color feedback (Green, Yellow, Gray).
3.  On the web application, click the corresponding tiles in the "Your Feedback" panel to match the colors from your Wordle game.
4.  Click "Submit Feedback." The solver will then compute the next optimal guess based on your input and display it.
5.  Repeat steps 2-4 until the Wordle is solved, or you run out of guesses.
6.  Use the "Show Candidates" button to toggle visibility of the remaining possible words.
7.  Click "New Game" to reset the solver and start fresh.

---

Enjoy solving Wordles with the power of entropy!
# wordle-solver-flask
