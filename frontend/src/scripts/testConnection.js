// Simple script to test database connection
// Run with: node src/scripts/testConnection.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Firebase configuration (you'll need to set these environment variables)
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

async function testConnection() {
    try {
        console.log('🔍 Testing Firebase connection...');

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        console.log('✅ Firebase initialized successfully');

        // Try to read from candidates collection
        const candidatesRef = collection(db, 'candidates');
        const candidatesSnapshot = await getDocs(candidatesRef);
        console.log(`📊 Found ${candidatesSnapshot.size} candidates in database`);

        // Try to read from jobs collection
        const jobsRef = collection(db, 'jobs');
        const jobsSnapshot = await getDocs(jobsRef);
        console.log(`💼 Found ${jobsSnapshot.size} jobs in database`);

        console.log('🎉 Database connection test successful!');

    } catch (error) {
        console.error('❌ Database connection failed:', error);
        console.error('Make sure your Firebase environment variables are set correctly.');
    }
}

testConnection(); 