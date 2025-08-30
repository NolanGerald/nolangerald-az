import { WorkingN64Scene } from "../components/WorkingN64Scene";

export default function About() {
  return (
    <main 
      className="text-white overflow-y-scroll"
      style={{
        scrollSnapType: 'y mandatory',
        height: '100vh'
      }}
    >
      {/* Section 1 - Dark Gray */}
      <section 
        className="flex items-center justify-center p-8"
        style={{
          height: '100vh',
          backgroundColor: '#1f2937', // gray-800
          scrollSnapAlign: 'start'
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-8">About Me</h1>
          <div className="flex justify-center mb-8">
            <WorkingN64Scene />
          </div>
          <p className="text-xl leading-relaxed">
            Welcome to my story. I'm passionate about creating digital experiences 
            that blend creativity with technical excellence.
          </p>
        </div>
      </section>

      {/* Section 2 - Darker Gray */}
      <section 
        className="flex items-center justify-center p-8"
        style={{
          height: '100vh',
          backgroundColor: '#111827', // gray-900
          scrollSnapAlign: 'start'
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-8">Debug Log</h2>
          <div className="text-left max-w-2xl mx-auto">
            <textarea
              readOnly
              className="w-full h-96 text-xs font-mono bg-gray-900 text-green-400 border border-gray-600 rounded p-4 resize-none"
              placeholder="Rotation log data will appear here when you interact with the N64 scene above..."
              id="debug-log-textarea"
            />
          </div>
        </div>
      </section>

      {/* Section 3 - Dark Gray */}
      <section 
        className="flex items-center justify-center p-8"
        style={{
          height: '100vh',
          backgroundColor: '#1f2937', // gray-800
          scrollSnapAlign: 'start'
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-8">Skills & Expertise</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">Frontend</h3>
              <p className="text-gray-300">React, Next.js, TypeScript, CSS</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">Backend</h3>
              <p className="text-gray-300">Node.js, APIs, Databases</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">Tools</h3>
              <p className="text-gray-300">Git, Docker, AWS, Figma</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">Physics</h3>
              <p className="text-gray-300">Matter.js, Three.js, WebGL</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">Mobile</h3>
              <p className="text-gray-300">Responsive Design, PWAs</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">Animation</h3>
              <p className="text-gray-300">Framer Motion, CSS Animations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - Darker Gray */}
      <section 
        className="flex items-center justify-center p-8"
        style={{
          height: '100vh',
          backgroundColor: '#111827', // gray-900
          scrollSnapAlign: 'start'
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-8">Let's Connect</h2>
          <p className="text-xl leading-relaxed mb-8">
            I'm always interested in new opportunities and collaborations. 
            Let's build something amazing together.
          </p>
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <p className="text-gray-300">Professional Work</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <p className="text-gray-300">Side Projects</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <p className="text-gray-300">Collaborations</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}