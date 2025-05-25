document.addEventListener('DOMContentLoaded', () => {
    const flashcard = document.querySelector('.flashcard');
    const questionElement = document.getElementById('question');
    const answerElement = document.getElementById('answer');
    const prevButton = document.getElementById('prev-button');
    const flipButton = document.getElementById('flip-button');
    const nextButton = document.getElementById('next-button');
    const subjectTitleElement = document.getElementById('subject-title');
    const completeSessionButton = document.getElementById('complete-session-btn');
    const logoutButton = document.getElementById('logout-button'); // From nav bar
    const messageArea = document.getElementById('message-area-flashcard'); // Message area in index.html

    let flashcards = [];
    let currentCardIndex = 0;
    let selectedSubjectId = null;
    let selectedSubjectName = null;

    const API_BASE_URL = 'http://localhost:3001/api';

    function showMessage(message, isError = false) {
        if (messageArea) {
            messageArea.textContent = message;
            messageArea.style.color = isError ? 'red' : 'green';
        }
    }

    // 1. Authentication and Subject Check
    const token = localStorage.getItem('revflash-token');
    if (!token) {
        showMessage("You must be logged in to view flashcards. Redirecting to login...", true);
        // window.location.href = 'login.html'; // Conceptual redirect
        console.log("No token, conceptual redirect to login.html");
        // Disable UI
        if (subjectTitleElement) subjectTitleElement.textContent = 'Please Login';
        [prevButton, flipButton, nextButton, completeSessionButton].forEach(btn => {
            if (btn) btn.disabled = true;
        });
        if (logoutButton) logoutButton.textContent = 'Login';
        return; // Stop execution
    }

    selectedSubjectId = localStorage.getItem('selectedSubjectId');
    selectedSubjectName = localStorage.getItem('selectedSubjectName');

    if (!selectedSubjectId) {
        showMessage("No subject selected. Redirecting to home to pick a subject...", true);
        // window.location.href = 'home.html'; // Conceptual redirect
        console.log("No subject ID, conceptual redirect to home.html");
        if (subjectTitleElement) subjectTitleElement.textContent = 'No Subject Selected';
        [prevButton, flipButton, nextButton, completeSessionButton].forEach(btn => {
            if (btn) btn.disabled = true;
        });
        return; // Stop execution
    }

    if (subjectTitleElement) {
        subjectTitleElement.textContent = `Revising: ${selectedSubjectName || 'Subject'}`;
    }

    // Function to load flashcards into the UI (modified to be called after fetch)
    function loadFlashcards(data) {
        flashcards = data; // Expects array of { question, answer, flashcard_id }
        currentCardIndex = 0;
        if (flashcards.length > 0) {
            displayCard();
            showMessage(`Loaded ${flashcards.length} flashcards for ${selectedSubjectName}.`, false);
        } else {
            showMessage(`No flashcards found for ${selectedSubjectName}.`, false);
            questionElement.textContent = 'No flashcards available for this subject.';
            answerElement.textContent = '';
            [prevButton, flipButton, nextButton].forEach(btn => btn.disabled = true);
        }
    }

    function displayCard() {
        if (flashcards.length === 0) {
            questionElement.textContent = 'No flashcards to display.';
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

        prevButton.disabled = currentCardIndex === 0;
        nextButton.disabled = currentCardIndex === flashcards.length - 1;
        flipButton.disabled = false;
    }

    // 2. Fetch Flashcards for the selected subject
    function fetchFlashcardsForSubject(subjectId) {
        fetch(`${API_BASE_URL}/subjects/${subjectId}/flashcards`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('revflash-token');
                showMessage("Session expired or invalid. Please log in again.", true);
                // window.location.href = 'login.html';
                return null;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                loadFlashcards(data); // data should be an array of flashcards
            }
        })
        .catch(error => {
            console.error('Error fetching flashcards:', error);
            showMessage(`Error loading flashcards: ${error.message}`, true);
            questionElement.textContent = 'Failed to load flashcards.';
            answerElement.textContent = '';
            [prevButton, flipButton, nextButton, completeSessionButton].forEach(btn => {
                if (btn) btn.disabled = true;
            });
        });
    }

    // Initial call to fetch flashcards
    fetchFlashcardsForSubject(selectedSubjectId);

    // Event Listeners for flashcard navigation
    if (flipButton) {
        flipButton.addEventListener('click', () => {
            if (flashcards.length > 0) {
                flashcard.classList.toggle('flipped');
            }
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentCardIndex > 0) {
                currentCardIndex--;
                displayCard();
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentCardIndex < flashcards.length - 1) {
                currentCardIndex++;
                displayCard();
            }
        });
    }

    // 4. Points System Placeholder - Event Listener for "Finish Session"
    if (completeSessionButton) {
        completeSessionButton.addEventListener('click', () => {
            const message = `Session complete for subject: ${selectedSubjectName || 'Unknown'}. Points system not yet implemented.`;
            console.log(message);
            showMessage(message, false);
            // Potentially redirect to home or dashboard
            // window.location.href = 'home.html';
        });
    }

    // 5. Logout Functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            const currentToken = localStorage.getItem('revflash-token');
            if (!currentToken && logoutButton.textContent === 'Login') {
                // window.location.href = 'login.html'; // Redirect to login if button says Login
                console.log("Conceptual redirect to login.html");
                alert("Please log in.");
                return;
            }

            localStorage.removeItem('revflash-token');
            localStorage.removeItem('selectedSubjectId');
            localStorage.removeItem('selectedSubjectName');
            showMessage("You have been logged out.", false);
            alert("You have been logged out.");
            
            // Update UI
            if (subjectTitleElement) subjectTitleElement.textContent = 'Logged Out';
            questionElement.textContent = 'Please log in to start a session.';
            answerElement.textContent = '';
            [prevButton, flipButton, nextButton, completeSessionButton].forEach(btn => {
                if (btn) btn.disabled = true;
            });
            logoutButton.textContent = 'Login';
            // window.location.href = 'login.html'; // Redirect to login page
        });
    }
});
