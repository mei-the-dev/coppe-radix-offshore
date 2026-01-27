import React, { useState } from 'react';
import { Sparkles, Code, Droplet, Box, Eye, Layers } from 'lucide-react';

export default function GlassmorphismTutorial() {
  const [activeTab, setActiveTab] = useState('basics');
  const [blurAmount, setBlurAmount] = useState(10);
  const [transparency, setTransparency] = useState(0.2);
  const [borderOpacity, setBorderOpacity] = useState(0.3);

  const tabs = [
    { id: 'basics', label: 'Basics', icon: Sparkles },
    { id: 'properties', label: 'Properties', icon: Code },
    { id: 'examples', label: 'Examples', icon: Box },
    { id: 'principles', label: 'Principles', icon: Eye },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-400/10 rounded-full blur-3xl top-1/3 right-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-96 h-96 bg-pink-400/10 rounded-full blur-3xl bottom-0 left-1/3 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            Glassmorphism
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            The frosted glass aesthetic that creates depth, hierarchy, and visual elegance
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="group relative px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105"
                style={{
                  background: isActive 
                    ? 'rgba(255, 255, 255, 0.25)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: isActive 
                    ? '0 8px 32px rgba(0, 0, 0, 0.1)' 
                    : '0 4px 16px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div className="flex items-center gap-2 text-white">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div 
          className="rounded-3xl p-8 max-w-5xl mx-auto"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          {activeTab === 'basics' && (
            <div className="space-y-6 text-white">
              <h2 className="text-3xl font-bold mb-6">What is Glassmorphism?</h2>
              
              <div className="space-y-4 text-lg leading-relaxed">
                <p>
                  Glassmorphism is a design trend that creates interfaces resembling frosted glass. 
                  It combines transparency, blur effects, and subtle borders to create depth and hierarchy.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-8">
                  <div 
                    className="p-6 rounded-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Layers className="w-8 h-8 mb-3 text-blue-200" />
                    <h3 className="text-xl font-semibold mb-2">Layered Depth</h3>
                    <p className="text-white/80">Creates visual hierarchy through transparency and blur</p>
                  </div>
                  
                  <div 
                    className="p-6 rounded-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Droplet className="w-8 h-8 mb-3 text-purple-200" />
                    <h3 className="text-xl font-semibold mb-2">Soft Elegance</h3>
                    <p className="text-white/80">Blurred backgrounds create a premium, modern feel</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="space-y-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Key CSS Properties</h2>
              
              <div className="space-y-8">
                {/* Background */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm">1</span>
                    Semi-transparent Background
                  </h3>
                  <div 
                    className="p-4 rounded-xl font-mono text-sm mb-4"
                    style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    background: rgba(255, 255, 255, 0.1);<br/>
                    /* or */<br/>
                    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
                  </div>
                </div>

                {/* Backdrop Filter */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm">2</span>
                    Backdrop Blur (The Magic!)
                  </h3>
                  <div 
                    className="p-4 rounded-xl font-mono text-sm mb-4"
                    style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    backdrop-filter: blur(10px);<br/>
                    -webkit-backdrop-filter: blur(10px); /* Safari */
                  </div>
                  
                  {/* Interactive Demo */}
                  <div className="mt-4">
                    <label className="block mb-2 text-sm font-medium">
                      Blur Amount: {blurAmount}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={blurAmount}
                      onChange={(e) => setBlurAmount(e.target.value)}
                      className="w-full"
                    />
                    <div 
                      className="mt-4 p-6 rounded-2xl text-center font-semibold"
                      style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: `blur(${blurAmount}px)`,
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      Live Preview
                    </div>
                  </div>
                </div>

                {/* Border */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm">3</span>
                    Subtle Border
                  </h3>
                  <div 
                    className="p-4 rounded-xl font-mono text-sm"
                    style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    border: 1px solid rgba(255, 255, 255, 0.2);<br/>
                    /* Creates the glass edge effect */
                  </div>
                </div>

                {/* Shadow */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm">4</span>
                    Soft Shadow
                  </h3>
                  <div 
                    className="p-4 rounded-xl font-mono text-sm"
                    style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="space-y-6 text-white">
              <h2 className="text-3xl font-bold mb-6">Real-World Examples</h2>
              
              <div className="grid gap-6">
                {/* Card Example */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Glass Card</h3>
                  <div 
                    className="p-6 rounded-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <h4 className="text-2xl font-bold mb-2">AI Agent Dashboard</h4>
                    <p className="text-white/80 mb-4">Monitor your agent's performance in real-time</p>
                    <div className="flex gap-4">
                      <div 
                        className="flex-1 p-4 rounded-xl"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <div className="text-3xl font-bold">1,247</div>
                        <div className="text-sm text-white/70">Tasks Completed</div>
                      </div>
                      <div 
                        className="flex-1 p-4 rounded-xl"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <div className="text-3xl font-bold">98.5%</div>
                        <div className="text-sm text-white/70">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input Example */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Glass Input Field</h3>
                  <input
                    type="text"
                    placeholder="Type your message to the AI..."
                    className="w-full px-6 py-4 rounded-2xl text-white placeholder-white/50 outline-none transition-all duration-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                    }}
                  />
                </div>

                {/* Button Example */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Glass Button</h3>
                  <button
                    className="px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    Send to Agent
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'principles' && (
            <div className="space-y-6 text-white">
              <h2 className="text-3xl font-bold mb-6">Design Principles</h2>
              
              <div className="space-y-6">
                <div 
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <h3 className="text-xl font-semibold mb-3">✨ Use Vibrant Backgrounds</h3>
                  <p className="text-white/80">
                    Glassmorphism works best against colorful gradients or images. The blur effect 
                    needs something interesting to blur!
                  </p>
                </div>

                <div 
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <h3 className="text-xl font-semibold mb-3">🎨 Balance Transparency</h3>
                  <p className="text-white/80">
                    Too opaque? It's just a regular card. Too transparent? Content becomes unreadable. 
                    Sweet spot: rgba(255, 255, 255, 0.1) to 0.2
                  </p>
                </div>

                <div 
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <h3 className="text-xl font-semibold mb-3">🔍 Consider Accessibility</h3>
                  <p className="text-white/80">
                    Ensure text contrast meets WCAG standards. Use darker or lighter text 
                    depending on your background, and test readability carefully.
                  </p>
                </div>

                <div 
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <h3 className="text-xl font-semibold mb-3">⚡ Performance Matters</h3>
                  <p className="text-white/80">
                    Backdrop-filter is GPU-intensive. Use sparingly on mobile devices and 
                    consider fallbacks for older browsers.
                  </p>
                </div>

                <div 
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <h3 className="text-xl font-semibold mb-3">🎯 Layer Thoughtfully</h3>
                  <p className="text-white/80">
                    Create depth by varying blur amounts and opacity across layers. 
                    Foreground elements should have stronger glass effects than background ones.
                  </p>
                </div>
              </div>

              {/* Complete Code Example */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Complete CSS Recipe</h3>
                <div 
                  className="p-6 rounded-xl font-mono text-sm overflow-x-auto"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <pre>{`.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

/* For dark backgrounds */
.glass-card-dark {
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Hover effect */
.glass-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}`}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Tips */}
        <div 
          className="mt-8 p-6 rounded-2xl max-w-5xl mx-auto text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <p className="text-white text-lg">
            💡 <strong>Pro Tip:</strong> For AI agent interfaces, glassmorphism creates a sense of 
            intelligence and sophistication while maintaining visual hierarchy between different 
            information layers.
          </p>
        </div>
      </div>
    </div>
  );
}