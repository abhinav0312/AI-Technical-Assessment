import { Link } from 'react-router-dom';
import { Terminal, Shield, GitBranch, Cpu } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-[#333333] bg-[#1a1a1a] py-12 text-sm text-[#9ca3af]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#ffa116] text-black shadow-xs font-bold">
                <Terminal className="h-4 w-4" />
              </div>
              <span className="font-bold text-[#ffffff] tracking-tight">DevMind AI</span>
            </div>
            <p className="text-xs text-[#9ca3af] leading-relaxed max-w-xs">
              Next-generation technical assessment platform combining competitive programming arenas with deep cognitive telemetry and multi-file systems simulation.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-400 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              All Sandboxes Operational
            </div>
          </div>

          {/* Core Features */}
          <div>
            <h4 className="text-xs font-bold text-[#ffffff] uppercase tracking-wider mb-3">Arena & Features</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/challenges" className="hover:text-[#ffa116] transition-colors">Quest Problem Bank</Link></li>
              <li><Link to="/interview" className="hover:text-[#ffa116] transition-colors">Interview AI Arena</Link></li>
              <li><Link to="/bughunter" className="hover:text-[#ffa116] transition-colors">BugHunter Debugging</Link></li>
              <li><Link to="/devsim" className="hover:text-[#ffa116] transition-colors">DevSim Architecture Sandbox</Link></li>
              <li><Link to="/skillgraph" className="hover:text-[#ffa116] transition-colors">SkillGraph Radar</Link></li>
            </ul>
          </div>

          {/* Solutions & Audience */}
          <div>
            <h4 className="text-xs font-bold text-[#ffffff] uppercase tracking-wider mb-3">Platform Solutions</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/#pricing" className="hover:text-[#ffa116] transition-colors">Pricing & Plans</a></li>
              <li><a href="/#features" className="hover:text-[#ffa116] transition-colors">For Developers</a></li>
              <li><a href="/#features" className="hover:text-[#ffa116] transition-colors">For Technical Recruiters</a></li>
              <li><Link to="/login" className="hover:text-[#ffa116] transition-colors">Candidate Sandbox</Link></li>
              <li><Link to="/register" className="hover:text-[#ffa116] transition-colors">Create Free Account</Link></li>
            </ul>
          </div>

          {/* Security & Trust */}
          <div>
            <h4 className="text-xs font-bold text-[#ffffff] uppercase tracking-wider mb-3">Enterprise Trust</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-[#ffa116]" /> Argon2id Cryptography</li>
              <li className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-[#ffa116]" /> Isolated Sandboxed Judge</li>
              <li className="flex items-center gap-1.5"><GitBranch className="h-3.5 w-3.5 text-[#ffa116]" /> ThinkTrace Dual-Tier AI</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#333333] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6b7280] gap-4">
          <p>© {new Date().getFullYear()} DevMind AI. Built for competitive programmers and software engineers worldwide.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#ffffff] transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#ffffff] transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#ffffff] transition-colors cursor-pointer">Security Certifications</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
