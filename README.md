# 🚀 AI-Powered ATS (Applicant Tracking System)

A modern, intelligent Applicant Tracking System built with React, Firebase, and OpenAI. This system helps companies manage job postings, track candidates, and use AI to match the best candidates to job requirements.

## 🎯 What This Project Does

Think of this as a **smart hiring assistant** that:
- **Manages job postings** - Companies can create and manage job openings
- **Tracks candidates** - Stores candidate information and resumes
- **AI-powered matching** - Uses OpenAI to match candidates to jobs based on skills and requirements
- **User management** - Supports both admin users (HR managers) and regular users (candidates)
- **Real-time updates** - Uses Firebase for instant data synchronization

## 🛠️ Tech Stack (The Tools We Use)

### **Frontend (What Users See)**
- **React** - The main framework for building the user interface
- **TypeScript** - Adds type safety to JavaScript (helps catch errors early)
- **Vite** - Fast development server and build tool
- **Material-UI** - Pre-built beautiful components for the interface
- **Tailwind CSS** - Utility-first CSS framework for styling

### **Backend (Data & Logic)**
- **Firebase Authentication** - Handles user login/signup securely
- **Firestore Database** - NoSQL database for storing all data
- **Firebase Storage** - Stores files like resumes and documents
- **OpenAI API** - Powers the AI matching and analysis features

### **Development Tools**
- **Git** - Version control to track changes
- **GitHub Actions** - Automated testing and deployment
- **ESLint** - Code quality checker
- **Prettier** - Code formatter

## 🚀 Quick Start Guide

### Prerequisites (What You Need First)
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Firebase Account** - [Create free account](https://firebase.google.com/)
- **OpenAI API Key** - [Get API key](https://platform.openai.com/api-keys)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-powered-ats.git
   cd ai-powered-ats
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your Firebase and OpenAI credentials
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Go to `http://localhost:5173`
   - Create your first admin user account

## 📁 Project Structure

```
ai-powered-ats/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/             # Services and utilities
│   │   ├── types/           # TypeScript type definitions
│   │   └── App.tsx          # Main application component
│   ├── public/              # Static files
│   └── package.json         # Dependencies and scripts
├── docs/                    # Documentation
├── .github/workflows/       # GitHub Actions CI/CD
└── README.md               # This file
```

## 🎓 Learning Path (For Beginners)

### **Phase 1: Understanding the Basics**
1. **React Fundamentals** - Learn components, props, and state
2. **TypeScript Basics** - Understand types and interfaces
3. **Firebase Setup** - Learn about NoSQL databases and authentication

### **Phase 2: Building Features**
1. **User Authentication** - Login/signup functionality
2. **CRUD Operations** - Create, Read, Update, Delete data
3. **File Uploads** - Handle resume uploads to Firebase Storage

### **Phase 3: Advanced Features**
1. **AI Integration** - Connect with OpenAI API
2. **Real-time Updates** - Use Firestore listeners
3. **Deployment** - Deploy to production

## 🔧 Available Scripts

In the `frontend` directory, you can run:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Check code quality
- `npm run preview` - Preview production build

## 🌟 Key Features

### **For Admins (HR Managers)**
- ✅ Create and manage job postings
- ✅ View all candidate applications
- ✅ AI-powered candidate matching
- ✅ Generate hiring reports
- ✅ Manage user permissions

### **For Candidates**
- ✅ Browse available job openings
- ✅ Submit applications with resume upload
- ✅ Track application status
- ✅ Update profile information

### **AI-Powered Features**
- 🤖 **Smart Matching** - AI analyzes resumes and job requirements
- 🤖 **Skill Extraction** - Automatically identifies candidate skills
- 🤖 **Job Recommendations** - Suggests best-fit positions
- 🤖 **Interview Questions** - Generates relevant interview questions

## 🔐 Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key
```

## 🚀 Deployment

### **Development Mode**
- Uses Firebase emulators for local testing
- Safe environment for learning and experimentation

### **Production Mode**
- Connects to real Firebase services
- Requires proper environment variables
- Automated deployment via GitHub Actions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📖 Documentation

### **Project Documentation**
- **[📋 Complete Features List](docs/FEATURES.md)** - Comprehensive documentation of all features
- **[🚀 Deployment Guide](docs/DEPLOYMENT.md)** - Step-by-step deployment instructions
- **[🔒 Security Guidelines](docs/SECURITY.md)** - Security best practices and configurations

### **Learning Resources**

#### **React & TypeScript**
- [React Official Tutorial](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React + TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

#### **Firebase**
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Getting Started](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

#### **AI Integration**
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [AI for Developers Guide](https://openai.com/blog/openai-api)

## 🐛 Troubleshooting

### **Common Issues**

1. **"Module not found" errors**
   ```bash
   cd frontend && npm install
   ```

2. **Firebase connection issues**
   - Check your `.env` file has correct credentials
   - Ensure Firebase project is properly configured

3. **Port already in use**
   ```bash
   lsof -ti:5173 | xargs kill -9
   npm run dev
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Firebase** for providing excellent backend services
- **OpenAI** for powerful AI capabilities
- **React community** for amazing tools and libraries
- **Material-UI** for beautiful, accessible components

---

**Happy Coding! 🎉**

*This project is perfect for learning modern web development with AI integration. Start with the basics and gradually add more advanced features as you grow your skills.* # Deployment Test
# Testing Firebase Deployment - Mon May 26 15:33:08 EAT 2025
# Secrets Verification Test - Mon May 26 15:54:12 EAT 2025
# Testing with complete Firebase config - Mon May 26 16:04:52 EAT 2025
# Final deployment test with all secrets - Mon May 26 16:12:41 EAT 2025
