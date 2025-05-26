/**
 * Script to make a user an admin in real Firebase
 * This connects to your real Firebase project (not emulators)
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

// Your real Firebase configuration (from .env file)
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyCqVdBaTbiEFq5Oq1kgNlDTkRHalf_usvo",
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "ai-powered-ats-e019d.firebaseapp.com",
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "ai-powered-ats-e019d",
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "ai-powered-ats-e019d.firebasestorage.app",
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "52303267038",
    appId: process.env.VITE_FIREBASE_APP_ID || "1:52303267038:web:79ed7f49c34565cb922e4f"
};

async function makeUserAdmin() {
    try {
        // Initialize Firebase (connects to real Firebase, not emulators)
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        console.log('Connected to Firebase project:', firebaseConfig.projectId);

        // The email of the user you want to make admin
        const userEmail = 'edgarjobkerario@gmail.com'; // Change this to your email

        console.log(`Looking for user with email: ${userEmail}`);

        // Note: In a real app, you'd need to find the user by email
        // For now, you'll need to get the user ID from Firebase Console
        // and replace 'YOUR_USER_ID_HERE' with your actual user ID

        const userId = 'OnQAL2NDN1MV93BK2MfXTRjgdxw1'; // Replace with your actual user ID from Firebase Console

        console.log(`Updating user ${userId} to admin role...`);

        // Update the user's role to admin
        const userDocRef = doc(db, 'users', userId);

        // First check if the user document exists
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            console.log('User document not found. Creating new user document...');

            // Create a new user document with admin role
            await setDoc(userDocRef, {
                id: userId,
                email: userEmail,
                role: 'admin',
                firstName: 'Edgar',
                lastName: 'Kerario',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log('✅ New admin user document created!');
        } else {
            // Update existing user to admin
            await updateDoc(userDocRef, {
                role: 'admin',
                updatedAt: new Date()
            });

            console.log('✅ User role updated to admin!');
        }

        console.log('🎉 Success! You are now an admin.');
        console.log('Please refresh your app to see admin features.');

    } catch (error) {
        console.error('❌ Error making user admin:', error);
        console.log('Make sure you:');
        console.log('1. Have the correct user ID');
        console.log('2. Are connected to the internet');
        console.log('3. Have proper Firebase permissions');
    }
}

// Run the script
makeUserAdmin(); 