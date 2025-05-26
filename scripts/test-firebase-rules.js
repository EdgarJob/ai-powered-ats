const { loadFirestoreRules, initializeAdminApp, initializeTestApp } = require('@firebase/rules-unit-testing');
const { readFileSync } = require('fs');

const projectId = 'your-project-id';
const rules = readFileSync('firestore.rules', 'utf8');

async function setup() {
    // Initialize admin app
    const adminApp = initializeAdminApp({ projectId });

    // Load security rules
    await loadFirestoreRules({
        projectId,
        rules
    });

    return { adminApp };
}

async function testSecurityRules() {
    const { adminApp } = await setup();

    // Test public read access
    const unauthedApp = initializeTestApp({ projectId });
    const jobs = await unauthedApp.firestore().collection('jobs').get();
    console.assert(jobs.docs.length > 0, 'Public should read jobs');

    // Test admin write access
    const adminUser = await adminApp.auth().createUser({ uid: 'admin-user' });
    const adminAppInstance = initializeTestApp({
        projectId,
        auth: { uid: 'admin-user', admin: true }
    });
    const writeResult = await adminAppInstance.firestore()
        .collection('jobs')
        .add({ title: 'Test Job' });
    console.assert(writeResult.id, 'Admin should write jobs');

    // Cleanup
    await Promise.all(firebase.apps().map(app => app.delete()));
}

testSecurityRules().catch(console.error); 