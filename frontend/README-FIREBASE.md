# Firebase Migration Guide

This project has been migrated from Supabase to Firebase. This document provides instructions for setting up and running the application with Firebase.

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Firebase Emulators

The application is configured to use Firebase emulators for local development. To start the emulators:

```bash
cd frontend
./start-emulators.sh
```

This will start emulators for:
- Auth (port 9099)
- Firestore (port 8080)
- Storage (port 9199)
- Emulator UI (port 4000)

You can access the Emulator UI at http://localhost:4000 to see and manage your data.

### 3. Create an Admin User

After starting the emulators, create an admin user:

```bash
cd frontend
node create-admin-user.mjs
```

This will create an admin user with:
- Email: admin@example.com
- Password: admin123

### 4. Start the Application

Start the application in development mode:

```bash
cd frontend
npm run dev
```

The application will be available at http://localhost:5173.

## Migration Status

The migration is still in progress. The following components have been migrated:

- [x] Authentication Service
- [x] Firebase Configuration
- [x] Basic User Management
- [x] Login Process

Components that still need to be migrated:

- [ ] User Profile
- [ ] Job Listings
- [ ] Job Applications
- [ ] Candidate Management
- [ ] AI Matching

## Firebase Structure

The Firebase project consists of:

### Firestore Collections

- `users`: User accounts
- `candidates`: Candidate profiles
- `jobs`: Job listings
- `applications`: Job applications

### Authentication

We're using Firebase Authentication with email/password method.

### Storage

Firebase Storage is used for storing resumes and other documents.

## Production Deployment

For production deployment, replace the Firebase configuration in `src/lib/firebase.ts` with your actual Firebase project details. 