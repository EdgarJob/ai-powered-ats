// Script to make a user an admin
// Run this with: node scripts/make-admin.js your-email@example.com

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin (you'll need to set up service account)
// For now, this is a template - you'll need to configure it with your Firebase project

async function makeUserAdmin(email) {
    try {
        console.log(`🔍 Looking for user with email: ${email}`);

        // Get user by email
        const userRecord = await admin.auth().getUserByEmail(email);
        console.log(`✅ Found user: ${userRecord.uid}`);

        // Update user role in Firestore
        await admin.firestore().collection('users').doc(userRecord.uid).update({
            role: 'admin',
            updatedAt: new Date()
        });

        console.log(`🎉 Successfully made ${email} an admin!`);

    } catch (error) {
        console.error('❌ Error making user admin:', error.message);
    }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
    console.log('Usage: node scripts/make-admin.js your-email@example.com');
    process.exit(1);
}

makeUserAdmin(email).then(() => {
    process.exit(0);
}); 