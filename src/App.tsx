import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PowerUsage from './components/PowerUsage';

// Create a client
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg">
          <div className="px-4 py-3">
            <h1 className="text-2xl font-bold text-gray-800">GPU Measure</h1>
          </div>
        </nav>
        <main className="p-4">
          <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Welcome to GPU Measure</h2>
            <p className="text-gray-600">
              A simple and efficient way to monitor your GPU performance.
            </p>
            <PowerUsage />
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App; 