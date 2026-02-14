FinSight

FinSight is a modern, AI-powered personal finance management application that helps users track expenses, visualize spending trends, and manage their budget efficiently.

## 🚀 Features

- **Automated Expense Tracking:**  Extract transaction details from various sources(Now it fetches only from interapp payments.)
- **Dynamic Dashboard:** Real-time visualization of spending habits using interactive charts (Recharts).
- **Transaction Management:** Detailed ledger for viewing, editing, and categorizing transactions.
- **Secure Authentication:** JWT-based authentication for user data privacy.
- **Mobile Responsive:** Clean and premium UI built with Tailwind CSS, optimized for all devices.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS, Framer Motion (Animations)
- **Icons:** Lucide React
- **Charts:** Recharts
- **State Management:** React Context / Hooks

### Backend
- **Framework:** Express.js (Node.js)
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL (Neon)
- **AI Integration:** Google Gemini API, OpenAI API
- **Authentication:** JWT, Bcrypt

## ⚙️ Project Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL instance (Neon DB recommended)
- API Keys: Google Gemini, OpenAI (Optional)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env` file in the `backend/` directory and add the following:
   ```env
   DATABASE_URL=your_postgresql_url
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Run migrations (if using Drizzle):
   ```bash
   npx drizzle-kit push
   ```
5. Start the server:
   ```bash
   node server.js
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

FinSight follows a classic **Client-Server** architecture with specialized layers for data handling and AI processing.

### Directory Structure
```text
FinSight/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # View components (Dashboard, Ledger, etc.)
│   │   ├── services/   # API communication layer
│   │   └── utils/      # Helper functions
├── backend/            # Express.js backend application
│   ├── controllers/    # Request handlers & logic
│   ├── repositories/   # Database abstraction layer
│   ├── services/       # External API integrations (Gemini, etc.)
│   ├── routes/         # API endpoint definitions
│   ├── db/             # Schema definitions and database config
│   └── scripts/        # Utility and seeding scripts
```

### Data Flow
1. **Request:** The React frontend makes an HTTP request to the Express backend.
2. **Controller:** The route triggers a controller which handles the business logic.
3. **Service/Repository:** The controller calls services for AI processing or repositories for database operations.
4. **Response:** Data is returned as JSON and rendered by the frontend.

## 📈 features remaining
- [ ] Add suppourt for manual bills upload by using another api.
- [ ] Detailed budget setting and alerts/notification and dues according to user bills
Note: As of now split wise and dashboard analysis are in seperate branches will be merged soon.
