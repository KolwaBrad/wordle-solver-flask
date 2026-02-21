import math
import collections
from words import ANSWERS, VALID_GUESSES

class WordleSolver:
    def __init__(self):
        self.reset()

    def reset(self):
        self.possible_answers = list(ANSWERS)
        self.all_guesses = list(VALID_GUESSES) + list(ANSWERS)
        self.guesses_made = 0
        self.last_guess = None

    def _get_pattern(self, guess, actual_word):
        # B = gray, Y = yellow, G = green
        pattern = ["B"] * 5
        guess_chars = list(guess)
        actual_chars = list(actual_word)

        # First pass: Check for green (correct position)
        for i in range(5):
            if guess_chars[i] == actual_chars[i]:
                pattern[i] = "G"
                actual_chars[i] = None # Mark as used
                guess_chars[i] = None # Mark as used

        # Second pass: Check for yellow (wrong position but present)
        for i in range(5):
            if guess_chars[i] is not None:
                try:
                    idx = actual_chars.index(guess_chars[i])
                    pattern[i] = "Y"
                    actual_chars[idx] = None # Mark as used
                except ValueError:
                    pass # Not in word or already used

        return "".join(pattern)

    def _filter_words(self, guess, pattern):
        self.possible_answers = [
            word for word in self.possible_answers
            if self._get_pattern(guess, word) == pattern
        ]

    def get_next_guess(self, guess=None, pattern=None):
        self.guesses_made += 1

        if guess and pattern:
            self._filter_words(guess, pattern)

        if self.guesses_made == 1:
            self.last_guess = "crane"
            return {"guess": "crane", "remaining": len(self.possible_answers)}

        if len(self.possible_answers) <= 2:
            self.last_guess = self.possible_answers[0]
            return {"guess": self.possible_answers[0], "remaining": len(self.possible_answers)}

        best_guess = ""
        max_entropy = -1

        # Consider all possible guesses (VALID_GUESSES + ANSWERS)
        # It's more effective to guess a word that is not necessarily an answer
        # if it provides more information.
        words_to_evaluate = self.all_guesses

        for current_guess in words_to_evaluate:
            entropy = self._calculate_entropy(current_guess)
            if entropy > max_entropy:
                max_entropy = entropy
                best_guess = current_guess

        self.last_guess = best_guess
        return {"guess": best_guess, "remaining": len(self.possible_answers)}

    def _calculate_entropy(self, current_guess):
        # H = -Σ p(pattern) * log2(p(pattern))
        pattern_counts = collections.defaultdict(int)
        for word in self.possible_answers:
            pattern = self._get_pattern(current_guess, word)
            pattern_counts[pattern] += 1

        total_remaining = len(self.possible_answers)
        entropy = 0.0
        for count in pattern_counts.values():
            if count > 0:
                p_pattern = count / total_remaining
                entropy -= p_pattern * math.log2(p_pattern)
        return entropy

    def get_candidates(self):
        return self.possible_answers
