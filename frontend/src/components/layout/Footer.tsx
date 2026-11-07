import { Link } from 'react-router-dom';
import { Terminal, Shield, GitBranch, Cpu } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-12 text-sm text-slate-600">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white shadow-xs">
                <Terminal className="h-4 w-4" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight">DevMind AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              The modern technical assessment platform helping developers demonstrate their skills and grow with AI-powered feedback.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-600 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              All Systems Operational
            </div>
          </div>

          {/* Core Features */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/challenges" className="hover:text-brand-600 transition-colors">Coding Arena</Link></li>
              <li><Link to="/bughunter" className="hover:text-brand-600 transition-colors">BugHunter Debugging</Link></li>
              <li><Link to="/dashboard/skillgraph" className="hover:text-brand-600 transition-colors">SkillGraph Visualizer</Link></li>
              <li><a href="/#workflow" className="hover:text-brand-600 transition-colors">ThinkTrace AI Insights</a></li>
            </ul>
          </div>

          {/* Solutions & Audience */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Solutions</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/#audience" className="hover:text-brand-600 transition-colors">For Developers</a></li>
              <li><a href="/#audience" className="hover:text-brand-600 transition-colors">For Engineering Teams</a></li>
              <li><Link to="/login" className="hover:text-brand-600 transition-colors">Candidate Sandbox</Link></li>
              <li><Link to="/register" className="hover:text-brand-600 transition-colors">Create Free Account</Link></li>
            </ul>
          </div>

          {/* Security & Trust */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Trust & Security</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-brand-600" /> Secure Argon2id Auth</li>
              <li className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-brand-600" /> Isolated Code Execution</li>
              <li className="flex items-center gap-1.5"><GitBranch className="h-3.5 w-3.5 text-brand-600" /> Transparent AI Evaluations</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} DevMind AI. Designed for software engineers.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-700 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-700 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-700 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
