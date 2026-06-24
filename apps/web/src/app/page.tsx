export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          AI Models API — <span className="text-brand-600">Simple, Fast, Scalable</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Access premium AI models via OpenAI-compatible & Anthropic-compatible endpoints. 
          Pay per token, track usage, manage keys — all in one dashboard.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/register" className="btn-primary text-lg px-8 py-3">Get Started Free</a>
          <a href="#pricing" className="btn-secondary text-lg px-8 py-3">View Pricing</a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">OpenAI Compatible</h3>
              <p className="text-gray-600">Drop-in replacement for OpenAI SDK. Just change the base URL and API key.</p>
            </div>
            <div className="card">
              <div className="text-3xl mb-4">🔑</div>
              <h3 className="text-xl font-semibold mb-2">API Key Management</h3>
              <p className="text-gray-600">Create, revoke, and manage API keys with per-key quotas and allowed models.</p>
            </div>
            <div className="card">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Usage Tracking</h3>
              <p className="text-gray-600">Real-time token usage, cost tracking, and per-model breakdown.</p>
            </div>
            <div className="card">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Top-Up & Billing</h3>
              <p className="text-gray-600">Purchase token packages, monthly subscriptions, and payment history.</p>
            </div>
            <div className="card">
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2">Anti-Abuse System</h3>
              <p className="text-gray-600">Rate limiting, risk scoring, key sharing detection, and automated alerts.</p>
            </div>
            <div className="card">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">Multi-Model Access</h3>
              <p className="text-gray-600">Access multiple AI models through a single API — plan-based access control.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card text-center">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <p className="text-4xl font-bold text-brand-600 mb-4">$0<span className="text-base font-normal text-gray-500">/mo</span></p>
              <ul className="text-left space-y-2 mb-6 text-gray-600">
                <li>✓ 10K tokens/day</li>
                <li>✓ 1 API key</li>
                <li>✓ Standard models</li>
                <li>✓ Community support</li>
              </ul>
              <a href="/register" className="btn-secondary w-full block">Start Free</a>
            </div>
            <div className="card text-center border-2 border-brand-500 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white px-3 py-1 rounded-full text-sm font-medium">Popular</span>
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <p className="text-4xl font-bold text-brand-600 mb-4">$29<span className="text-base font-normal text-gray-500">/mo</span></p>
              <ul className="text-left space-y-2 mb-6 text-gray-600">
                <li>✓ 1M tokens/month</li>
                <li>✓ 5 API keys</li>
                <li>✓ All models</li>
                <li>✓ Priority support</li>
                <li>✓ Usage analytics</li>
              </ul>
              <a href="/register" className="btn-primary w-full block">Get Pro</a>
            </div>
            <div className="card text-center">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <p className="text-4xl font-bold text-brand-600 mb-4">Custom</p>
              <ul className="text-left space-y-2 mb-6 text-gray-600">
                <li>✓ Unlimited tokens</li>
                <li>✓ Unlimited API keys</li>
                <li>✓ Dedicated models</li>
                <li>✓ SLA guarantee</li>
                <li>✓ Dedicated support</li>
              </ul>
              <a href="#" className="btn-secondary w-full block">Contact Sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-brand-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Build with AI?</h2>
        <p className="text-xl mb-8 opacity-90">Start with 10K free tokens daily. No credit card required.</p>
        <a href="/register" className="bg-white text-brand-600 px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors inline-block">
          Create Free Account
        </a>
      </section>
    </div>
  );
}
