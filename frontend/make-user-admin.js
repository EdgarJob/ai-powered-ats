/**
 * Script to make a user an admin in real Firebase
 * This connects to your real Firebase project (not emulators)
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

// Your real Firebase configuration (from .env file)
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

async function makeUserAdmin() {
    try {
        // Check if all required environment variables are present
        if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
            throw new Error('Missing required Firebase environment variables. Please check your .env file.');
        }

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
        console.log('4. Have all required environment variables in your .env file');
    }
}

// Run the script
makeUserAdmin(); 