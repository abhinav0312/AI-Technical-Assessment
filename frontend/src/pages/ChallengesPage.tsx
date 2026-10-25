import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { Terminal, Search, Code2, ArrowRight, Zap } from 'lucide-react';

interface ChallengeItem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  description: string;
  supported_languages?: string[];
}

export function ChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    async function loadChallenges() {
      try {
        const data = await apiClient<any>('/challenges');
        if (data && data.items) {
          setChallenges(data.items);
        } else if (Array.isArray(data)) {
          setChallenges(data);
        } else {
          // Default fallback data if API returns different structure
          setChallenges(fallbackChallenges);
        }
      } catch {
        setChallenges(fallbackChallenges);
      }
    }
    loadChallenges();
  }, []);

  const fallbackChallenges: ChallengeItem[] = [
    {
      id: '1',
      title: 'Sliding Window Rate Limiter',
      slug: 'sliding-window-rate-limiter',
      difficulty: 'medium',
      category: 'system_design',
      description: 'Design an in-memory Sliding Window Rate Limiter that restricts clients to max_requests in a sliding window with strict monotonic timestamp handling.',
      supported_languages: ['python', 'typescript'],
    },
    {
      id: '2',
      title: 'Distributed Event Broker Log Segmenter',
      slug: 'distributed-event-broker',
      difficulty: 'hard',
      category: 'concurrency',
      description: 'Implement a concurrent append-only log index segmenter capable of zero-copy batch flushes with thread-safe consumer read cursors.',
      supported_languages: ['go', 'rust', 'python'],
    },
    {
      id: '3',
      title: 'Consistent Hashing Ring with Virtual Nodes',
      slug: 'consistent-hashing-ring',
      difficulty: 'medium',
      category: 'distributed_systems',
      description: 'Construct a ring-based consistent hash partitioner that balances keys across physical replicas using configurable virtual node weights.',
      supported_languages: ['typescript', 'python', 'go'],
    },
    {
      id: '4',
      title: 'LSM-Tree MemTable Flush Engine',
      slug: 'lsm-tree-memtable',
      difficulty: 'hard',
      category: 'algorithms',
      description: 'Build a concurrent skip-list MemTable with SSTable immutability triggers, binary bloom filter checking, and range query iteration.',
      supported_languages: ['rust', 'go'],
    },
  ];

  const filtered = (challenges.length > 0 ? challenges : fallbackChallenges).filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || c.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-border/50">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-400 text-xs font-semibold mb-2">
                <Code2 className="h-3.5 w-3.5" />
                Technical Assessment Catalog
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Engineering Challenges</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Explore real-world challenges evaluating architecture, algorithmic decomposition, and resilience.
              </p>
            </div>

            <Link to="/dashboard/arena">
              <Button className="gap-2">
                <Zap className="h-4 w-4 text-amber-300" />
                Open Live Code Arena
              </Button>
            </Link>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search challenges by keyword, algorithm, or topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-lg border border-border/70 bg-surface-card pl-9 pr-4 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 rounded-lg border border-border/70 bg-surface-card px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="all">All Categories</option>
                <option value="system_design">System Design</option>
                <option value="concurrency">Concurrency</option>
                <option value="distributed_systems">Distributed Systems</option>
                <option value="algorithms">Algorithms</option>
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="h-10 rounded-lg border border-border/70 bg-surface-card px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Challenge Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between p-6 rounded-xl border border-border/70 bg-surface-card hover:border-brand-500/40 transition-all duration-200 shadow-md group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-darkest border border-border/60 text-slate-300">
                      {item.category.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        item.difficulty === 'hard'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : item.difficulty === 'medium'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {item.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Terminal className="h-3.5 w-3.5 text-brand-400" />
                    <span>{item.supported_languages?.join(', ') || 'python, typescript'}</span>
                  </div>

                  <Link to="/dashboard/arena">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 group-hover:bg-brand-500 group-hover:text-white transition-all">
                      Solve Challenge
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 border border-dashed border-border/70 rounded-xl bg-surface-card/40">
              <Terminal className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No challenges match your criteria</h3>
              <p className="text-xs text-muted-foreground mt-1">Try resetting search keywords or category filters.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
