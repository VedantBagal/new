# REVFLASH - Revision Flashcards

## Description
REVFLASH is a multi-user web application designed to help users revise various topics using an interactive flashcard system. It features user accounts, subject selection, dynamic loading of flashcards based on the chosen subject, user profiles, and a public leaderboard.

The application follows a client-server architecture:
*   **Backend:** A Node.js/Express.js server providing a RESTful API for user authentication, data management, and application logic.
*   **Frontend:** A client-side application built with HTML, CSS, and vanilla JavaScript, allowing users to interact with the flashcards and their accounts.

## Features
*   **User Authentication:** Secure registration and login using JWT (JSON Web Tokens).
*   **User Dashboard:** Displays user-specific information, including current points.
*   **Profile Management:** Users can view and update their profile information (username, email).
*   **Leaderboard:** Publicly displays users ranked by their accumulated points.
*   **Subject Selection:** A dedicated page (`home.html`) where users can choose a subject to revise.
*   **Dynamic Flashcard Loading:** Flashcards are fetched from the backend based on the selected subject.
*   **Interactive Flashcard Revision:**
    *   View questions and flip cards to see answers.
    *   Navigate through flashcards (Previous/Next).
    *   (Conceptual) "Finish Session" button (points system backend logic is a TODO).
*   **Logout Functionality:** Securely logs out the user by clearing client-side tokens.

## Directory Structure
*   `/frontend/`: Contains all client-side HTML, CSS, and JavaScript files.
    *   `/frontend/js/`: Contains JavaScript files for different frontend pages.
*   `/backend/`: Contains the Node.js/Express.js server, API logic, and related configuration.

## Setup and Running the Application

### Backend Setup
1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the server:**
    ```bash
    npm start
    ```
    The backend server will typically start on `http://localhost:3001`. Check the console output for the exact URL.

### Frontend Setup
1.  **Ensure the backend server is running.** The frontend relies on the backend API for all its data and functionality.
2.  **Open the main application page:**
    Navigate to the `/frontend/` directory and open `home.html` in your preferred web browser.
    *   For example, if your project is in `C:\Projects\REVFLASH`, you would open `file:///C:/Projects/REVFLASH/frontend/home.html`.
    *   (Note: Direct file access might have limitations with some advanced browser features or API requests if CORS isn't broadly configured on the backend. For development, serving the frontend via a simple HTTP server is often better, but for this project, direct file access is the assumed method as per current setup).

## API Endpoints Overview
The backend provides the following main API endpoints:

*   **Authentication:**
    *   `POST /api/auth/register`: Register a new user.
    *   `POST /api/auth/login`: Log in an existing user and receive a JWT.
    *   `POST /api/auth/logout`: (Conceptual) Endpoint for logout; actual logout is client-side token removal.
*   **User Profile (Protected by JWT):**
    *   `GET /api/profile`: Fetch the logged-in user's profile information.
    *   `PUT /api/profile`: Update the logged-in user's profile (username, email).
*   **Leaderboard (Public):**
    *   `GET /api/leaderboard`: Fetch the public leaderboard, ranked by user points.
*   **Subjects & Flashcards (Protected by JWT):**
    *   `GET /api/subjects`: Fetch a list of all available subjects.
    *   `GET /api/subjects/:subjectId/flashcards`: Fetch flashcards for a specific subject.

## Data Persistence Note
Currently, all application data (including user accounts, subjects, and flashcards) is stored **in-memory** on the backend server. This means that **all data will be reset if the server restarts.**

## Future Enhancements
This list includes potential features and improvements for future development:
*   **Database Integration:** Replace in-memory storage with a persistent database (e.g., PostgreSQL, MongoDB) for users, subjects, flashcards, and points.
*   **Comprehensive Points System:** Fully implement logic for awarding and tracking points based on revision performance.
*   **User-Created Content:** Allow users to create, edit, and delete their own subjects and flashcards.
*   **Shareable Flashcard Sets:** Enable users to share their flashcard sets with others.
*   **Password Reset Functionality:** Implement a secure way for users to reset forgotten passwords.
*   **Advanced Revision Modes:** Introduce features like spaced repetition, randomization options, and self-assessment.
*   **Admin Panel:** A dedicated interface for administrators to manage users, content, and application settings.
*   **Frontend Login/Registration Pages:** Currently, login/registration is conceptual on the frontend; dedicated HTML pages and JS logic are needed.
*   **Improved UI/UX:** Further enhancements to styling, user experience, and accessibility.
*   **Testing:** Add unit and integration tests for both frontend and backend.
