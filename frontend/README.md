# AI-Powered ATS Frontend

This is the frontend application for the AI-Powered ATS (Applicant Tracking System), built with React, TypeScript, and Vite.

## 🚀 Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory with your Firebase and OpenAI configuration (see main README.md for details).

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Start Firebase emulators (recommended):**
   ```bash
   npm run emulators
   ```

5. **Create admin user (for development):**
   ```bash
   node create-admin-user.js
   ```

## 📁 Project Structure

```
frontend/src/
├── components/           # React components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── JobsList.tsx     # Job listings
│   ├── Layout.tsx       # App layout wrapper
│   └── ...
├── lib/                 # Services and utilities
│   ├── firebase.ts      # Firebase configuration
│   ├── firestore-service.ts  # Database operations
│   ├── auth-service.ts       # Authentication
│   ├── storage-service.ts    # File storage
│   ├── openai-service.ts     # AI integration
│   └── AuthContext.tsx      # Auth context provider
├── assets/              # Static assets
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── types.d.ts          # TypeScript definitions
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run emulators` - Start Firebase emulators

## 🔧 Key Technologies

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Material-UI (MUI)** for UI components
- **Tailwind CSS** for utility-first styling
- **React Query** for data fetching and caching
- **React Router** for client-side routing
- **Firebase SDK** for backend services

## 🔥 Firebase Integration

The app integrates with Firebase services:
- **Firestore** for database operations
- **Auth** for user authentication
- **Storage** for file uploads
- **Emulators** for local development

## 🤖 AI Features

- **OpenAI Integration** for candidate matching
- **Resume Analysis** using AI
- **Intelligent Job Recommendations**

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🧪 Development Notes

### Firebase Emulators
For local development, use Firebase emulators to avoid affecting production data:
- Firestore: `localhost:8080`
- Auth: `localhost:9099`
- Storage: `localhost:9199`

### Environment Variables
Required environment variables (see main README.md):
- Firebase configuration
- OpenAI API key

### TypeScript
The project uses strict TypeScript configuration for better code quality and developer experience.

## 🚀 Deployment

Build the application for production:
```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to Firebase Hosting or any static hosting service.
