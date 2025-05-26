import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function clearDatabase(): Promise<void> {
    console.log('🗑️ Clearing database...');

    try {
        // Clear candidates
        const candidatesSnapshot = await getDocs(collection(db, 'candidates'));
        const candidateDeletePromises = candidatesSnapshot.docs.map(docSnapshot =>
            deleteDoc(doc(db, 'candidates', docSnapshot.id))
        );
        await Promise.all(candidateDeletePromises);
        console.log(`✅ Deleted ${candidatesSnapshot.size} candidates`);

        // Clear jobs
        const jobsSnapshot = await getDocs(collection(db, 'jobs'));
        const jobDeletePromises = jobsSnapshot.docs.map(docSnapshot =>
            deleteDoc(doc(db, 'jobs', docSnapshot.id))
        );
        await Promise.all(jobDeletePromises);
        console.log(`✅ Deleted ${jobsSnapshot.size} jobs`);

        // Clear applications
        const applicationsSnapshot = await getDocs(collection(db, 'applications'));
        const applicationDeletePromises = applicationsSnapshot.docs.map(docSnapshot =>
            deleteDoc(doc(db, 'applications', docSnapshot.id))
        );
        await Promise.all(applicationDeletePromises);
        console.log(`✅ Deleted ${applicationsSnapshot.size} applications`);

        console.log('🎉 Database cleared successfully!');
    } catch (error) {
        console.error('❌ Error clearing database:', error);
        throw error;
    }
}

// Make it available globally for browser console
if (typeof window !== 'undefined') {
    (window as any).clearDB = clearDatabase;
} 