import React from 'react';

export default function LandingPage({ onGetStarted, onLogin, isAuthenticated }) {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Navigation */}
      <header className="bg-surface/90 backdrop-blur-md border-b border-outline-variant sticky top-0 z-50">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto px-4 md:px-8 h-16">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              hexagon
            </span>
            <span className="font-extrabold text-xl tracking-tight text-primary">
              Nexus-AI
            </span>
          </div>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-on-surface-variant">
            <a href="#features" className="hover:text-primary transition-colors">
              Platform Features
            </a>
            <a href="#workflow" className="hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#preview" className="hover:text-primary transition-colors">
              Live Preview
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={onGetStarted}
                className="px-4 py-2 bg-primary text-on-primary hover:bg-surface-tint rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span>Go to Workspace</span>
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </button>
            ) : (
              <>
                <button
                  onClick={onLogin}
                  className="px-3.5 py-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Log in
                </button>
                <button
                  onClick={onGetStarted}
                  className="px-4 py-2 bg-primary text-on-primary hover:bg-surface-tint rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_forward
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden hero-pattern pt-12 md:pt-20 pb-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-primary text-xs font-bold mb-6 shadow-xs border border-primary-fixed-dim">
            <span className="material-symbols-outlined text-[16px]">
              verified
            </span>
            <span>Next-Gen Verified Multi-Modal Q&amp;A Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-on-surface tracking-tight leading-[1.15] mb-6">
            Intelligent Document &amp; Media Analysis{' '}
            <span className="text-primary block sm:inline">
              with Verified Citations
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-8">
            Instantly synthesize complex corporate PDFs, stakeholder audio recordings,
            and video briefings. Ask nuanced questions with precision timestamps and
            ground-truth citations.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-6 py-3.5 bg-primary text-on-primary hover:bg-surface-tint rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Workspace</span>
              <span className="material-symbols-outlined text-[18px]">
                rocket_launch
              </span>
            </button>
            <a
              href="#preview"
              className="w-full sm:w-auto px-6 py-3.5 bg-surface-container-lowest border border-outline-variant hover:border-primary/50 text-on-surface rounded-xl text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                play_circle
              </span>
              <span>Explore Interactive Demo</span>
            </a>
          </div>

          {/* Live Preview Card */}
          <div
            id="preview"
            className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-[0px_12px_40px_rgba(0,0,0,0.08)] overflow-hidden text-left"
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-outline-variant bg-surface flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-error/70"></span>
                <span className="w-3 h-3 rounded-full bg-secondary-container"></span>
                <span className="w-3 h-3 rounded-full bg-tertiary"></span>
                <span className="text-xs font-semibold text-on-surface ml-2">
                  Session: Q3 Earnings Call &amp; Financial Analysis
                </span>
              </div>
              <span className="text-[11px] font-mono text-tertiary bg-tertiary-container/15 px-2 py-0.5 rounded-full font-semibold">
                ● Live Demo Mode
              </span>
            </div>

            {/* Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 p-6 md:p-8 gap-6">
              {/* Question & Answer Column */}
              <div className="lg:col-span-7 space-y-4">
                {/* User Prompt */}
                <div className="flex justify-end">
                  <div className="bg-primary text-on-primary rounded-xl rounded-tr-xs p-3.5 text-xs max-w-[85%] shadow-xs">
                    What were the key drivers for revenue growth in APAC, and did
                    they mention supply chain impacts?
                  </div>
                </div>

                {/* AI Answer */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                    AI
                  </div>
                  <div className="bg-surface-container-low rounded-xl rounded-tl-xs p-4 text-xs text-on-surface border border-outline-variant/60 shadow-xs flex-1 space-y-2">
                    <p className="font-semibold text-on-surface">
                      Based on the uploaded Q3 report and CEO audio briefing:
                    </p>
                    <p className="text-on-surface-variant leading-relaxed">
                      1. APAC revenue rose by 14% year-over-year, driven by
                      enterprise software deployments{' '}
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-secondary-container/20 text-secondary font-bold text-[10px] border border-secondary-container/40">
                        [Page 14]
                      </span>
                      .
                    </p>
                    <p className="text-on-surface-variant leading-relaxed">
                      2. Freight disruptions caused a temporary margin dip, but the
                      CEO reiterated stabilization expectations{' '}
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-secondary-container/20 text-secondary font-bold text-[10px] border border-secondary-container/40">
                        [01:23]
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Media Preview Column */}
              <div className="lg:col-span-5 bg-surface rounded-xl p-4 border border-outline-variant flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-on-surface mb-2">
                    <span className="flex items-center gap-1.5 text-primary">
                      <span className="material-symbols-outlined text-[18px]">
                        audio_file
                      </span>
                      <span>CEO_Earnings_Call.mp3</span>
                    </span>
                    <span className="font-mono text-[11px] text-on-surface-variant">
                      01:23 / 14:30
                    </span>
                  </div>

                  {/* Waveform graphic */}
                  <div className="h-20 bg-surface-container rounded-lg p-2 flex items-end justify-between gap-1 my-3">
                    {Array.from({ length: 32 }, (_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full ${
                          i < 12 ? 'bg-primary' : 'bg-surface-variant'
                        }`}
                        style={{
                          height: `${Math.floor(Math.sin(i * 0.4) * 40 + 50)}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-secondary-container/10 border border-secondary-container/30 rounded-lg text-[11px] text-on-surface flex items-center justify-between">
                  <span className="font-medium text-secondary">
                    Active Citation Pin at [01:23]
                  </span>
                  <span className="text-primary font-bold">Seeked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl md:text-4xl font-extrabold text-on-surface tracking-tight mb-3">
            Engineered for Precision &amp; Verification
          </h2>
          <p className="text-xs md:text-sm text-on-surface-variant">
            Everything you need to turn dense multi-modal corporate files into
            actionable, verifiable knowledge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: 'cloud_sync',
              title: 'Multi-Modal Ingestion',
              desc: 'Seamlessly processes PDF docs, MP3/WAV audio recordings, and MP4/MKV video files with automatic Whisper transcription.',
            },
            {
              icon: 'pin_invoke',
              title: 'Ground-Truth Citations',
              desc: 'Every generated claim links to an exact PDF page or audio timestamp. Click any citation chip to jump right to the source.',
            },
            {
              icon: 'database',
              title: 'FAISS Vector RAG',
              desc: 'High-speed local dense embeddings powered by HuggingFace MiniLM and LangChain vector index pipelines.',
            },
            {
              icon: 'graphic_eq',
              title: 'Synchronized Media Player',
              desc: 'Interactive audio visualizer and video canvas with speed controls, waveform scrubber, and transcript export.',
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-xs hover:border-primary/50 transition-all hover:shadow-[0px_8px_24px_rgba(0,0,0,0.06)]"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[26px]">
                  {card.icon}
                </span>
              </div>
              <h3 className="text-base font-bold text-on-surface mb-2">
                {card.title}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-16 bg-surface-container-low px-4 md:px-8 border-y border-outline-variant">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight mb-2">
              Three Steps to Actionable Answers
            </h2>
            <p className="text-xs md:text-sm text-on-surface-variant">
              How Nexus-AI turns unstructured files into verified insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Drop Files in Library',
                desc: 'Upload multi-page PDFs, meeting recordings, or earnings call videos into your workspace.',
              },
              {
                step: '02',
                title: 'AI Processing & Indexing',
                desc: 'Whisper extracts voice transcripts, pdfplumber parses text, and FAISS builds vector indices with automated summarization.',
              },
              {
                step: '03',
                title: 'Ask & Verify Citations',
                desc: 'Query across multiple documents simultaneously. Click amber chips to jump to audio timestamps or PDF pages.',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-xs relative"
              >
                <span className="text-4xl font-extrabold text-primary/15 absolute top-5 right-5 font-mono">
                  {step.step}
                </span>
                <h3 className="text-sm font-bold text-on-surface mb-2 mt-2">
                  {step.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 md:px-8 bg-surface border-t border-outline-variant">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              hexagon
            </span>
            <span className="font-bold text-on-surface">Nexus-AI Platform</span>
            <span>• © 2026 All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onGetStarted}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Workspace
            </button>
            <button
              onClick={onLogin}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Log In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
