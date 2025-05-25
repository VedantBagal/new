document.addEventListener('DOMContentLoaded', () => {
    const subjectList = document.getElementById('subject-list');
    const logoutButton = document.getElementById('logout-button');
    // const startRevisingButton = document.getElementById('start-revising-button'); // Optional

    const API_BASE_URL = 'http://localhost:3001/api'; // Assuming backend runs on this port

    // 1. Check for JWT token
    const token = localStorage.getItem('revflash-token');
    if (!token) {
        console.log("No token found. Conceptual redirect to login.html");
        // window.location.href = 'login.html'; // Future implementation
        // For now, disable parts of the page or show a message
        if (subjectList) subjectList.innerHTML = '<p>Please log in to see subjects.</p>';
        if (logoutButton) logoutButton.textContent = 'Login'; // Change button text
        // Potentially disable other interactive elements
        return; // Stop further execution if no token
    }

    // 2. Fetch subjects
    if (subjectList) {
        fetch(`${API_BASE_URL}/subjects`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.status === 401 || response.status === 403) {
                console.error('Unauthorized or Forbidden. Token might be invalid or expired.');
                localStorage.removeItem('revflash-token'); // Clear bad token
                subjectList.innerHTML = '<p>Your session has expired or is invalid. Please <a href="login.html">log in again</a>.</p>';
                // window.location.href = 'login.html'; // Future implementation
                return null;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(subjects => {
            if (!subjects) return; // Stop if response was null due to auth error

            if (subjects.length === 0) {
                subjectList.innerHTML = '<p>No subjects available at the moment.</p>';
                return;
            }

            subjects.forEach(subject => {
                const listItem = document.createElement('li');
                listItem.textContent = `${subject.name} - ${subject.description || 'No description'}`;
                listItem.dataset.subjectId = subject.subject_id; // Store subject_id
                listItem.style.cursor = 'pointer';
                listItem.addEventListener('click', () => {
                    console.log(`Subject selected: ${subject.name}, ID: ${subject.subject_id}`);
                    localStorage.setItem('selectedSubjectId', subject.subject_id);
                    localStorage.setItem('selectedSubjectName', subject.name); // Optional, for display
                    window.location.href = 'index.html'; // Redirect to flashcard page
                });
                subjectList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Error fetching subjects:', error);
            subjectList.innerHTML = `<p>Error loading subjects: ${error.message}. Please try again later.</p>`;
        });
    }

    // 3. Logout functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            const currentToken = localStorage.getItem('revflash-token');
            if (!currentToken) { // If already logged out (e.g. token was bad)
                // window.location.href = 'login.html'; // Redirect to login
                console.log("Conceptually redirecting to login.html");
                alert("Please log in.");
                return;
            }

            localStorage.removeItem('revflash-token');
            localStorage.removeItem('selectedSubjectId');
            localStorage.removeItem('selectedSubjectName');
            console.log("Logged out. Token removed. Conceptual redirect to login.html");
            alert("You have been logged out.");
            // window.location.href = 'login.html'; // Future implementation
            // Update UI to reflect logged-out state
            if (subjectList) subjectList.innerHTML = '<p>Please log in to see subjects.</p>';
            logoutButton.textContent = 'Login';
        });
    }
});
