import { useState, useEffect } from "react";
import _ from "lodash";

import { checkGuess } from "./functions";

import "./WordleApp.css";

// TODO: extract functions out of event listener
// TODO: remove hacky map from Word component
// TODO: update logic for letter duplicate letters, one of which is correct (e.g., hotel --> hello)

// global variables
const EN5_URL =
  "https://raw.githubusercontent.com/Vincent-Vercruyssen/wordle-react-app/main/data/NL-5.txt";

const N_GUESSES = 6;

// TODO: might give an issue with non-standard keyboards?
const VALID_KEYS = [
  "q",
  "w",
  "e",
  "r",
  "t",
  "y",
  "u",
  "i",
  "o",
  "p",
  "a",
  "s",
  "d",
  "f",
  "g",
  "h",
  "j",
  "k",
  "l",
  "z",
  "x",
  "c",
  "v",
  "b",
  "n",
  "m",
  "Enter",
  "Backspace",
];

// components
const Header = ({
  winCounter,
  lossCounter,
  currentWord,
  currentGuess,
  ingameCounter,
  handleRestartGame,
}) => {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <p style={{ margin: 5 }}>Current word = {currentWord}</p>
      <p style={{ margin: 5 }}>Current guess = {currentGuess}</p>
      <p style={{ margin: 5 }}>Ingame counter = {ingameCounter}</p>
      <p style={{ margin: 5 }}>Number of wins = {winCounter}</p>
      <p style={{ margin: 5 }}>Number of losses = {lossCounter}</p>
      <button
        disabled={ingameCounter > 0 ? false : true}
        onClick={() => handleRestartGame(false)}
      >
        restart game
      </button>
    </div>
  );
};

const Letter = ({ letter, status }) => {
  var className = "BaseLetter ";

  if (status === "c") {
    className += "CorrectLetter";
  } else if (status === "u") {
    className += "UnusedLetter";
  } else if (status === "d") {
    className += "WrongplaceLetter";
  } else if (letter) {
    className += "GuessLetter";
  } else {
    className += "EmptyLetter";
  }

  return (
    <div
      className={className}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {letter.toUpperCase()}
    </div>
  );
};

const Word = ({ word, corrected }) => {
  const wordArray = _.assign(_.fill(new Array(5), ""), word);
  const correctedArray = _.assign(_.fill(new Array(5), ""), corrected);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      {_.map(wordArray, (letter, i) => {
        return <Letter letter={letter} status={correctedArray[i]} key={i} />;
      })}
    </div>
  );
};

const WordBoard = ({ currentGuess, enteredGuesses, correctedGuesses }) => {
  const nGuessed = enteredGuesses.length;
  const nEmpties = N_GUESSES - nGuessed - 1;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        margin: 10,
      }}
    >
      {_.map(enteredGuesses, (guess, i) => {
        return <Word word={guess} corrected={correctedGuesses[i]} key={i} />;
      })}
      <Word word={currentGuess} corrected="" />
      {_.map(_.range(nEmpties), (i, _) => {
        return <Word word="" corrected="" key={i} />;
      })}
    </div>
  );
};

const Key = ({ keyCode, keyType, handleInputLetter }) => {
  var className = "BaseKey ";

  if (keyType === "c") {
    className += "CorrectKey";
  } else if (keyType === "u") {
    className += "UnusedKey";
  } else if (keyType === "special") {
    className += "SpecialKey";
  }

  return (
    <div
      className={className}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={() => handleInputLetter(keyCode)}
    >
      {keyCode.toUpperCase()}
    </div>
  );
};

const KeyRow = ({ children }) => {
  return (
    <div style={{ display: "flex", flexDirection: "row", width: "600px" }}>
      {children}
    </div>
  );
};

const KeyBoard = ({ usedLetters, handleInputLetter }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* first row */}
      <KeyRow>
        {_.map(VALID_KEYS.slice(0, 10), (keyCode, i) => {
          return (
            <Key
              keyCode={keyCode}
              keyType={usedLetters[keyCode]}
              handleInputLetter={handleInputLetter}
              key={i}
            />
          );
        })}
      </KeyRow>
      {/* second row */}
      <KeyRow>
        {_.map(VALID_KEYS.slice(10, 19), (keyCode, i) => {
          return (
            <Key
              keyCode={keyCode}
              keyType={usedLetters[keyCode]}
              handleInputLetter={handleInputLetter}
              key={i}
            />
          );
        })}
      </KeyRow>
      {/* third row */}
      <KeyRow>
        <Key
          keyCode="Back"
          keyType="special"
          handleInputLetter={handleInputLetter}
        />
        {_.map(VALID_KEYS.slice(19, 26), (keyCode, i) => {
          return (
            <Key
              keyCode={keyCode}
              keyType={usedLetters[keyCode]}
              handleInputLetter={handleInputLetter}
              key={i}
            />
          );
        })}
        <Key
          keyCode="Enter"
          keyType="special"
          handleInputLetter={handleInputLetter}
        />
      </KeyRow>
    </div>
  );
};

function WordleApp() {
  const [winCounter, setWinCounter] = useState(0);
  const [lossCounter, setLossCounter] = useState(0);
  const [wordList, setWordList] = useState([]);
  const [currentWord, setCurrentWord] = useState("");

  // current game state
  const [ingameCounter, setIngameCounter] = useState(0);
  const [currentGuess, setCurrentGuess] = useState("");
  const [enteredGuesses, setEnteredGuesses] = useState([]);
  const [correctedGuesses, setCorrectedGuesses] = useState([]);
  const [usedLetters, setUsedLetters] = useState({});

  // initialize the word list
  useEffect(() => {
    const fetchWordList = async () => {
      const response = await fetch(EN5_URL);
      const data = await response.text();

      const words = data.split(/\r?\n/);
      let newWord = words[Math.floor(Math.random() * words.length)];
      setCurrentWord(newWord);
      setWordList(words);
    };

    console.log("fetching word list...");
    fetchWordList();
  }, []);

  const handleInputLetter = (key) => {
    if (key === "Enter") {
      if (wordList.includes(currentGuess)) {
        const [corrected, solved] = checkGuess(currentWord, currentGuess);
        const newEnteredGuesses = enteredGuesses.concat(currentGuess);
        const newCorrectedGuesses = correctedGuesses.concat(corrected);
        setEnteredGuesses(newEnteredGuesses);
        setCorrectedGuesses(newCorrectedGuesses);
        handleUpdateUsedLetters(newEnteredGuesses, newCorrectedGuesses);
        // end game?
        if (solved) {
          alert("you won! Restart?");
          handleRestartGame(true);
        } else if (ingameCounter === 5) {
          alert("you lost! Restart?");
          handleRestartGame(false);
        } else {
          setIngameCounter(ingameCounter + 1);
        }
        setCurrentGuess("");
      } else {
        // TODO: display wrong word
      }
    } else if (key === "Backspace" || key === "Back") {
      if (currentGuess.length > 0) {
        setCurrentGuess(currentGuess.slice(0, currentGuess.length - 1));
      }
    } else {
      if (currentGuess.length < 5) {
        setCurrentGuess(currentGuess + key);
      }
    }
  };

  const handleUpdateUsedLetters = (newEnteredGuesses, newCorrectedGuesses) => {
    console.log("updating used letters...");
    const allLetters = newEnteredGuesses.join();
    const corrections = newCorrectedGuesses.join();
    var newUsedLetters = { ...usedLetters };
    for (let i = 0; i < allLetters.length; i++) {
      // TODO: make sure that "d" does not override "c"
      newUsedLetters[allLetters[i]] = corrections[i];
    }
    setUsedLetters(newUsedLetters);
  };

  // listen to any input on the keyboard
  useEffect(() => {
    console.log("running main logic loop...");
    function handleKeyDown(e) {
      if (VALID_KEYS.includes(e.key)) {
        handleInputLetter(e.key);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return function cleanup() {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentGuess]);

  // handlers
  const handleRestartGame = (gameWon) => {
    console.log("restarting game...");
    if (gameWon) {
      setWinCounter(winCounter + 1);
    } else {
      setLossCounter(lossCounter + 1);
    }

    const newWord = wordList[Math.floor(Math.random() * wordList.length)];
    setCurrentWord(newWord);
    setCurrentGuess("");
    setIngameCounter(0);
    setEnteredGuesses([]);
    setCorrectedGuesses([]);
    setUsedLetters({});
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: 10,
      }}
    >
      <Header
        winCounter={winCounter}
        lossCounter={lossCounter}
        currentWord={currentWord}
        currentGuess={currentGuess}
        ingameCounter={ingameCounter}
        handleRestartGame={handleRestartGame}
      />
      <WordBoard
        currentGuess={currentGuess}
        enteredGuesses={enteredGuesses}
        correctedGuesses={correctedGuesses}
      />
      <KeyBoard
        usedLetters={usedLetters}
        handleInputLetter={handleInputLetter}
      />
    </div>
  );
}

export default WordleApp;
