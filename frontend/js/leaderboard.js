document.addEventListener('DOMContentLoaded', () => {
    const leaderboardList = document.getElementById('leaderboard-list');
    const messageArea = document.getElementById('message-area');
    const logoutButton = document.getElementById('logout-button');

    const API_BASE_URL = 'http://localhost:3001/api'; // Assuming backend runs on this port

    // Function to display messages
    function showMessage(message, isError = false) {
        if (messageArea) {
            messageArea.textContent = message;
            messageArea.style.color = isError ? 'red' : 'black'; // Default to black for info
        }
    }

    // 1. Check for JWT token (primarily for logout button state)
    const token = localStorage.getItem('revflash-token');
    if (!token) {
        if (logoutButton) logoutButton.textContent = 'Login'; // Or hide it, or redirect to login
    }

    // 2. Fetch Leaderboard Data
    fetch(`${API_BASE_URL}/leaderboard`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
            // No Authorization header needed for public leaderboard
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(leaderboardData => {
        if (!leaderboardData || leaderboardData.length === 0) {
            showMessage("Leaderboard is currently empty.", false);
            if (leaderboardList) leaderboardList.innerHTML = ''; // Clear any placeholders
            return;
        }

        if (leaderboardList) {
            leaderboardList.innerHTML = ''; // Clear any loading message or old data
            leaderboardData.forEach(user => {
                const listItem = document.createElement('li');
                listItem.textContent = `Rank ${user.rank}: ${user.username} - ${user.points} points`;
                // Example of highlighting current user if logged in and data matches (optional)
                // const currentUser = JSON.parse(localStorage.getItem('revflash-user')); // Assuming user info stored
                // if (token && currentUser && currentUser.username === user.username) {
                //    listItem.style.fontWeight = 'bold';
                //    listItem.style.color = 'blue';
                // }
                leaderboardList.appendChild(listItem);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching leaderboard data:', error);
        showMessage(`Error loading leaderboard: ${error.message}`, true);
    });

    // 3. Logout Functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            const currentToken = localStorage.getItem('revflash-token');
            if (!currentToken) {
                // If button says "Login", redirect to login page
                // window.location.href = 'login.html'; 
                alert("Please log in.");
                return;
            }
            localStorage.removeItem('revflash-token');
            localStorage.removeItem('selectedSubjectId');
            localStorage.removeItem('selectedSubjectName');
            // localStorage.removeItem('revflash-user'); // Clear stored user info if any
            alert("You have been logged out.");
            logoutButton.textContent = 'Login';
            // window.location.href = 'login.html'; // Redirect to login page
            // Clear leaderboard or user-specific highlights if any were added
            // For simplicity, a page reload or navigating away and back would refresh state
        });
    }
});
