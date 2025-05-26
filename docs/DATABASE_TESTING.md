# 🔧 Database Testing & Sample Data Guide

This guide will help you test your database connection and populate it with realistic sample data for development and testing.

## 🎯 Quick Start

### Method 1: Using the Web Interface (Recommended)

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the Database Test page:**
   - Open your browser to `http://localhost:5173`
   - Login as an admin user
   - Click on "DB Test" in the navigation menu
   - Or go directly to: `http://localhost:5173/database-test`

3. **Test and populate:**
   - Click "Test Connection" to verify Firebase connectivity
   - Click "Check Data" to see current database contents
   - Click "Seed Database" to populate with sample data

### Method 2: Using Browser Console

1. **Open your browser's developer console** (F12)

2. **Use the available functions:**
   ```javascript
   // Test database connection
   await testDB()
   
   // Check existing data
   await checkData()
   
   // Seed database (only if empty)
   await seedDB()
   
   // Force seed (add data even if exists)
   await seedDB(true)
   ```

## 📊 Sample Data Overview

The seeding process will create:

### 👥 **6 Realistic Candidates**
- **Sarah Johnson** - Senior Software Engineer (5 years exp)
  - Skills: JavaScript, React, Node.js, Python, AWS, Docker
  - Location: San Francisco, CA
  - Education: Stanford University CS

- **Michael Chen** - Data Scientist (3 years exp)
  - Skills: Python, Machine Learning, TensorFlow, SQL, R
  - Location: New York, NY
  - Education: MIT Data Science, UC Berkeley Math

- **Emily Rodriguez** - UX Designer (4 years exp)
  - Skills: Figma, Adobe Creative Suite, User Research
  - Location: Austin, TX
  - Education: Art Institute of Chicago

- **David Kim** - DevOps Engineer (6 years exp)
  - Skills: Kubernetes, Docker, AWS, Terraform, Jenkins
  - Location: Seattle, WA
  - Education: University of Washington IT

- **Jessica Thompson** - Product Manager (7 years exp)
  - Skills: Product Strategy, Agile, Scrum, Data Analysis
  - Location: Boston, MA
  - Education: Harvard MBA, MIT Engineering

- **Alex Patel** - Frontend Developer (2 years exp)
  - Skills: React, Vue.js, JavaScript, TypeScript, CSS
  - Location: Los Angeles, CA
  - Education: UCLA Computer Science

### 💼 **5 Job Openings**
- **Senior Full Stack Developer** at TechCorp Inc. ($120k-$160k)
- **Data Scientist** at DataTech Solutions ($110k-$140k)
- **UX/UI Designer** at Design Studio Pro ($80k-$110k)
- **DevOps Engineer** at CloudTech Systems ($130k-$170k)
- **Product Manager** at Innovation Labs ($140k-$180k)

### 📝 **Random Job Applications**
- Various application statuses (applied, review, interview, offer, rejected, accepted)
- AI match scores between 60-100%
- Realistic application notes

## 🔍 Testing Database Connection

### Common Issues and Solutions

1. **"Database connection failed"**
   - Check your Firebase environment variables
   - Ensure your Firebase project is active
   - Verify Firestore is enabled in your Firebase console

2. **"Permission denied"**
   - Check your Firestore security rules
   - Ensure your user has proper authentication

3. **"Module not found" errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check that axios is installed: `npm install axios`

### Environment Variables Required

Make sure these are set in your `.env` file:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_OPENAI_API_KEY=your_openai_key (optional, for AI features)
```

## 🚀 Advanced Usage

### Seeding Options

```javascript
// Basic seeding (only if database is empty)
await seedDB()

// Force seeding (adds data regardless)
await seedDB(true)

// Check what's in the database
const data = await checkData()
console.log(`Candidates: ${data.candidates}, Jobs: ${data.jobs}`)
```

### Custom Data

You can modify the sample data in `frontend/src/scripts/seedDatabase.ts`:
- Edit `sampleCandidates` array to add/modify candidate profiles
- Edit `sampleJobs` array to add/modify job postings
- Adjust application creation logic in `seedApplications` function

## 📈 Verifying Success

After seeding, you should see:

1. **In the Database Test page:**
   - Connection status: "Database Connected"
   - Data count showing candidates and jobs

2. **In the app:**
   - Navigate to "Candidates" page to see candidate profiles
   - Navigate to "Jobs" page to see job listings
   - Navigate to "AI Matching" to test candidate-job matching

3. **In Firebase Console:**
   - Go to your Firebase project
   - Check Firestore Database
   - You should see `candidates`, `jobs`, and `applications` collections

## 🛠️ Troubleshooting

### If seeding fails:

1. **Check console errors** in browser developer tools
2. **Verify Firebase permissions** in your Firestore rules
3. **Test connection first** before attempting to seed
4. **Check network connectivity** to Firebase

### If data doesn't appear in the app:

1. **Refresh the page** to reload data
2. **Check browser console** for JavaScript errors
3. **Verify user permissions** (admin vs regular user)
4. **Test individual service functions** in console

## 🔄 Resetting Data

To clear all data and start fresh:

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Delete the collections: `candidates`, `jobs`, `applications`
4. Run the seeding process again

## 📞 Need Help?

If you encounter issues:

1. Check the browser console for detailed error messages
2. Verify your Firebase configuration
3. Ensure all dependencies are installed
4. Test the connection before seeding

The database testing tools provide detailed logging to help diagnose any issues! 