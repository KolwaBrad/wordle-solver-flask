from flask import Flask, render_template, request, jsonify
import os
import sys
import subprocess

# --- Setup Check ---
# When running `python app.py` from the `wordle-solver` directory,
# all paths are relative to `wordle-solver`.

words_py_path = 'words.py'
setup_py_path = 'setup.py'

if not os.path.exists(words_py_path):
    print(f"'{words_py_path}' not found. Running setup script...")
    try:
        # Execute setup.py using the same Python interpreter
        subprocess.run([sys.executable, setup_py_path], check=True)
        print("Setup script completed successfully.")
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"FATAL: setup.py failed to execute: {e}")
        print("Please ensure setup.py is in the same directory as app.py.")
        sys.exit(1)

# Now we can safely import the solver.
# No special path manipulation needed as they are in the same directory.
try:
    from solver import WordleSolver
except ImportError as e:
    print(f"FATAL: Failed to import WordleSolver: {e}")
    print("Please ensure solver.py is in the same directory as app.py.")
    sys.exit(1)

# --- Flask App ---
app = Flask(__name__,
            template_folder='templates',
            static_folder='static')

solver = WordleSolver()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/start', methods=['POST'])
def start_game():
    solver.reset()
    initial_guess_info = solver.get_next_guess()
    return jsonify({
        "guess": initial_guess_info["guess"].upper(),
        "remaining": initial_guess_info["remaining"],
        "solved": False
    })

@app.route('/api/guess', methods=['POST'])
def make_guess():
    data = request.get_json()
    guess = data.get('guess', '').lower()
    pattern = data.get('pattern', '').upper()

    if not guess or not pattern or len(guess) != 5 or len(pattern) != 5:
        return jsonify({"error": "Invalid guess or pattern"}), 400

    if pattern == "GGGGG":
        return jsonify({
            "guess": guess.upper(),
            "remaining": 1,
            "solved": True
        })

    result = solver.get_next_guess(guess=guess, pattern=pattern)

    return jsonify({
        "guess": result["guess"].upper(),
        "remaining": result["remaining"],
        "solved": False
    })

@app.route('/api/candidates', methods=['GET'])
def get_candidates():
    return jsonify({"candidates": solver.get_candidates()})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
