import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Navbar */}
      <nav className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center font-bold text-white">Q</div>
            <span className="text-xl font-bold">QLens AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Features</a>
            <a href="#pricing" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Pricing</a>
            <a href="#faq" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">FAQ</a>
            <Link href="/login" className="btn-secondary">Login</Link>
            <Link href="/register" className="btn-primary">Get API Key</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[var(--accent)]/10 text-[var(--accent)] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            OpenAI & Anthropic Compatible
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            AI API Gateway for{' '}
            <span className="bg-gradient-to-r from-[var(--accent)] to-purple-400 bg-clip-text text-transparent">
              Developers
            </span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
            Akses infrastruktur model internal QLens melalui API key. OpenAI-compatible & Anthropic-compatible endpoint. Billing transparan, quota fleksibel, anti-abuse built-in.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="btn-primary px-8 py-3 text-lg">Get Started Free</Link>
            <a href="#pricing" className="btn-secondary px-8 py-3 text-lg">View Pricing</a>
          </div>
          <div className="mt-12 p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl font-mono text-sm text-left max-w-xl mx-auto">
            <div className="text-[var(--text-secondary)]"># Install SDK</div>
            <div>pip install openai</div>
            <div className="mt-2 text-[var(--text-secondary)]"># Use QLens AI</div>
            <div>
              <span className="text-[var(--accent)]">client</span> = OpenAI(
            </div>
            <div>  api_key=<span className="text-green-400">&quot;qlens-sk-live_xxx&quot;</span>,</div>
            <div>  base_url=<span className="text-green-400">&quot;https://api.qlens.ai/v1&quot;</span></div>
            <div>)</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🔄', title: 'OpenAI Compatible', desc: 'Drop-in replacement. Cukup ganti base_url ke https://api.qlens.ai/v1 dan API key kamu. Works with Cline, Roo Code, Aider, Continue, LiteLLM, LangChain.' },
              { icon: '🎭', title: 'Anthropic Compatible', desc: 'Support /v1/messages endpoint. Claude-compatible API untuk tools yang pakai Anthropic SDK.' },
              { icon: '💰', title: 'Token Billing', desc: 'Bayar per token yang dipakai. Daily quota + monthly quota + top-up token balance. Ga ada biaya tersembunyi.' },
              { icon: '📊', title: 'Real-time Usage', desc: 'Dashboard usage tracking: tokens/hari, tokens/bulan, request logs, model breakdown, cost estimation.' },
              { icon: '🛡️', title: 'Anti-Abuse', desc: 'Risk scoring, shared key detection, bulk account detection, rate limiting otomatis. Protect infrastruktur.' },
              { icon: '💓', title: 'Model Health', desc: 'Real-time monitoring: latency P50/P95, error rate, requests/min, tokens/min, active streams.' },
            ].map((f, i) => (
              <div key={i} className="card hover:border-[var(--accent)]/50 transition-colors">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-[var(--text-secondary)] text-center mb-12">Free trial included. Upgrade anytime.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Free', price: 'Rp0', tokens: '500K tokens/bulan', rpm: '10 RPM', features: ['1 API key', 'qlens-lite model', 'Community support', 'Daily quota reset'], cta: 'Get Started', highlight: false },
              { name: 'Starter', price: 'Rp50K/bln', tokens: '10M tokens/bulan', rpm: '30 RPM', features: ['3 API keys', 'Lite + Fast + Smart', 'Top-up available', 'Usage dashboard'], cta: 'Subscribe', highlight: false },
              { name: 'Pro', price: 'Rp150K/bln', tokens: '50M tokens/bulan', rpm: '60 RPM', features: ['5 API keys', 'All models + Reasoning', 'Priority support', 'Webhook events'], cta: 'Subscribe', highlight: true },
              { name: 'Max', price: 'Rp500K/bln', tokens: '200M tokens/bulan', rpm: '120 RPM', features: ['10 API keys', 'All models + Premium', 'Dedicated support', 'Custom models'], cta: 'Subscribe', highlight: false },
            ].map((p, i) => (
              <div key={i} className={`card ${p.highlight ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' : ''} relative`}>
                {p.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-white text-xs font-medium px-3 py-1 rounded-full">Popular</div>}
                <h3 className="text-xl font-bold mb-1">{p.name}</h3>
                <div className="text-2xl font-bold text-[var(--accent)] mb-1">{p.price}</div>
                <div className="text-sm text-[var(--text-secondary)] mb-4">{p.tokens}</div>
                <div className="text-sm text-[var(--text-secondary)] mb-4">{p.rpm}</div>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f, j) => (
                    <li key={j} className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`block text-center py-2 rounded-lg font-medium transition-colors ${p.highlight ? 'btn-primary' : 'btn-secondary'}`}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'Bagaimana cara pakai QLens AI?', a: 'Install OpenAI SDK, set base_url ke https://api.qlens.ai/v1, dan set API key kamu. Langsung works.' },
              { q: 'Model apa saja yang tersedia?', a: 'qlens-lite (free), qlens-fast, qlens-smart, qlens-reasoning, qlens-agent, qlens-premium. Sesuai plan kamu.' },
              { q: 'Apa bedanya daily quota dan top-up token?', a: 'Daily quota reset setiap hari dari plan. Top-up token ga pernah expired dan dipakai kalau daily quota habis.' },
              { q: 'Bisa pakai di Cline / Roo Code / Aider?', a: 'Ya! Semua tools yang support custom OpenAI base URL bisa pakai QLens AI.' },
              { q: 'Bagaimana sistem billing-nya?', a: 'Bayar per token yang dipakai. Deduction dari daily quota dulu, kalau habis baru dari top-up balance.' },
            ].map((faq, i) => (
              <div key={i} className="card">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-[var(--text-secondary)] text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center bg-[var(--bg-secondary)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-[var(--text-secondary)] mb-8">Daftar sekarang, dapat free trial 500K tokens. Ga perlu kartu kredit.</p>
          <Link href="/register" className="btn-primary px-8 py-3 text-lg">Create Free Account</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center font-bold text-white">Q</div>
              <span className="text-lg font-bold">QLens AI</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">AI API Gateway for developers. OpenAI & Anthropic compatible.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li><a href="#features" className="hover:text-[var(--text-primary)]">Features</a></li>
              <li><a href="#pricing" className="hover:text-[var(--text-primary)]">Pricing</a></li>
              <li><a href="#" className="hover:text-[var(--text-primary)]">Documentation</a></li>
              <li><a href="#" className="hover:text-[var(--text-primary)]">Status</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Integrations</h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li>Cline / Roo Code</li>
              <li>Aider / Continue</li>
              <li>LiteLLM / LangChain</li>
              <li>OpenAI SDK</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li><a href="#" className="hover:text-[var(--text-primary)]">About</a></li>
              <li><a href="#" className="hover:text-[var(--text-primary)]">Contact</a></li>
              <li><a href="#" className="hover:text-[var(--text-primary)]">Terms</a></li>
              <li><a href="#" className="hover:text-[var(--text-primary)]">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-[var(--border-color)] text-center text-sm text-[var(--text-secondary)]">
          © 2026 QLens AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
