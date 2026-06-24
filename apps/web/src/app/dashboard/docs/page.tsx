export default function DocsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">API Documentation</h1>

      {/* Quick Start */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Quick Start</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">1. Install OpenAI SDK</h3>
            <pre className="bg-[var(--bg-secondary)] p-4 rounded-lg font-mono text-sm overflow-x-auto">
              pip install openai
            </pre>
          </div>
          <div>
            <h3 className="font-medium mb-2">2. Initialize Client</h3>
            <pre className="bg-[var(--bg-secondary)] p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`from openai import OpenAI

client = OpenAI(
    api_key="qlens-sk-live_your_api_key",
    base_url="https://api.qlens.ai/v1"
)`}
            </pre>
          </div>
          <div>
            <h3 className="font-medium mb-2">3. Make a Request</h3>
            <pre className="bg-[var(--bg-secondary)] p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`response = client.chat.completions.create(
    model="qlens-fast",
    messages=[{"role": "user", "content": "Hello!"}],
    max_tokens=1000
)
print(response.choices[0].message.content)`}
            </pre>
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">OpenAI Compatible Endpoints</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left py-2 px-4 text-[var(--text-secondary)]">Method</th>
                <th className="text-left py-2 px-4 text-[var(--text-secondary)]">Endpoint</th>
                <th className="text-left py-2 px-4 text-[var(--text-secondary)]">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border-color)]/50"><td className="py-2 px-4"><span className="badge badge-info">POST</span></td><td className="py-2 px-4 font-mono">/v1/chat/completions</td><td className="py-2 px-4">Chat completion (streaming supported)</td></tr>
              <tr className="border-b border-[var(--border-color)]/50"><td className="py-2 px-4"><span className="badge badge-info">POST</span></td><td className="py-2 px-4 font-mono">/v1/embeddings</td><td className="py-2 px-4">Generate embeddings</td></tr>
              <tr><td className="py-2 px-4"><span className="badge badge-success">GET</span></td><td className="py-2 px-4 font-mono">/v1/models</td><td className="py-2 px-4">List available models</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Anthropic Compatible Endpoints</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left py-2 px-4 text-[var(--text-secondary)]">Method</th>
                <th className="text-left py-2 px-4 text-[var(--text-secondary)]">Endpoint</th>
                <th className="text-left py-2 px-4 text-[var(--text-secondary)]">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border-color)]/50"><td className="py-2 px-4"><span className="badge badge-info">POST</span></td><td className="py-2 px-4 font-mono">/v1/messages</td><td className="py-2 px-4">Message completion (streaming supported)</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Auth */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Authentication</h2>
        <p className="text-[var(--text-secondary)] mb-3">All requests require an API key in the Authorization header:</p>
        <pre className="bg-[var(--bg-secondary)] p-4 rounded-lg font-mono text-sm">
          Authorization: Bearer qlens-sk-live_your_api_key
        </pre>
        <p className="text-[var(--text-secondary)] mt-3 text-sm">Get your API key from the <a href="/dashboard/api-keys" className="text-[var(--accent)] hover:underline">API Keys page</a>.</p>
      </div>
    </div>
  );
}
