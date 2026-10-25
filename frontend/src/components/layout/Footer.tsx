import { Link } from 'react-router-dom';
import { Terminal, Shield, GitBranch, Cpu } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/50 bg-surface-darkest py-12 text-sm text-muted-foreground">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white">
                <Terminal className="h-4 w-4" />
              </div>
              <span className="font-bold text-white tracking-tight">DevMind AI</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Engineering intelligence, adaptive assessment, and process-aware problem solving platform.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Operational v1.0 Foundation
            </div>
          </div>

          {/* Pillars */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Core Pillars</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/#pillars" className="hover:text-white transition-colors">THINK — Process Cognition</a></li>
              <li><a href="/#pillars" className="hover:text-white transition-colors">CODE — Arena & Real Time</a></li>
              <li><a href="/#pillars" className="hover:text-white transition-colors">BUILD — Engineering Sim</a></li>
              <li><a href="/#pillars" className="hover:text-white transition-colors">GROW — SkillGraph Analytics</a></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/challenges" className="hover:text-white transition-colors">Challenge Catalog</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Roadmap & Capabilities</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Developer Portal</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Candidate Sandbox</Link></li>
            </ul>
          </div>

          {/* Architecture info */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Security & Trust</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-brand-400" /> Argon2id Password Security</li>
              <li className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-brand-400" /> Isolated Sandbox Architecture</li>
              <li className="flex items-center gap-1.5"><GitBranch className="h-3.5 w-3.5 text-brand-400" /> Role-Based Access Controls</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>© {new Date().getFullYear()} DevMind AI Engineering. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-muted-foreground/60">FastAPI • React 18 • SQLAlchemy 2.x • PostgreSQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
