document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-form');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const pointsDisplay = document.getElementById('points-display');
    const messageArea = document.getElementById('message-area');
    const logoutButton = document.getElementById('logout-button');

    const API_BASE_URL = 'http://localhost:3001/api'; // Assuming backend runs on this port
    let originalUsername = '';
    let originalEmail = '';

    // Function to display messages
    function showMessage(message, isError = false) {
        if (messageArea) {
            messageArea.textContent = message;
            messageArea.style.color = isError ? 'red' : 'green';
        }
    }

    // 1. Check for JWT token and fetch profile
    const token = localStorage.getItem('revflash-token');
    if (!token) {
        console.log("No token found. Conceptual redirect to login.html");
        showMessage("You must be logged in to view your profile.", true);
        // window.location.href = 'login.html'; // Future implementation
        if (profileForm) profileForm.style.display = 'none'; // Hide form
        if (logoutButton) logoutButton.textContent = 'Login';
        return;
    }

    fetch(`${API_BASE_URL}/profile`, {
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
            if (profileForm) profileForm.style.display = 'none';
            if (logoutButton) logoutButton.textContent = 'Login';
            return null;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(profileData => {
        if (!profileData) return;

        originalUsername = profileData.username;
        originalEmail = profileData.email;

        if (usernameInput) usernameInput.value = profileData.username;
        if (emailInput) emailInput.value = profileData.email;
        if (pointsDisplay) pointsDisplay.textContent = profileData.points !== undefined ? profileData.points : '0';
    })
    .catch(error => {
        console.error('Error fetching profile data:', error);
        showMessage(`Error loading profile: ${error.message}`, true);
        if (profileForm) profileForm.style.display = 'none';
    });

    // 2. Update Profile (Form Submission)
    if (profileForm) {
        profileForm.addEventListener('submit', (event) => {
            event.preventDefault();
            showMessage(''); // Clear previous messages

            const newUsername = usernameInput.value.trim();
            const newEmail = emailInput.value.trim();

            if (!newUsername || !newEmail) {
                showMessage("Username and email cannot be empty.", true);
                return;
            }

            // Construct payload only with changed fields
            const payload = {};
            if (newUsername !== originalUsername) {
                payload.username = newUsername;
            }
            if (newEmail !== originalEmail) {
                payload.email = newEmail;
            }

            if (Object.keys(payload).length === 0) {
                showMessage("No changes detected.", false);
                return;
            }

            fetch(`${API_BASE_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })
            .then(async response => {
                const responseData = await response.json();
                if (!response.ok) {
                    // Throw an error with the message from backend if available
                    throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
                }
                return responseData;
            })
            .then(data => {
                showMessage(data.message || "Profile updated successfully!", false);
                // Update original values to reflect successful change
                if (data.user) {
                    originalUsername = data.user.username || originalUsername;
                    originalEmail = data.user.email || originalEmail;
                    if (usernameInput) usernameInput.value = originalUsername;
                    if (emailInput) emailInput.value = originalEmail;
                    // Points are not updated here, could re-fetch if necessary
                }
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                showMessage(error.message || "Failed to update profile. Please try again.", true);
            });
        });
    }

    // 3. Logout Functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            const currentToken = localStorage.getItem('revflash-token');
            if (!currentToken) {
                // window.location.href = 'login.html';
                alert("Please log in.");
                return;
            }
            localStorage.removeItem('revflash-token');
            localStorage.removeItem('selectedSubjectId');
            localStorage.removeItem('selectedSubjectName');
            alert("You have been logged out.");
            // window.location.href = 'login.html';
            if (profileForm) profileForm.style.display = 'none';
            if (usernameInput) usernameInput.value = '';
            if (emailInput) emailInput.value = '';
            if (pointsDisplay) pointsDisplay.textContent = 'N/A';
            showMessage("You have been logged out.", false);
            logoutButton.textContent = 'Login';
        });
    }
});
