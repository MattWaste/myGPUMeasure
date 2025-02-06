// src/App.tsx
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PowerUsage from './components/PowerUsage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedGPUCompany, setSelectedGPUCompany] = useState('Nvidia'); // lifted state

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Determine background based on selected GPU company
  const backgroundClass =
  selectedGPUCompany === 'Nvidia'
    ? "bg-gradient-to-r from-[#76b900] to-gray-100 dark:from-green-900 dark:to-gray-700"
    : selectedGPUCompany === 'Intel'
      ? "bg-gradient-to-r from-[#0071c5] to-gray-100 dark:from-blue-900 dark:to-gray-700"
      : selectedGPUCompany === 'AMD'
        ? "bg-gradient-to-r from-[#ED1C24] to-gray-100 dark:from-red-900 dark:to-gray-700"
        : "bg-gradient-to-r from-gray-500 to-gray-200 dark:from-gray-800 dark:to-gray-700";

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`min-h-screen ${backgroundClass}`}>
        <nav className="bg-white shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between px-8 py-6">
            <h1 className="text-4xl font-extrabold dark:text-white"> My GPU Measure</h1>
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="px-4 py-2 bg-gray-100 border rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </nav>
        <main className="p-8">
          <div className="max-w-6xl p-10 mx-auto bg-white rounded-lg shadow-xl dark:bg-gray-900">
            <PowerUsage 
              selectedGPUCompany={selectedGPUCompany} 
              onCompanyChange={setSelectedGPUCompany} 
            />
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}