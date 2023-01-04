// check correctness of word guess
export const checkGuess = (correctWord, guess) => {
  let corrected = "";
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === correctWord[i]) {
      corrected += "c";
    } else if (correctWord.includes(guess[i])) {
      corrected += "d";
    } else {
      corrected += "u";
    }
  }

  let solved = true;
  if (corrected.includes("u") || corrected.includes("d")) {
    solved = false;
  }

  return [corrected, solved];
};

// export const updateUsedLetters = (enteredGuesses, correctedGuesses) => {
//   const allLetters = enteredGuesses.join();
//   const corrections = correctedGuesses.join();
//   var usedLetters = {};
//   for (let i = 0; i < allLetters.length; i++) {
//     usedLetters[allLetters[i]] = corrections[i];
//   }
//   return usedLetters;
// };
