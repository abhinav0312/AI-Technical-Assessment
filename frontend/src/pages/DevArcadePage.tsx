import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Keyboard,
  Trophy,
  RotateCcw,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Award,
  Sparkles,
  Zap,
  Terminal,
  Activity,
  Code2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ========================================================
// BROWSER-NATIVE SYNTHESIZER AUDIO MANAGER (Web Audio API)
// ========================================================
class SynthAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playKey() {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650 + Math.random() * 250, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.035);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {}
  }

  playCombo() {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.04);
        osc.stop(ctx.currentTime + idx * 0.04 + 0.18);
      });
    } catch {}
  }

  playEat() {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  playCrash() {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }
}

const audio = new SynthAudio();

// ========================================================
// GAME 1: SPEEDCODER NITRO SNIPPETS
// ========================================================
interface Snippet {
  id: string;
  title: string;
  lang: string;
  code: string;
}

const SPEED_SNIPPETS: Snippet[] = [
  {
    id: 'py-quick-sort',
    title: 'QuickSort Partition (Python)',
    lang: 'Python',
    code: `def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
  },
  {
    id: 'ts-use-debounce',
    title: 'useDebounce Hook (TypeScript)',
    lang: 'TypeScript',
    code: `function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}`,
  },
  {
    id: 'cpp-binary-search',
    title: 'Lower Bound (C++)',
    lang: 'C++',
    code: `int lowerBound(const vector<int>& v, int target) {
    int left = 0, right = v.size();
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (v[mid] >= target) right = mid;
        else left = mid + 1;
    }
    return left;
}`,
  },
  {
    id: 'rust-match-result',
    title: 'Safe Result Handler (Rust)',
    lang: 'Rust',
    code: `fn process_token(raw: Option<String>) -> Result<u64, &'static str> {
    match raw {
        Some(val) if val.len() > 8 => Ok(val.len() as u64),
        Some(_) => Err("Token too short"),
        None => Err("Missing authentication payload"),
    }
}`,
  },
  {
    id: 'sql-window-analytics',
    title: 'Partition Rolling Sum (SQL)',
    lang: 'SQL',
    code: `SELECT user_id, transaction_time, amount,
SUM(amount) OVER (
    PARTITION BY user_id
    ORDER BY transaction_time
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
) as cumulative_spent
FROM ledger_entries;`,
  },
];

// ========================================================
// GAME 2: BYTESNAKE CODE ASSEMBLER LINES
// ========================================================
const CODE_ASSEMBLER_LINES = [
  'import { MemoryPool, ThreadPool } from "@system/core";',
  'const pool = new MemoryPool({ pageSize: 4096 });',
  'const buffer = pool.allocateBuffer(1024 * 64);',
  'const cluster = ThreadPool.spawnWorkerThreads(8);',
  'buffer.writeUint32LE(0xCAFEBABE, 0);',
  'cluster.dispatchTask("HASH_DISTRIBUTE", buffer);',
  'const cache = new Map<string, ArrayBuffer>();',
  'cache.set("SESSION_AUTH_V2", buffer.slice(0, 32));',
  'console.log("Memory Arena Synchronized: 0 Leaks");',
  'return { status: 200, latency_ns: 240 };',
];

export function DevArcadePage() {
  const [activeGame, setActiveGame] = useState<'speedcoder' | 'bytesnake'>('speedcoder');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audio.enabled = next;
  };

  // ========================================================
  // GAME 1 LOGIC: SPEEDCODER NITRO
  // ========================================================
  const [snippetIdx, setSnippetIdx] = useState(0);
  const activeSnippet = SPEED_SNIPPETS[snippetIdx];
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [streak, setStreak] = useState(0);
  const [bestWpm, setBestWpm] = useState<number>(() => {
    return parseInt(localStorage.getItem('devmind_pb_wpm') || '0', 10);
  });
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const resetSpeedCoder = useCallback(() => {
    setTyped('');
    setStartTime(null);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
    setStreak(0);
    setTimeout(() => inputRef.current?.focus(), 40);
  }, []);

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished) return;
    const val = e.target.value;
    const now = Date.now();

    if (!startTime) {
      setStartTime(now);
    }

    // Play tactile mechanical key click
    audio.playKey();

    setTyped(val);

    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === activeSnippet.code[i]) {
        correct++;
      }
    }
    const acc = val.length > 0 ? Math.round((correct / val.length) * 100) : 100;
    setAccuracy(acc);

    // Calculate WPM: (correct characters / 5) / minutes
    const elapsedMinutes = (now - (startTime || now)) / 60000;
    if (elapsedMinutes > 0.008) {
      const currentWpm = Math.round((correct / 5) / elapsedMinutes);
      setWpm(currentWpm);
    }

    // Streak and combo sound
    if (val.length > 0 && val.length % 25 === 0 && val[val.length - 1] === activeSnippet.code[val.length - 1]) {
      setStreak((s) => s + 1);
      audio.playCombo();
    }

    // Completed snippet
    if (val.length >= activeSnippet.code.length) {
      setIsFinished(true);
      const finalMinutes = (now - (startTime || now)) / 60000;
      const finalWpm = Math.round((correct / 5) / finalMinutes);
      setWpm(finalWpm);

      if (finalWpm > bestWpm) {
        setBestWpm(finalWpm);
        localStorage.setItem('devmind_pb_wpm', finalWpm.toString());
      }
      audio.playCombo();
    }
  };

  const getRankBadge = (w: number) => {
    if (w >= 100) return { title: '10x Kernel Wizard 👑', color: 'text-amber-400 bg-amber-500/15 border-amber-500/40' };
    if (w >= 75) return { title: 'Staff Architect ⚡', color: 'text-purple-400 bg-purple-500/15 border-purple-500/40' };
    if (w >= 55) return { title: 'Senior Engineer 🚀', color: 'text-[#ffa116] bg-[#ffa116]/15 border-[#ffa116]/40' };
    if (w >= 35) return { title: 'Full-Stack Dev 💻', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40' };
    return { title: 'Junior Typer 🐢', color: 'text-neutral-400 bg-neutral-500/15 border-neutral-500/40' };
  };

  // ========================================================
  // GAME 2 LOGIC: BYTESNAKE (Matrix Memory Runner)
  // ========================================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snakeScore, setSnakeScore] = useState(0);
  const [snakeBestScore, setSnakeBestScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('devmind_bytesnake_pb') || '0', 10);
  });
  const [compiledLines, setCompiledLines] = useState<string[]>([]);
  const [isSnakeRunning, setIsSnakeRunning] = useState(false);
  const [isSnakeGameOver, setIsSnakeGameOver] = useState(false);
  const [snakeSpeedMultiplier, setSnakeSpeedMultiplier] = useState(1);

  const gameStateRef = useRef({
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 15, y: 10, type: 'malloc' },
    powerUp: null as { x: number; y: number; type: 'gc' | 'overclock' } | null,
    score: 0,
    multiplier: 1,
  });

  const FOOD_ITEMS = [
    { label: 'malloc()', color: '#ffa116' },
    { label: 'hash_map', color: '#00b8a3' },
    { label: 'btree', color: '#38bdf8' },
    { label: 'mutex', color: '#a855f7' },
    { label: 'jwt', color: '#ec4899' },
  ];

  const startSnakeGame = () => {
    gameStateRef.current = {
      snake: [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ],
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: { x: 15, y: 10, type: 'malloc' },
      powerUp: null,
      score: 0,
      multiplier: 1,
    };
    setSnakeScore(0);
    setCompiledLines([]);
    setIsSnakeGameOver(false);
    setIsSnakeRunning(true);
    setSnakeSpeedMultiplier(1);
  };

  useEffect(() => {
    if (activeGame !== 'bytesnake') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridSize = 20; // 20x20 per cell
    const tileCountX = Math.floor(canvas.width / gridSize);
    const tileCountY = Math.floor(canvas.height / gridSize);

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const { dir } = gameStateRef.current;

      if ((key === 'arrowup' || key === 'w') && dir.y === 0) {
        gameStateRef.current.nextDir = { x: 0, y: -1 };
        e.preventDefault();
      } else if ((key === 'arrowdown' || key === 's') && dir.y === 0) {
        gameStateRef.current.nextDir = { x: 0, y: 1 };
        e.preventDefault();
      } else if ((key === 'arrowleft' || key === 'a') && dir.x === 0) {
        gameStateRef.current.nextDir = { x: -1, y: 0 };
        e.preventDefault();
      } else if ((key === 'arrowright' || key === 'd') && dir.x === 0) {
        gameStateRef.current.nextDir = { x: 1, y: 0 };
        e.preventDefault();
      } else if (key === ' ' && isSnakeGameOver) {
        startSnakeGame();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    let intervalId: any;

    const gameLoop = () => {
      if (!isSnakeRunning || isSnakeGameOver) return;

      const state = gameStateRef.current;
      state.dir = state.nextDir;

      // New head position
      const head = {
        x: state.snake[0].x + state.dir.x,
        y: state.snake[0].y + state.dir.y,
      };

      // Wrap around walls for smooth, fun, high-speed play
      if (head.x < 0) head.x = tileCountX - 1;
      if (head.x >= tileCountX) head.x = 0;
      if (head.y < 0) head.y = tileCountY - 1;
      if (head.y >= tileCountY) head.y = 0;

      // Self-collision check
      for (let i = 1; i < state.snake.length; i++) {
        if (state.snake[i].x === head.x && state.snake[i].y === head.y) {
          setIsSnakeGameOver(true);
          setIsSnakeRunning(false);
          audio.playCrash();
          return;
        }
      }

      state.snake.unshift(head);

      // Check food consumption
      if (head.x === state.food.x && head.y === state.food.y) {
        audio.playEat();
        const gainedPoints = 100 * state.multiplier;
        state.score += gainedPoints;
        setSnakeScore(state.score);

        if (state.score > snakeBestScore) {
          setSnakeBestScore(state.score);
          localStorage.setItem('devmind_bytesnake_pb', state.score.toString());
        }

        // Add line to live code assembler
        setCompiledLines((lines) => {
          const nextIndex = lines.length % CODE_ASSEMBLER_LINES.length;
          return [...lines.slice(-6), CODE_ASSEMBLER_LINES[nextIndex]];
        });

        // Spawn new random food
        state.food = {
          x: Math.floor(Math.random() * tileCountX),
          y: Math.floor(Math.random() * tileCountY),
          type: FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)].label,
        };

        // Rare power-up spawn (20% chance)
        if (Math.random() < 0.25 && !state.powerUp) {
          state.powerUp = {
            x: Math.floor(Math.random() * tileCountX),
            y: Math.floor(Math.random() * tileCountY),
            type: Math.random() > 0.5 ? 'gc' : 'overclock',
          };
        }
      } else if (state.powerUp && head.x === state.powerUp.x && head.y === state.powerUp.y) {
        audio.playCombo();
        if (state.powerUp.type === 'gc') {
          // Garbage collector cuts tail in half!
          if (state.snake.length > 3) {
            state.snake.splice(-3);
          }
          state.score += 250;
        } else {
          // Overclock 2x multiplier
          state.multiplier = 2;
          setSnakeSpeedMultiplier(2);
          setTimeout(() => {
            state.multiplier = 1;
            setSnakeSpeedMultiplier(1);
          }, 8000);
          state.score += 300;
        }
        setSnakeScore(state.score);
        state.powerUp = null;
      } else {
        state.snake.pop();
      }

      // RENDER
      ctx.fillStyle = '#141414';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid guidelines
      ctx.strokeStyle = '#1e1e1e';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Food
      ctx.fillStyle = '#ffa116';
      ctx.shadowColor = '#ffa116';
      ctx.shadowBlur = 10;
      ctx.fillRect(state.food.x * gridSize + 2, state.food.y * gridSize + 2, gridSize - 4, gridSize - 4);
      ctx.shadowBlur = 0;

      // Draw Power-up
      if (state.powerUp) {
        ctx.fillStyle = state.powerUp.type === 'gc' ? '#00b8a3' : '#ec4899';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(
          state.powerUp.x * gridSize + gridSize / 2,
          state.powerUp.y * gridSize + gridSize / 2,
          gridSize / 2 - 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Snake
      state.snake.forEach((seg, idx) => {
        if (idx === 0) {
          // Head
          ctx.fillStyle = '#00b8a3';
          ctx.shadowColor = '#00b8a3';
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = state.multiplier === 2 ? '#ec4899' : '#38bdf8';
          ctx.shadowBlur = 0;
        }
        ctx.fillRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2);
      });
      ctx.shadowBlur = 0;
    };

    intervalId = setInterval(gameLoop, 80);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(intervalId);
    };
  }, [activeGame, isSnakeRunning, isSnakeGameOver, snakeBestScore]);

  return (
    <div className="space-y-6 text-[#eff2f6] font-sans pb-16">
      {/* Top Header & Game Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#383838]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/30">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-[#ffa116]">
              Developer Breakout Lounge
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#ffffff] flex items-center gap-3">
            DevMind Arcade
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
              2 Addictive Modes
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-1.5 max-w-2xl leading-relaxed">
            Need a high-octane breather between algorithm quests? Race your typing speed on real codebases or navigate a retro matrix memory buffer in ByteSnake!
          </p>
        </div>

        {/* Global Controls: Sound & Mode Toggle */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleSound}
            className={`h-9 px-3 gap-1.5 text-xs font-bold border-[#383838] ${
              soundEnabled ? 'text-[#ffa116] bg-[#ffa116]/10' : 'text-[#9ca3af] bg-[#1e1e1e]'
            }`}
            title="Toggle Synthesizer Sound Effects"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span>{soundEnabled ? 'Audio On' : 'Muted'}</span>
          </Button>

          <div className="flex p-1 rounded-xl bg-[#262626] border border-[#383838]">
            <button
              onClick={() => setActiveGame('speedcoder')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeGame === 'speedcoder'
                  ? 'bg-[#ffa116] text-black shadow-md font-extrabold'
                  : 'text-[#9ca3af] hover:text-[#ffffff] hover:bg-[#333333]'
              }`}
            >
              <Keyboard className="h-4 w-4" />
              1. SpeedCoder Nitro
            </button>
            <button
              onClick={() => setActiveGame('bytesnake')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeGame === 'bytesnake'
                  ? 'bg-[#ffa116] text-black shadow-md font-extrabold'
                  : 'text-[#9ca3af] hover:text-[#ffffff] hover:bg-[#333333]'
              }`}
            >
              <Zap className="h-4 w-4" />
              2. ByteSnake Matrix
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* GAME 1: SPEEDCODER NITRO                                */}
      {/* ======================================================== */}
      {activeGame === 'speedcoder' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Live Metric Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border border-[#383838] bg-[#262626] shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#9ca3af] block">Live Typing Speed</span>
                <div className="text-3xl font-extrabold text-[#ffa116] mt-0.5">
                  {wpm} <span className="text-xs font-normal text-[#9ca3af]">WPM</span>
                </div>
              </div>
              <Activity className="h-6 w-6 text-[#ffa116]/40" />
            </div>

            <div className="p-4 rounded-xl border border-[#383838] bg-[#262626] shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#9ca3af] block">Precision Accuracy</span>
                <div className="text-3xl font-extrabold text-[#00b8a3] mt-0.5">
                  {accuracy}%
                </div>
              </div>
              <Award className="h-6 w-6 text-[#00b8a3]/40" />
            </div>

            <div className="p-4 rounded-xl border border-[#383838] bg-[#262626] shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#9ca3af] block">Personal Best</span>
                <div className="text-3xl font-extrabold text-purple-400 mt-0.5 flex items-center gap-1.5">
                  <Trophy className="h-5 w-5 text-purple-400" />
                  {bestWpm} <span className="text-xs font-normal text-[#9ca3af]">WPM</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRankBadge(bestWpm).color}`}>
                PB
              </span>
            </div>

            <div className="p-4 rounded-xl border border-[#383838] bg-[#262626] shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#9ca3af] block">Keystroke Combo</span>
                <div className="text-3xl font-extrabold text-amber-400 mt-0.5 flex items-center gap-1.5">
                  <Flame className="h-5 w-5 fill-amber-400" />
                  {streak}x
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetSpeedCoder}
                className="h-8 gap-1 border-[#383838] bg-[#1e1e1e] text-[#ffffff] hover:bg-[#333333]"
                title="Restart snippet (or press Esc)"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            </div>
          </div>

          {/* Snippet Selection Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-[#383838] bg-[#262626]">
            <div className="flex flex-wrap gap-2">
              {SPEED_SNIPPETS.map((snip, idx) => (
                <button
                  key={snip.id}
                  onClick={() => {
                    setSnippetIdx(idx);
                    resetSpeedCoder();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    snippetIdx === idx
                      ? 'bg-[#ffa116] text-black shadow-xs font-extrabold'
                      : 'bg-[#1e1e1e] border border-[#383838] text-[#9ca3af] hover:text-[#ffffff]'
                  }`}
                >
                  {snip.title}
                </button>
              ))}
            </div>
            <span className="text-xs text-[#9ca3af] font-mono">
              Press any key to race • Esc to restart
            </span>
          </div>

          {/* Live Code Board */}
          <div
            onClick={() => inputRef.current?.focus()}
            className="rounded-2xl border border-[#383838] bg-[#181818] p-6 shadow-2xl relative overflow-hidden font-mono text-base leading-relaxed cursor-text min-h-[220px]"
          >
            {/* Syntax Render */}
            <div className="whitespace-pre-wrap select-none text-base tracking-wide">
              {activeSnippet.code.split('').map((char, index) => {
                const typedChar = typed[index];
                let colorClass = 'text-[#555555]'; // Untyped
                let isCurrent = index === typed.length;

                if (typedChar !== undefined) {
                  if (typedChar === char) {
                    colorClass = 'text-[#00b8a3] font-bold'; // Correct
                  } else {
                    colorClass = 'bg-rose-500/40 text-rose-300 font-bold underline'; // Error
                  }
                }

                return (
                  <span
                    key={index}
                    className={`${colorClass} ${
                      isCurrent ? 'border-b-2 border-[#ffa116] bg-[#ffa116]/25 animate-pulse' : ''
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
            </div>

            {/* Hidden Input field capturing keystrokes */}
            <textarea
              ref={inputRef}
              value={typed}
              onChange={handleTyping}
              onKeyDown={(e) => {
                if (e.key === 'Escape') resetSpeedCoder();
              }}
              autoFocus
              className="absolute inset-0 opacity-0 cursor-text resize-none"
              spellCheck="false"
              autoCapitalize="none"
              autoComplete="off"
            />
          </div>

          {/* Victory Modal */}
          {isFinished && (
            <div className="p-6 rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-[#262626] to-[#1e1e1e] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2.5 text-emerald-400 font-extrabold text-xl">
                  <Trophy className="h-6 w-6" />
                  Code Sprint Mastered!
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <span className="text-2xl font-extrabold text-white">{wpm} WPM</span>
                  <span className="text-neutral-400">•</span>
                  <span className="text-base font-bold text-[#00b8a3]">{accuracy}% Accuracy</span>
                  <span className="text-neutral-400">•</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getRankBadge(wpm).color}`}>
                    {getRankBadge(wpm).title}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={resetSpeedCoder}
                  className="bg-[#ffa116] hover:bg-[#f59e0b] text-black font-extrabold px-6"
                >
                  Race Again (Esc)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSnippetIdx((i) => (i + 1) % SPEED_SNIPPETS.length);
                    resetSpeedCoder();
                  }}
                  className="border-[#383838] bg-[#1e1e1e] text-[#ffffff] hover:bg-[#333333]"
                >
                  Next Snippet →
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* GAME 2: BYTESNAKE (Matrix Memory Runner)                */}
      {/* ======================================================== */}
      {activeGame === 'bytesnake' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Canvas Screen */}
            <div className="lg:col-span-8 rounded-2xl border border-[#383838] bg-[#141414] p-4 flex flex-col items-center justify-center shadow-2xl relative">
              {/* Header Bar */}
              <div className="flex items-center justify-between w-full pb-3 mb-3 border-b border-[#2d2d2d] text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-extrabold text-white">ByteSnake 2077 Engine</span>
                  {snakeSpeedMultiplier > 1 && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      ⚡ 2x Overclock Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs font-mono font-bold">
                  <span>Score: <strong className="text-[#ffa116] text-sm">{snakeScore}</strong></span>
                  <span>PB: <strong className="text-purple-400 text-sm">{snakeBestScore}</strong></span>
                </div>
              </div>

              {/* Canvas viewport */}
              <div className="relative w-full max-w-[640px] aspect-[16/9]">
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={360}
                  className="w-full h-full rounded-xl border border-[#383838] bg-[#101010] shadow-inner"
                />

                {/* Start Overlay */}
                {!isSnakeRunning && !isSnakeGameOver && (
                  <div className="absolute inset-0 rounded-xl bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center space-y-4 p-6 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-[#ffa116]/15 border border-[#ffa116]/40 flex items-center justify-center text-[#ffa116] shadow-lg">
                      <Play className="h-6 w-6 fill-current ml-0.5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-white">ByteSnake Matrix Runner</h3>
                      <p className="text-xs text-[#9ca3af] mt-1 max-w-sm leading-relaxed">
                        Consume memory tokens to assemble algorithms in real time. Grab Garbage Collectors to trim your tail and dodge deadlocks!
                      </p>
                    </div>
                    <Button
                      onClick={startSnakeGame}
                      className="bg-[#ffa116] hover:bg-[#f59e0b] text-black font-extrabold px-8 h-10 shadow-lg text-sm"
                    >
                      Start Run (Space)
                    </Button>
                  </div>
                )}

                {/* Game Over Overlay */}
                {isSnakeGameOver && (
                  <div className="absolute inset-0 rounded-xl bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center space-y-4 p-6 text-center animate-in zoom-in-95">
                    <div className="text-rose-400 font-extrabold text-2xl tracking-wider">
                      SEGMENTATION FAULT
                    </div>
                    <p className="text-xs text-[#d1d5db]">
                      Final Score: <strong className="text-[#ffa116] text-base">{snakeScore} pts</strong>
                      {snakeScore >= snakeBestScore && snakeScore > 0 && (
                        <span className="text-amber-400 block font-bold mt-1">🏆 New Personal Best!</span>
                      )}
                    </p>
                    <Button
                      onClick={startSnakeGame}
                      className="bg-[#ffa116] hover:bg-[#f59e0b] text-black font-extrabold px-8 h-10 shadow-lg text-sm"
                    >
                      Retry Run (Space)
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between w-full pt-3 text-[11px] text-[#9ca3af]">
                <span>Controls: <strong className="text-white">W/A/S/D</strong> or <strong className="text-white">Arrow Keys</strong></span>
                <span>Items: <strong className="text-[#ffa116]">malloc</strong> · <strong className="text-[#00b8a3]">GC Clean</strong> · <strong className="text-[#ec4899]">2x Overclock</strong></span>
              </div>
            </div>

            {/* Right Column: Live Code Assembler Console */}
            <div className="lg:col-span-4 rounded-2xl border border-[#383838] bg-[#262626] p-5 flex flex-col justify-between shadow-2xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#383838] pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-[#ffa116]" />
                    <span className="font-extrabold text-sm text-white">Live Code Assembler</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Compiled
                  </span>
                </div>

                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  As your snake consumes memory allocations, real production code is compiled line-by-line!
                </p>

                {/* Code Terminal Output */}
                <div className="rounded-xl border border-[#383838] bg-[#121212] p-3.5 font-mono text-xs space-y-1.5 min-h-[220px] shadow-inner text-[#d1d5db]">
                  {compiledLines.length > 0 ? (
                    compiledLines.map((line, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-[#555555] select-none w-4 text-right">{idx + 1}</span>
                        <span className="text-emerald-400 whitespace-pre-wrap">{line}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-44 text-[#555555] text-center space-y-2">
                      <Code2 className="h-8 w-8 text-[#333333]" />
                      <span className="text-xs">Eat memory tokens to assemble algorithm code...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Power-up Legend */}
              <div className="pt-4 border-t border-[#383838] space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-[#9ca3af] block">Memory Token Legend:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#1e1e1e] border border-[#383838]">
                    <span className="h-2.5 w-2.5 rounded bg-[#ffa116]" />
                    <span className="text-white font-medium">malloc (+100)</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#1e1e1e] border border-[#383838]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#00b8a3]" />
                    <span className="text-white font-medium">GC Trim Tail</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#1e1e1e] border border-[#383838] col-span-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ec4899]" />
                    <span className="text-white font-medium">Overclock (2x Point Multiplier)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DevArcadePage;
