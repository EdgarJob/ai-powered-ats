import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'

// Import database testing functions for console access
import {
  testDatabaseConnection,
  checkExistingData,
  seedDatabase
} from './scripts/seedDatabase'
import { clearDatabase } from './scripts/clearDatabase'

// Create a client
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)

// Make database functions available in browser console for testing
if (typeof window !== 'undefined') {
  (window as any).testDB = testDatabaseConnection;
  (window as any).checkData = checkExistingData;
  (window as any).seedDB = seedDatabase;
  (window as any).clearDB = clearDatabase;
  console.log('🔧 Database testing functions available:');
  console.log('  - testDB() - Test database connection');
  console.log('  - checkData() - Check existing data');
  console.log('  - seedDB() - Seed database with sample data');
  console.log('  - seedDB(true) - Force seed (add data even if exists)');
  console.log('  - clearDB() - Clear all database data');
}
