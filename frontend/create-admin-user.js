/**
 * Script to create an admin user in Firebase Auth emulator
 * Run this script after starting the emulators
 */
const { initializeApp } = require('firebase/app');
const {
    getAuth,
    createUserWithEmailAndPassword,
    connectAuthEmulator
} = require('firebase/auth');
const {
    getFirestore,
    setDoc,
    doc,
    connectFirestoreEmulator
} = require('firebase/firestore');

// Emulator connection configuration
const firebaseConfig = {
    apiKey: "AIzaSyDevelopment-Key-For-EmulatorsMkdGk",
    authDomain: "localhost",
    projectId: "ai-powered-ats",
};

async function createAdminUser() {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Connect to emulators
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);

    try {
        console.log('Creating admin user...');

        // Create the user in Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            'admin@example.com',
            'admin123'
        );

        const userId = userCredential.user.uid;
        console.log(`Created auth user with ID: ${userId}`);

        // Create user document in Firestore with admin role
        await setDoc(doc(db, 'users', userId), {
            id: userId,
            email: 'admin@example.com',
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('Admin user created successfully!');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}

createAdminUser().then(() => {
    console.log('Script completed');
    process.exit(0);
}).catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
}); 