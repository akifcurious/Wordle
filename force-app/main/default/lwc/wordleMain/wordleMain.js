import { LightningElement, track } from "lwc";
import { wordleDictionary } from "c/wordleWordList";
import { initialKeyboardArray } from "c/keyboardInitializer";
import { devlog } from "c/wordleUtils";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const INVALID_CHARACTER_WARNING = "Invalid character. Only letters.(A-Z)";
const INVALID_CHARACTER_TOAST_MESSAGE =
  "Word not found. Word must be 5 letters long and only contain letters. (a-z)";
<<<<<<< HEAD
const IS_DEVLOG_ACTIVE = true; // using this to turn off console logs for production (not using permission sets in order to keep everything in LWC)

export default class WordleMain extends LightningElement {
  @track randomWord; // the random word that is chosen from the dictionary
=======
const IS_DEVLOG_ACTIVE = true; // turn on/off console logs (not using permission sets in order to keep everything in LWC)

export default class WordleMain extends LightningElement {
  @track randomWord; // the random word that is chosen from the word list
>>>>>>> b4c1d56 (initial commit)
  lettersOfRandomWord;
  lettersOfSubmittedWord;
  resultArray; // hold the result array for each submission
  @track resultsMain = []; // the main array that hold the result array for all submissions in a session
  antiGreenMatchArray = [];
  iconVariant;
  invalidCharacterWarning = INVALID_CHARACTER_WARNING;
  isCompleted = false;
  resultArrayInitialStep = []; // hold the results object for the first step of the process, used to valildate the logic
  @track currentTextValue = ""; // holds the value of the input field
  allSubmittedLettersSet = new Set(); // holds all the letters that have been submitted for keyboard coloring

  @track keyboardArray = initialKeyboardArray;

  // button labels
  @track isAnswerRevealed = false;
  revealHideButton = "Show Answer";
  @track isKeyboardVisible = true;
  @track keyboardShowHideButtonLabel = "Hide Keyboard";

  attemptCounter = 0;
  completeListOfWords = wordleDictionary;

  @track isInvalidCharacter = false;

  constructor() {
    super();
    this.chooseRandomWord();
    this.selectRandomIconVariant();
  }

  connectedCallback() {
    this.setFocusOnInputField();
    devlog(IS_DEVLOG_ACTIVE, "testing devlog");
  }

  setFocusOnInputField() {
    setTimeout(() => {
      this.template.querySelector(".responseInputBox").focus();
    }, 1500);
  }

  get attemptCounterLabel() {
    return "Attempts: " + this.attemptCounter;
  }

  chooseRandomWord() {
    const randomNum = Math.floor(
      Math.random() * this.completeListOfWords.length
    );
    this.randomWord = this.completeListOfWords[randomNum];
    devlog(IS_DEVLOG_ACTIVE, "randomWord: " + this.randomWord);

    // create an array of objects with the letters of the random word
    this.lettersOfRandomWord = this.randomWord.split("");
  }

  handleEnter(event) {
    if (event.keyCode === 13) {
      this.handleSubmit();
    }
  }

  handleTextInput(event) {
    this.currentTextValue = event.target.value;
    let textInputPattern = /^[a-zA-Z]+$/;
    if (this.currentTextValue == "") {
      this.isInvalidCharacter = false;
    } else if (!this.currentTextValue.match(textInputPattern)) {
      this.isInvalidCharacter = true;
    } else if (this.currentTextValue.match(textInputPattern)) {
      this.isInvalidCharacter = false;
    }
  }

  handleSubmit() {
    const submittedWord = this.template
      .querySelector(".responseInputBox")
      .value.toUpperCase();
    devlog(IS_DEVLOG_ACTIVE, "submittedWord: " + submittedWord);

    if (
      submittedWord.length === 5 &&
      this.isInvalidCharacter === false &&
      this.completeListOfWords.includes(submittedWord)
    ) {
      this.passValidatedSubmission(submittedWord);
    } else {
      alert(INVALID_CHARACTER_TOAST_MESSAGE);
    }
  }

  passValidatedSubmission(submittedWord) {
    // I will probably not use this method, but I want to keep it for now
    for (let i = 0; i < submittedWord.length; i++) {
      this.allSubmittedLettersSet.add(submittedWord[i]);
    }
    devlog(
      IS_DEVLOG_ACTIVE,
      "allSubmittedLettersSet: ",
      this.allSubmittedLettersSet
    );

    this.processInput(submittedWord);
    this.attemptCounter++;
    this.clearInputField();
  }

  processInput(submittedWord) {
    this.lettersOfSubmittedWord = submittedWord.split("");
    this.resultArray = [];
    this.resultArrayInitialStep = [];
    this.antiGreenMatchArray = [];

    // check for green matches
    for (let i = 0; i < submittedWord.length; i++) {
      if (this.lettersOfRandomWord[i] == this.lettersOfSubmittedWord[i]) {
        let resultObj = {
          index: i,
          letter: this.lettersOfSubmittedWord[i],
          color: "ForestGreen",
          variant: "letterBoxForestGreen",
        };
        this.resultArray.push(resultObj);
      } else {
        this.antiGreenMatchArray.push(this.lettersOfRandomWord[i]);
        let resultObj = {
          index: i,
          letter: this.lettersOfSubmittedWord[i],
          color: "LightGray",
          variant: "letterBoxGray",
        };
        this.resultArray.push(resultObj);
        const tempResultCopy = Object.assign({}, resultObj);
        this.resultArrayInitialStep.push(tempResultCopy);
      }
    }
    devlog(IS_DEVLOG_ACTIVE, "resultArray #1: ", this.resultArrayInitialStep);

    for (let i = 0; i < this.resultArray.length; i++) {
      if (this.resultArray[i].color === "LightGray") {
        if (this.antiGreenMatchArray.includes(this.resultArray[i].letter)) {
          this.resultArray[i].color = "Gold";
          this.resultArray[i].variant = "letterBoxGold";
          // remove the element from the antiGreenMatchArray
          const removeIndex = this.antiGreenMatchArray.indexOf(
            this.resultArray[i].letter
          );
          this.antiGreenMatchArray.splice(removeIndex, 1);
          devlog(
            IS_DEVLOG_ACTIVE,
            "antiGreenMatchArray: ",
            this.antiGreenMatchArray
          );
        }
      }
    }

    this.resultsMain.push(this.resultArray);

    if (this.resultArray.every((result) => result.color === "ForestGreen")) {
      this.isCompleted = true;
    }
    devlog(IS_DEVLOG_ACTIVE, "resultArray #2: ", this.resultArray);
    devlog(IS_DEVLOG_ACTIVE, "resultsMain: ", this.resultsMain);

    this.keyboardVisualizer();
  }

  clearInputField() {
    this.template.querySelector(".responseInputBox").value = "";
  }

  handleRevealButton() {
    if (this.isAnswerRevealed === false) {
      this.isAnswerRevealed = true;
      this.revealHideButton = "Hide Answer";
    } else {
      this.isAnswerRevealed = false;
      this.revealHideButton = "Show Answer";
    }
  }

  handleShowHideKeyboard() {
    if (this.isKeyboardVisible === true) {
      this.isKeyboardVisible = false;
      this.keyboardShowHideButtonLabel = "Show Keyboard";
    } else {
      this.isKeyboardVisible = true;
      this.keyboardShowHideButtonLabel = "Hide Keyboard";
    }
  }

  handleResetButton() {
    this.resultsMain = [];
    this.isAnswerRevealed = false;
    this.revealHideButton = "Show Answer";
    this.attemptCounter = 0;
    this.clearInputField();
    this.selectRandomIconVariant();
    this.isInvalidCharacter = false;
    this.chooseRandomWord();
    this.isCompleted = false;
    this.resetKeyboardVisualizerArray();
    //this.keyboardArray = initialKeyboardArray;
  }

  selectRandomIconVariant() {
    const variantArray = ["success", "warning", "error", "info"];
    const randomNum = Math.floor(Math.random() * variantArray.length);
    this.iconVariant = variantArray[randomNum];
  }

  keyboardGreenSet = new Set();
  keyboardGoldSet = new Set();
  keyboardBlackSet = new Set();
  keyboardGraySet = new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZ");

  keyboardVisualizer() {
    this.keyboardBlackSet = this.allSubmittedLettersSet;
    this.resultsMain.map((individualresult) => {
      individualresult.map((eachletter) => {
        if (eachletter.color == "ForestGreen") {
          this.keyboardGreenSet.add(eachletter.letter);
        } else if (eachletter.color == "Gold") {
          this.keyboardGoldSet.add(eachletter.letter);
        }
      });
    });
    for (let item of this.keyboardGreenSet) {
      this.keyboardBlackSet.delete(item);
      this.keyboardGoldSet.delete(item);
      this.keyboardGraySet.delete(item);
    }

    for (let item of this.keyboardGoldSet) {
      this.keyboardBlackSet.delete(item);
      this.keyboardGraySet.delete(item);
    }

    devlog(IS_DEVLOG_ACTIVE, "keyboardGreenSet: ", this.keyboardGreenSet);
    devlog(IS_DEVLOG_ACTIVE, "keyboardGoldSet: ", this.keyboardGoldSet);
    devlog(IS_DEVLOG_ACTIVE, "keyboardGraySet: ", this.keyboardGraySet);
    devlog(IS_DEVLOG_ACTIVE, "keyboardBlackSet: ", this.keyboardBlackSet);

    for (let item of this.keyboardGreenSet) {
      this.keyboardArray.map((eachletter) => {
        if (eachletter.keyboardLetter == item) {
          eachletter.keyboardColor = "keyboardBoxForestGreen";
        }
      });
    }

    for (let item of this.keyboardGoldSet) {
      this.keyboardArray.map((eachletter) => {
        if (eachletter.keyboardLetter == item) {
          eachletter.keyboardColor = "keyboardBoxGold";
        }
      });
    }

    for (let item of this.keyboardBlackSet) {
      this.keyboardArray.map((eachletter) => {
        if (eachletter.keyboardLetter == item) {
          eachletter.keyboardColor = "keyboardBoxBlack";
        }
      });
    }

    devlog(IS_DEVLOG_ACTIVE, "keyboardArray: ", this.keyboardArray);
  }

  resetKeyboardVisualizerArray() {
    this.keyboardArray.map((eachletter) => {
      eachletter.keyboardColor = "keyboardBoxGray";
    });
    this.allSubmittedLettersSet = new Set();
    this.keyboardGreenSet = new Set();
    this.keyboardGoldSet = new Set();
    this.keyboardBlackSet = new Set();
    this.keyboardGraySet = new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    devlog(
      IS_DEVLOG_ACTIVE,
      "resetKeyboardVisualizerArray () ",
      this.keyboardArray
    );
  }

  @track showModal = false;
  get modalAnswer() {
    return this.randomWord;
  }

  handleShowAnswer() {
    this.showModal = true;
  }

  handleClose() {
    this.showModal = false;
  }
}