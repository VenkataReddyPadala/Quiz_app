document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("./quiz-data.json");
  const quizData = await response.json();
  let topicMaxScores = Array(quizData.sections.length).fill(0);

  initSections();

  function initSections() {
    let sections = document.querySelectorAll(".section");
    sections.forEach((section, idx) => {
      section.addEventListener("click", () => {
        startQuiz(idx);
      });
    });
  }
  function randomizeArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function startQuiz(index) {
    let currentQuestions = randomizeArray(quizData.sections[index].questions);
    let currentQuestionIndex = 0;
    let answerArray = currentQuestions.map((q) => ({
      answered: false,
      correct: false,
      value: null,
    }));
    const quizContainer = document.querySelector("#quiz-container");
    const questionContainer = document.querySelector("#question-container");

    quizContainer.style.display = "none";
    questionContainer.style.display = "block";
    questionContainer.innerHTML = `
        <div id="question-content">
          <p id="score">Score: 0</p>
          <div id="progress"></div>
          <div id="question"></div>
          <div id="options"></div>
          <div class="buttons">
            <button id="next-button">Next</button>
          </div>
        </div>
      `;

    showQuestions();

    function showQuestions() {
      const question = currentQuestions[currentQuestionIndex];
      const questionElement = document.querySelector("#question");
      const optionsElement = document.querySelector("#options");
      const buttonsContainer = document.querySelector(".buttons");
      const progressElement = document.querySelector("#progress");

      optionsElement.innerHTML = "";
      const oldPrevButton = document.getElementById("prev-button");
      if (oldPrevButton) oldPrevButton.remove();
      const oldFeedback = document.getElementById("feedback");
      if (oldFeedback) oldFeedback.remove();
      questionElement.textContent = question.question;

      progressElement.innerHTML = `
          <div id="progress-container">
            <div id="progress-bar"></div>
          </div>
          Question ${currentQuestionIndex + 1} of ${currentQuestions.length}
        `;
      const progressBar = document.querySelector("#progress-bar");
      progressBar.style.width =
        ((currentQuestionIndex + 1) / currentQuestions.length) * 100 + "%";

      if (currentQuestionIndex > 0) {
        const prevButton = document.createElement("button");
        prevButton.id = "prev-button";
        prevButton.textContent = "Previous";
        prevButton.addEventListener("click", () => {
          currentQuestionIndex--;
          showQuestions();
        });
        buttonsContainer.prepend(prevButton);
      }

      if (question.questionType === "mcq") {
        question.options.forEach((option) => {
          const optionElement = document.createElement("div");
          optionElement.textContent = option;

          if (
            answerArray[currentQuestionIndex].answered &&
            answerArray[currentQuestionIndex].value === option
          ) {
            optionElement.classList.add("selected");
          }
          optionElement.addEventListener("click", () => {
            if (!answerArray[currentQuestionIndex].answered) {
              answerArray[currentQuestionIndex].answered = true;
              answerArray[currentQuestionIndex].value = option;
              answerArray[currentQuestionIndex].correct =
                option.toLowerCase() === question.answer.toLowerCase();
              optionElement.classList.add("selected");
              showFeedback(option, question.answer);
              updateScore();
            }
          });
          optionsElement.appendChild(optionElement);
        });
        if (answerArray[currentQuestionIndex].answered) {
          showFeedback(
            answerArray[currentQuestionIndex].value,
            question.answer
          );
        }
      } else {
        const inputElement = document.createElement("input");
        inputElement.type = question.questionType;

        const submitButton = document.createElement("button");
        submitButton.textContent = "Submit Answer";
        submitButton.className = "submit-answer";

        if (answerArray[currentQuestionIndex].answered) {
          inputElement.value = answerArray[currentQuestionIndex].value;
          inputElement.disabled = true;
          submitButton.disabled = true;
          showFeedback(
            answerArray[currentQuestionIndex].value,
            question.answer
          );
        }

        submitButton.addEventListener("click", () => {
          if (!answerArray[currentQuestionIndex].answered) {
            let givenAnswer = inputElement.value.trim();
            answerArray[currentQuestionIndex].answered = true;
            answerArray[currentQuestionIndex].value = givenAnswer;
            answerArray[currentQuestionIndex].correct =
              givenAnswer.toString().toLowerCase() ===
              question.answer.toString().toLowerCase();
            inputElement.disabled = true;
            submitButton.disabled = true;
            showFeedback(givenAnswer, question.answer);
            updateScore();
          }
        });

        optionsElement.appendChild(inputElement);
        optionsElement.appendChild(submitButton);
      }
    }

    function showFeedback(givenAnswer, correctAnswer) {
      let oldFeedback = document.getElementById("feedback");
      if (oldFeedback) oldFeedback.remove();
      const feedbackElement = document.createElement("div");
      feedbackElement.id = "feedback";
      if (
        givenAnswer.toString().toLowerCase() ===
        correctAnswer.toString().toLowerCase()
      ) {
        feedbackElement.textContent = "Correct!";
        feedbackElement.style.color = "green";
      } else {
        feedbackElement.textContent = `Wrong. Correct Answer is ${correctAnswer}`;
        feedbackElement.style.color = "red";
      }
      document.querySelector("#options").appendChild(feedbackElement);
    }

    function updateScore() {
      const score = answerArray.filter((a) => a.correct).length;
      document.querySelector("#score").textContent = `Score: ${score}`;
    }

    document.querySelector("#next-button").onclick = () => {
      if (currentQuestionIndex === currentQuestions.length - 1) {
        endQuiz();
      } else {
        currentQuestionIndex++;
        showQuestions();
      }
    };

    function endQuiz() {
      const score = answerArray.filter((a) => a.correct).length;
      topicMaxScores[index] = Math.max(topicMaxScores[index], score);
      questionContainer.innerHTML = `
          <div id="quiz-end">
            <h1>Your Quiz Completed</h1>
            <p>Max score for this topic: ${topicMaxScores[index]}</p>
            <p>Your final score is ${score}/${currentQuestions.length}</p>
            <button id="home-button">Go to Home</button>
            <button id="try-again-button">Try Again</button>
          </div>
        `;
      const homeBtn = document.querySelector("#home-button");
      const tryAgainBtn = document.querySelector("#try-again-button");

      homeBtn.onclick = () => {
        quizContainer.style.display = "grid";
        questionContainer.style.display = "none";
      };

      tryAgainBtn.onclick = () => {
        startQuiz(index);
      };
    }
  }
});
