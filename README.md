# Korean SRS App

A full-stack application for learning Korean using a spaced repetition system similar to Anki.

## Features

- **Spaced Repetition System (SRS)** - Learn efficiently with the proven SuperMemo 2 algorithm
- **User Authentication** - Secure login and registration
- **Flashcard Management** - Create, edit, and organize Korean vocabulary cards
- **Card Categories** - Organize cards by topics
- **Custom Decks** - Create personal study decks
- **Study Statistics** - Track your learning progress

## Technology Stack

### Backend
- Node.js
- Express.js
- MySQL database
- JWT authentication

### Frontend
- React
- Vite
- React Router
- Framer Motion for animations

## Getting Started

### Prerequisites
- Node.js (v14+)
- MySQL (v8+)

### Setup Instructions

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/korean-srs-app.git
   cd korean-srs-app
   ```

2. **Install backend dependencies**
   ```
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the root directory (use `.env.example` as a template)
   - Configure your database settings and JWT secret

4. **Set up the database**
   ```
   npm run setup-db
   ```

5. **Start the backend server**
   ```
   npm run dev
   ```

6. **Set up the frontend**
   ```
   cd client
   npm install
   npm run dev
   ```

7. **Access the application**
   - Backend API: http://localhost:5000
   - Frontend: http://localhost:3000

## API Documentation

### Authentication Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get current user profile

### Cards Routes
- `GET /api/cards` - Get all cards
- `GET /api/cards/:id` - Get a card by ID
- `POST /api/cards` - Create a new card
- `PUT /api/cards/:id` - Update a card
- `DELETE /api/cards/:id` - Delete a card
- `GET /api/cards/study/due` - Get cards due for review
- `GET /api/cards/study/new` - Get new cards to learn
- `POST /api/cards/:id/review` - Review a card (update SRS data)

### Decks Routes
- `GET /api/decks` - Get all decks
- `GET /api/decks/:id` - Get a deck by ID
- `POST /api/decks` - Create a new deck
- `PUT /api/decks/:id` - Update a deck
- `DELETE /api/decks/:id` - Delete a deck
- `POST /api/decks/:id/cards` - Add a card to a deck
- `DELETE /api/decks/:deckId/cards/:cardId` - Remove a card from a deck

### Statistics Routes
- `GET /api/stats` - Get user statistics
- `GET /api/stats/history` - Get review history
- `GET /api/stats/categories` - Get performance by category

## License

