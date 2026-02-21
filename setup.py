import requests

def fetch_wordlist(url):
    response = requests.get(url)
    response.raise_for_status()
    return [word.strip().lower() for word in response.text.splitlines() if word.strip()]

def setup_word_lists():
    print("Setting up word lists...")
    answers_url = "https://gist.githubusercontent.com/scholtes/94f3c0303ba6a7768b47583aff36654d/raw/wordle-La.txt"
    valid_guesses_url = "https://gist.githubusercontent.com/cfreshman/cdcdf777450c5b5301e439061d29694c/raw/wordle-allowed-guesses.txt"

    answers = fetch_wordlist(answers_url)
    valid_guesses = fetch_wordlist(valid_guesses_url)

    with open("words.py", "w") as f:
        f.write(f"ANSWERS = {answers}\n")
        f.write(f"VALID_GUESSES = {valid_guesses}\n")
    print("Word lists successfully generated and saved to words.py")

if __name__ == "__main__":
    setup_word_lists()
