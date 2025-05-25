document.addEventListener('DOMContentLoaded', () => {
    const flashcard = document.querySelector('.flashcard');
    const questionElement = document.getElementById('question');
    const answerElement = document.getElementById('answer');
    const prevButton = document.getElementById('prev-button');
    const flipButton = document.getElementById('flip-button');
    const nextButton = document.getElementById('next-button');

    let flashcards = [];
    let currentCardIndex = 0;

    function loadFlashcards(data) {
        flashcards = data;
        currentCardIndex = 0; // Reset to first card
        displayCard();
    }

    function displayCard() {
        if (flashcards.length === 0) {
            questionElement.textContent = 'No flashcards loaded.';
            answerElement.textContent = '';
            flashcard.classList.remove('flipped');
            prevButton.disabled = true;
            flipButton.disabled = true;
            nextButton.disabled = true;
            return;
        }

        const currentCard = flashcards[currentCardIndex];
        questionElement.textContent = currentCard.question;
        answerElement.textContent = currentCard.answer;
        flashcard.classList.remove('flipped'); // Show question side first

        // Manage button states
        prevButton.disabled = currentCardIndex === 0;
        nextButton.disabled = currentCardIndex === flashcards.length - 1;
        flipButton.disabled = false;
    }

    flipButton.addEventListener('click', () => {
        if (flashcards.length > 0) {
            flashcard.classList.toggle('flipped');
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            displayCard();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentCardIndex < flashcards.length - 1) {
            currentCardIndex++;
            displayCard();
        }
    });

    // Initial setup
    loadFlashcards([
        // Database Questions
        { question: "What is a Primary Key?", answer: "A unique identifier for a record in a table." },
        { question: "Explain Normalization.", answer: "The process of organizing data in a database to reduce redundancy and improve data integrity." },
        { question: "What is a Foreign Key?", answer: "A key used to link two tables together. It is a field (or collection of fields) in one table that refers to the Primary Key in another table." },
        { question: "What does SQL stand for?", answer: "Structured Query Language." },
        // Probability Theory Questions
        { question: "What is Sample Space in probability?", answer: "The set of all possible outcomes of a random experiment." },
        { question: "Define Conditional Probability.", answer: "The probability of an event occurring, given that another event has already occurred. P(A|B) = P(A and B) / P(B)." },
        { question: "What is an Independent Event?", answer: "Two events are independent if the occurrence of one does not affect the probability of the occurrence of the other." },
        { question: "What is Bayes' Theorem used for?", answer: "It describes the probability of an event, based on prior knowledge of conditions that might be related to the event. It's used for updating probabilities." }
    ]);
    // If no data is loaded initially, displayCard will handle the message.
    // If you prefer to start with a "No flashcards loaded" message,
    // call displayCard() before loadFlashcards or loadFlashcards with an empty array.
});
