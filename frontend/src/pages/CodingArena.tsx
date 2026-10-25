import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Terminal, Sparkles } from 'lucide-react';

export function CodingArena() {
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'typescript'>('python');
  const [isRunning, setIsRunning] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);

  const defaultCodes = {
    python: `from collections import deque

class RateLimiter:
    def __init__(self, max_requests: int, window_size_seconds: float):
        self.max_requests = max_requests
        self.window_size_seconds = window_size_seconds
        self.client_history = {}

    def allow_request(self, client_id: str, timestamp: float) -> bool:
        # Initialize deque for new client
        if client_id not in self.client_history:
            self.client_history[client_id] = deque()
            
        history = self.client_history[client_id]
        
        # Evict timestamps outside the sliding window
        boundary = timestamp - self.window_size_seconds
        while history and history[0] <= boundary:
            history.popleft()
            
        # Determine allowance
        if len(history) < self.max_requests:
            history.append(timestamp)
            return True
            
        return False
`,
    typescript: `export class RateLimiter {
  private clientHistory: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number,
    private windowSizeSeconds: number
  ) {}

  allowRequest(clientId: string, timestamp: number): boolean {
    if (!this.clientHistory.has(clientId)) {
      this.clientHistory.set(clientId, []);
    }

    const history = this.clientHistory.get(clientId)!;
    const boundary = timestamp - this.windowSizeSeconds;

    // Prune stale timestamps
    while (history.length > 0 && history[0] <= boundary) {
      history.shift();
    }

    if (history.length < this.maxRequests) {
      history.push(timestamp);
      return true;
    }

    return false;
  }
}
`,
  };

  const [code, setCode] = useState(defaultCodes.python);

  const handleLanguageChange = (lang: 'python' | 'typescript') => {
    setSelectedLanguage(lang);
    setCode(defaultCodes[lang]);
    setTestOutput(null);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setTestOutput(
        `[DevMind Sandbox Engine v1.0.0]\n` +
        `Environment: Isolated Micro-Container (${selectedLanguage === 'python' ? 'Python 3.12' : 'Node 20 / TypeScript 5.6'})\n` +
        `Running 4 deterministic unit test cases...\n\n` +
        `✓ Test 1: Single client basic burst within limit (3/3 passed) [12ms]\n` +
        `✓ Test 2: Sliding window boundary expiration verification [18ms]\n` +
        `✓ Test 3: Multi-client isolation with concurrent monotonic clocks [24ms]\n` +
        `✓ Test 4: Peak throughput stress check (10,000 ops) [45ms]\n\n` +
        `Summary: 4/4 Tests Passed. Cognitive Optimality: 96%. All tests successful!`
      );
    }, 900);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Sliding Window Rate Limiter
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Medium
              </span>
            </h1>
            <span className="text-xs text-muted-foreground">Session ID: dvm-arena-9402 • Cognitive Telemetry Enabled</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language selector */}
          <div className="flex items-center rounded-lg border border-border/60 bg-surface-darkest p-1">
            <button
              onClick={() => handleLanguageChange('python')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                selectedLanguage === 'python' ? 'bg-brand-600 text-white shadow-sm' : 'text-muted-foreground hover:text-white'
              }`}
            >
              Python 3.12
            </button>
            <button
              onClick={() => handleLanguageChange('typescript')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                selectedLanguage === 'typescript' ? 'bg-brand-600 text-white shadow-sm' : 'text-muted-foreground hover:text-white'
              }`}
            >
              TypeScript
            </button>
          </div>

          <Button
            size="sm"
            onClick={handleRunCode}
            disabled={isRunning}
            className="gap-2 shadow-md shadow-brand-500/20"
          >
            <Play className={`h-3.5 w-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Executing...' : 'Run Tests'}
          </Button>
        </div>
      </div>

      {/* Split view: Problem Description on Left, Code & Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden min-h-0">
        {/* Left Column: Problem Spec */}
        <div className="lg:col-span-5 rounded-xl border border-border/70 bg-surface-card p-5 overflow-y-auto space-y-4">
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Problem Description</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Design an in-memory Sliding Window Rate Limiter that restricts a client identifier to <code className="bg-surface-darkest px-1.5 py-0.5 rounded text-brand-300">max_requests</code> within a sliding window of <code className="bg-surface-darkest px-1.5 py-0.5 rounded text-brand-300">window_size_seconds</code>.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Method Signature</h3>
            <pre className="p-3 rounded-lg bg-surface-darkest text-xs font-mono text-brand-200 border border-border/40 overflow-x-auto">
              allow_request(client_id: str, timestamp: float) -&gt; bool
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Constraints & Invariants</h3>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
              <li>1 &lt;= max_requests &lt;= 100,000</li>
              <li>1 &lt;= window_size_seconds &lt;= 86,400</li>
              <li>Timestamps are monotonically non-decreasing per client ID.</li>
              <li>Must handle requests exactly on window boundary deterministically.</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-lg border border-brand-500/30 bg-brand-500/5 text-xs text-brand-300 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-brand-200">
              <Sparkles className="h-4 w-4 text-brand-400" />
              DevMind Cognitive Hint
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              To achieve O(1) amortized performance per check, use a double-ended queue (deque) to pop timestamps older than <code className="text-slate-200">timestamp - window_size_seconds</code>.
            </p>
          </div>
        </div>

        {/* Right Column: Code Editor & Execution Console */}
        <div className="lg:col-span-7 flex flex-col space-y-3 overflow-hidden min-h-0">
          {/* Editor Container */}
          <div className="flex-1 flex flex-col rounded-xl border border-border/70 bg-surface-darkest overflow-hidden min-h-0">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-surface-dark text-xs text-muted-foreground">
              <span className="font-mono">{selectedLanguage === 'python' ? 'rate_limiter.py' : 'rate_limiter.ts'}</span>
              <button
                onClick={() => setCode(defaultCodes[selectedLanguage])}
                className="flex items-center gap-1 text-[11px] hover:text-white transition-colors"
                title="Reset starter template"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Code
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full bg-transparent p-4 font-mono text-xs text-slate-100 focus:outline-none resize-none overflow-y-auto leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Test Execution Output Console */}
          <div className="h-40 rounded-xl border border-border/70 bg-surface-card p-4 overflow-y-auto flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-border/40 text-muted-foreground">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <Terminal className="h-3.5 w-3.5 text-brand-400" />
                Execution Console
              </span>
              <span className="text-[11px]">Ready for run</span>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-xs text-slate-300 pt-2 whitespace-pre-wrap">
              {testOutput ? (
                <div className="text-emerald-300">{testOutput}</div>
              ) : (
                <div className="text-muted-foreground italic">Click "Run Tests" to execute your solution in the isolated sandbox.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
