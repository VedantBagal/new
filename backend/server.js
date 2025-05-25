const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-very-secret-key-for-revflash'; // In a real app, use environment variable

// In-memory storage for users
let users = [];
let nextUserId = 1;

// In-memory storage for subjects and flashcards
let subjects = [
    { subject_id: 'subj1', name: 'Database', description: 'Concepts of DBMS', created_by: null }, // Assuming created_by would be a user_id
    { subject_id: 'subj2', name: 'Probability Theory', description: 'Fundamentals of probability', created_by: null },
    { subject_id: 'subj3', name: 'Web Development', description: 'Core concepts of web technologies', created_by: null }
];
let nextSubjectId = 4; // For potential future additions

let flashcards = [
    // Database Flashcards
    { flashcard_id: 'fc1', subject_id: 'subj1', question: 'What is a Primary Key?', answer: 'A unique identifier for a record in a table.' },
    { flashcard_id: 'fc2', subject_id: 'subj1', question: 'Explain Normalization.', answer: 'The process of organizing data in a database to reduce redundancy and improve data integrity.' },
    { flashcard_id: 'fc3', subject_id: 'subj1', question: 'What does SQL stand for?', answer: 'Structured Query Language.' },
    // Probability Theory Flashcards
    { flashcard_id: 'fc4', subject_id: 'subj2', question: 'What is Sample Space in probability?', answer: 'The set of all possible outcomes of a random experiment.' },
    { flashcard_id: 'fc5', subject_id: 'subj2', question: 'Define Conditional Probability.', answer: 'The probability of an event occurring, given that another event has already occurred. P(A|B) = P(A and B) / P(B).' },
    // Web Development Flashcards
    { flashcard_id: 'fc6', subject_id: 'subj3', question: 'What does HTML stand for?', answer: 'HyperText Markup Language.' },
    { flashcard_id: 'fc7', subject_id: 'subj3', question: 'What is CSS used for?', answer: 'Cascading Style Sheets are used for describing the presentation of a document written in HTML.' }
];
let nextFlashcardId = 8; // For potential future additions


// Middleware
app.use(express.json()); // For parsing application/json

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expects "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    jwt.verify(token, JWT_SECRET, (err, userPayload) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ message: "Forbidden. Token has expired." });
            }
            return res.status(403).json({ message: "Forbidden. Invalid token." });
        }
        req.user = userPayload; // Add payload to request object
        next();
    });
};

// --- Authentication Routes ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required." });
        }
        if (users.some(user => user.username === username)) {
            return res.status(409).json({ message: "Username already exists." });
        }
        if (users.some(user => user.email === email)) {
            return res.status(409).json({ message: "Email already exists." });
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const newUser = { id: nextUserId++, username, email, passwordHash, points: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        users.push(newUser);
        const { passwordHash: _, ...userToReturn } = newUser;
        res.status(201).json({ message: "User registered successfully.", user: userToReturn });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal server error during registration." });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials. User not found." });
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials. Password incorrect." });
        }
        const tokenPayload = { userId: user.id, username: user.username, email: user.email };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
        const { passwordHash: _, ...userToReturn } = user;
        res.status(200).json({ message: "Login successful.", token, user: userToReturn });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error during login." });
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.status(200).json({ message: "Logout successful. Please clear your token on the client-side." });
});
// --- End Authentication Routes ---


// --- Profile Management Routes ---
app.get('/api/profile', authenticateToken, (req, res) => {
    const userFromToken = req.user;
    const userInDb = users.find(u => u.id === userFromToken.userId);
    if (!userInDb) {
        return res.status(404).json({ message: "User not found in database." });
    }
    const { passwordHash, id, ...profileData } = userInDb;
    res.status(200).json(profileData);
});

app.put('/api/profile', authenticateToken, (req, res) => {
    const { userId } = req.user;
    const { username, email } = req.body;
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({ message: "User not found." });
    }
    let userToUpdate = { ...users[userIndex] };
    if (username && username !== userToUpdate.username) {
        if (users.some(u => u.username === username && u.id !== userId)) {
            return res.status(409).json({ message: "Username already taken." });
        }
        userToUpdate.username = username;
    }
    if (email && email !== userToUpdate.email) {
        if (users.some(u => u.email === email && u.id !== userId)) {
            return res.status(409).json({ message: "Email already taken." });
        }
        userToUpdate.email = email;
    }
    userToUpdate.updated_at = new Date().toISOString();
    users[userIndex] = userToUpdate;
    const { passwordHash, id, ...updatedProfileData } = userToUpdate;
    res.status(200).json({ message: "Profile updated successfully.", user: updatedProfileData });
});
// --- End Profile Management Routes ---


// --- Leaderboard Route ---
app.get('/api/leaderboard', (req, res) => {
    if (!users || users.length === 0) {
        return res.status(200).json([]);
    }
    const sortedUsers = [...users].sort((a, b) => b.points - a.points);
    const leaderboard = sortedUsers.map((user, index) => ({
        rank: index + 1,
        username: user.username,
        points: user.points,
    }));
    res.status(200).json(leaderboard);
});
// --- End Leaderboard Route ---


// --- Subject and Flashcard Management Routes ---

// GET all subjects
app.get('/api/subjects', authenticateToken, (req, res) => {
    // For now, returning all subjects. Can be enhanced with created_by filter later.
    res.status(200).json(subjects);
});

// GET flashcards for a specific subject
app.get('/api/subjects/:subjectId/flashcards', authenticateToken, (req, res) => {
    const { subjectId } = req.params;

    // Check if the subject exists
    const subjectExists = subjects.some(s => s.subject_id === subjectId);
    if (!subjectExists) {
        return res.status(404).json({ message: "Subject not found." });
    }

    // Filter flashcards for the given subjectId
    const subjectFlashcards = flashcards.filter(fc => fc.subject_id === subjectId);

    // Return only essential flashcard info (e.g., id, question, answer)
    const responseFlashcards = subjectFlashcards.map(({ flashcard_id, question, answer }) => ({
        flashcard_id,
        question,
        answer
    }));
    
    res.status(200).json(responseFlashcards);
});

// --- End Subject and Flashcard Management Routes ---


// Define a simple GET route (existing)
app.get('/', (req, res) => {
    res.json({ message: "REVFLASH backend is running!" });
});

// Start the server (existing)
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
