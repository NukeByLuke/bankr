import { Info, Github, Mail, Heart, Shield, Clock, Zap } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6 transition-colors duration-300">
      <div className="space-y-2">
        <h1>About Bankr</h1>
        <p className="text-muted max-w-2xl">
          Learn more about Bankr, your modern financial management companion.
        </p>
      </div>

      {/* Hero Card */}
      <section className="glass-card rounded-2xl p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[rgba(var(--accent-from-rgb),0.35)] to-[rgba(var(--accent-to-rgb),0.25)] shadow-[0_0_40px_rgba(var(--accent-from-rgb),0.3)]">
            <span className="text-6xl">🏦</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-bold mb-2">Bankr</h2>
            <p className="text-xl text-muted mb-4">Modern Financial Management</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="rounded-full bg-[var(--accent-to)]/10 px-4 py-1.5 text-sm font-medium text-[var(--accent-to)]">
                Version 1.0.0
              </span>
              <span className="rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-500">
                Beta
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover-glow">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[rgba(var(--accent-from-rgb),0.2)] to-[rgba(var(--accent-to-rgb),0.1)] mb-4">
            <Zap className="h-6 w-6 text-[var(--accent-to)]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
          <p className="text-sm text-muted">
            Built with modern technologies for instant performance and smooth interactions.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover-glow">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 mb-4">
            <Shield className="h-6 w-6 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
          <p className="text-sm text-muted">
            Your financial data is encrypted and stored securely. We never sell your data.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover-glow">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 mb-4">
            <Clock className="h-6 w-6 text-purple-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
          <p className="text-sm text-muted">
            Stay on top of your finances with live updates and automatic synchronization.
          </p>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="glass-card rounded-2xl p-6 md:p-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Info className="h-6 w-6 text-[var(--accent-to)]" />
            Technology Stack
          </h2>
          <p className="text-muted">Built with modern, industry-leading technologies</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-subtle glass-input p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted mb-3">Frontend</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--accent-to)]" />
                React 18 + TypeScript
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--accent-to)]" />
                Vite
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--accent-to)]" />
                TanStack Query
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--accent-to)]" />
                Tailwind CSS
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-subtle glass-input p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted mb-3">Backend</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Fastify
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Prisma ORM
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                PostgreSQL
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Docker
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact & Links */}
      <section className="glass-card rounded-2xl p-6 md:p-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold">Get in Touch</h2>
          <p className="text-muted">Questions, feedback, or just want to say hi?</p>
        </header>

        <div className="space-y-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-2xl border border-subtle glass-input p-5 transition-all duration-300 hover-glow"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-500/20 to-gray-600/10">
                <Github className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">GitHub</h3>
                <p className="text-xs text-muted">View source code and contribute</p>
              </div>
            </div>
            <span className="text-muted group-hover:text-primary transition-colors duration-300">→</span>
          </a>

          <a
            href="mailto:support@bankr.app"
            className="group flex items-center justify-between rounded-2xl border border-subtle glass-input p-5 transition-all duration-300 hover-glow"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10">
                <Mail className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Email Support</h3>
                <p className="text-xs text-muted">support@bankr.app</p>
              </div>
            </div>
            <span className="text-muted group-hover:text-primary transition-colors duration-300">→</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <div className="rounded-2xl border border-dashed border-subtle px-6 py-5 text-center">
        <p className="text-sm text-muted flex items-center justify-center gap-2">
          Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> for better financial management
        </p>
        <p className="text-xs text-muted mt-2">
          © 2024 Bankr. All rights reserved.
        </p>
      </div>
    </div>
  );
}
