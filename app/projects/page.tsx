export default function Projects() {
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Projects</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Project 1</h2>
            <p className="text-gray-300 mb-4">
              Description of your first project will go here.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-600 rounded text-sm">React</span>
              <span className="px-2 py-1 bg-green-600 rounded text-sm">Node.js</span>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Project 2</h2>
            <p className="text-gray-300 mb-4">
              Description of your second project will go here.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-purple-600 rounded text-sm">TypeScript</span>
              <span className="px-2 py-1 bg-yellow-600 rounded text-sm">Next.js</span>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Project 3</h2>
            <p className="text-gray-300 mb-4">
              Description of your third project will go here.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-red-600 rounded text-sm">Python</span>
              <span className="px-2 py-1 bg-indigo-600 rounded text-sm">AI/ML</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}