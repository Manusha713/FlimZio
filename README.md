# FlimZio 🎬

FlimZio is a full-stack movie discovery application that allows users to explore trending films, search by title with typo-correction support, browse curated categories and genres, view detailed information with recommendations, and manage a persistent wishlist.

---

## ✨ Features

- **Discover & Explore:** Browse trending, top-rated, and genre-specific movie rows.
- **Smart Search:** Search movies by title with typo-handling and autocorrect feedback.
- **Detailed Views:** View ratings, release information, runtimes, overviews, and similar movie recommendations.
- **Persistent Wishlist:** Save and remove favorite movies using a backend database.
- **Responsive UI:** Dark, responsive interface for desktop and mobile screens.
- **Robust Error Handling:** Loading, empty, network-error, and missing-image fallback states.

---

## 🛠️ Tech Stack

### Frontend

- React with Vite
- Tailwind CSS
- Lucide React
- Axios

### Backend

- Node.js
- Express
- Prisma ORM
- SQLite
- Node Cache
- Axios

### External API

- [The Movie Database (TMDB) API](https://www.themoviedb.org/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22 or higher
- npm
- A valid [TMDB API key](https://developer.themoviedb.org/)

### Installation

1. **Clone the repository**

	```bash
	git clone https://github.com/Manusha713/FlimZio.git
	cd FlimZio
	```

2. **Install backend dependencies**

	```bash
	cd backend
	npm install
	```

3. **Configure environment variables**

	Create `backend/.env` using `backend/.env.example` as a reference:

	```env
	PORT=5000
	TMDB_API_KEY=your_tmdb_api_key_here
	TMDB_BASE_URL=https://api.themoviedb.org/3
	DATABASE_URL="file:./dev.db"
	```

4. **Initialize the database**

	```bash
	cd backend
	npx prisma migrate deploy
	```

5. **Start the backend**

	```bash
	npm run dev
	```

	The backend runs at `http://localhost:5000`.

6. **Install and start the frontend**

	Open a separate terminal:

	```bash
	cd frontend
	npm install
	npm run dev
	```

	The frontend development server runs at `http://localhost:5173`.

---

## 🏗️ Architecture & Approach

FlimZio uses a decoupled client-server architecture:

- **Backend as an abstraction layer:** The React frontend communicates with the Express backend rather than calling TMDB directly. This keeps API credentials on the server, centralizes request handling, and standardizes API responses.
- **Data normalization:** TMDB responses are transformed by the backend before reaching the frontend, so UI components do not depend directly on TMDB field names.
- **Persistent storage:** Movie discovery uses live TMDB data, while wishlist operations are stored locally in SQLite through Prisma.
- **Reusable UI components:** Movie cards, movie rows, navigation, details, loading states, filters, and pagination are implemented as reusable React components.
- **Explore state in the URL:** Explore category, genre, sort order, and page are preserved through query parameters so the state survives refreshes.

## ⚠️ Known Limitations

- No user authentication system; the current setup is intended for a single local user.
- The application depends on TMDB availability, API limits, and image availability.
- Automated unit, integration, and end-to-end tests are not currently implemented.
- The local SQLite database is not intended for production-scale deployments though we can easily switch to PostgreSQL.
- Some native dropdown styling can vary between browsers.

## 🔮 Future Improvements

- Making watchedList and individuals Ratings as well as personal review.
- Implement authentication and multi-user profile support.
- Add comprehensive automated testing with tools such as Jest and Cypress.
- Expand movie details with cast information, video trailers, and streaming provider links.
- Improve caching and rate-limit handling to reduce external API traffic.
- Add production deployment configuration for the frontend, backend, and database.


## 🤖 AI Tools Used

AI coding assistance was used during development to:

- Investigate frontend rendering and API integration issues.
- Identify data-shape mismatches between TMDB, the backend, and React components.
- Implement and refine the Explore page, filters, URL state, and pagination.
- Improve responsive layouts and mobile behavior.
- Diagnose image-loading failures and add fallback states.
- Refine navigation, search, wishlist, and movie-detail interactions.
- Review build diagnostics and prepare project documentation.
- AI Agents - Copilot, ChatGPT, Gemini AI

All generated suggestions were reviewed and adapted to the existing project structure.

## 📝 TMDB Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB. Movie data and images are provided by [The Movie Database](https://www.themoviedb.org/).
