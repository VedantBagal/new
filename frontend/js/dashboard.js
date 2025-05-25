document.addEventListener('DOMContentLoaded', () => {
    const usernameDisplay = document.getElementById('username-display');
    const pointsDisplay = document.getElementById('points-display');
    const logoutButton = document.getElementById('logout-button');

    const API_BASE_URL = 'http://localhost:3001/api'; // Assuming backend runs on this port

    // 1. Check for JWT token
    const token = localStorage.getItem('revflash-token');
    if (!token) {
        console.log("No token found. Conceptual redirect to login.html");
        // window.location.href = 'login.html'; // Future implementation
        if (usernameDisplay) usernameDisplay.textContent = 'N/A (Please log in)';
        if (pointsDisplay) pointsDisplay.textContent = 'N/A';
        if (logoutButton) logoutButton.textContent = 'Login';
        // Potentially disable other interactive elements or show a login prompt
        return; // Stop further execution if no token
    }

    // 2. Fetch user profile data
    if (usernameDisplay && pointsDisplay) {
        fetch(`${API_BASE_URL}/profile`, {
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
                if (usernameDisplay) usernameDisplay.textContent = 'Error: Session expired';
                if (pointsDisplay) pointsDisplay.textContent = 'Please log in again';
                if (logoutButton) logoutButton.textContent = 'Login';
                // window.location.href = 'login.html'; // Future implementation
                return null;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(profileData => {
            if (!profileData) return; // Stop if response was null due to auth error

            usernameDisplay.textContent = profileData.username || 'User';
            pointsDisplay.textContent = profileData.points !== undefined ? profileData.points : '0';
        })
        .catch(error => {
            console.error('Error fetching profile data:', error);
            if (usernameDisplay) usernameDisplay.textContent = 'Error loading data';
            if (pointsDisplay) pointsDisplay.textContent = 'N/A';
        });
    }

    // 3. Logout functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            const currentToken = localStorage.getItem('revflash-token');
            if (!currentToken) { // If already logged out
                // window.location.href = 'login.html'; // Redirect to login
                console.log("Conceptually redirecting to login.html");
                alert("Please log in.");
                return;
            }

            localStorage.removeItem('revflash-token');
            localStorage.removeItem('selectedSubjectId'); // Clear any other session-related data
            localStorage.removeItem('selectedSubjectName');
            console.log("Logged out. Token removed. Conceptual redirect to login.html");
            alert("You have been logged out.");
            
            // Update UI to reflect logged-out state
            if (usernameDisplay) usernameDisplay.textContent = 'N/A (Please log in)';
            if (pointsDisplay) pointsDisplay.textContent = 'N/A';
            logoutButton.textContent = 'Login';
            // window.location.href = 'login.html'; // Future implementation
        });
    }
});
