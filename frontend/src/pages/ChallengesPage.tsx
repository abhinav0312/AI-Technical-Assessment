import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/AuthContext';
import { Challenge, PaginatedResponse } from '@/types/challenge';
import {
  Terminal,
  Search,
  Code2,
  ArrowRight,
  Zap,
  Bookmark,
  CheckCircle2,
  Clock,
  CircleDashed,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export function ChallengesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());

      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedLanguage !== 'all') params.append('language', selectedLanguage);
      if (activeTag) params.append('tag', activeTag);
      if (sortBy) params.append('sort_by', sortBy);

      const res = await apiClient<PaginatedResponse<Challenge>>(`/challenges?${params.toString()}`);
      if (res && res.items) {
        setChallenges(res.items);
        setTotal(res.total);
        setTotalPages(res.total_pages || 1);
      }
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchTerm, selectedDifficulty, selectedCategory, selectedLanguage, activeTag, sortBy]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleToggleBookmark = async (e: React.MouseEvent, challengeId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    // Optimistic update
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === challengeId ? { ...c, is_bookmarked: !c.is_bookmarked } : c
      )
    );

    try {
      await apiClient(`/challenges/${challengeId}/bookmark`, { method: 'POST' });
    } catch {
      // Revert if error
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === challengeId ? { ...c, is_bookmarked: !c.is_bookmarked } : c
        )
      );
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDifficulty('all');
    setSelectedCategory('all');
    setSelectedLanguage('all');
    setSelectedStatus('all');
    setOnlyBookmarked(false);
    setSortBy('newest');
    setActiveTag(null);
    setPage(1);
  };

  // Client-side status and bookmark filter
  const displayedChallenges = challenges.filter((c) => {
    if (onlyBookmarked && !c.is_bookmarked) return false;
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'completed' && c.user_status !== 'completed') return false;
      if (selectedStatus === 'attempted' && c.user_status !== 'attempted') return false;
      if (selectedStatus === 'unsolved' && c.user_status === 'completed') return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-brand-700 text-xs font-semibold mb-2 border border-brand-200">
                <Code2 className="h-3.5 w-3.5" />
                Problem Catalog
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Coding Arena Catalog</h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Battle-tested engineering challenges evaluating algorithmic decomposition, concurrency invariants, and low-latency systems.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/dashboard/arena">
                <Button className="gap-2 shadow-xs font-semibold">
                  <Zap className="h-4 w-4 fill-current" />
                  Open Live Code Arena
                </Button>
              </Link>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="rounded-2xl p-5 mb-8 border border-slate-200 bg-white shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              {/* Keyword Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search challenges by title, keyword, data structure, or topic..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition-all"
                />
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <span className="text-xs text-slate-500 shrink-0 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 w-full sm:w-auto"
                >
                  <option value="newest">Newest Added</option>
                  <option value="oldest">Oldest First</option>
                  <option value="difficulty_asc">Difficulty: Easy to Hard</option>
                  <option value="difficulty_desc">Difficulty: Hard to Easy</option>
                  <option value="title_asc">Title: A to Z</option>
                  <option value="title_desc">Title: Z to A</option>
                </select>
              </div>
            </div>

            {/* Filter Pills Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <SlidersHorizontal className="h-3.5 w-3.5 text-brand-600" />
                Filters:
              </span>

              {/* Difficulty filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  setPage(1);
                }}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              {/* Category filter */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="all">All Topics</option>
                <option value="algorithms">Algorithms</option>
                <option value="system_design">System Design</option>
                <option value="concurrency">Concurrency</option>
                <option value="data_structures">Data Structures</option>
                <option value="distributed_systems">Distributed Systems</option>
              </select>

              {/* Language filter */}
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setPage(1);
                }}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="all">All Languages</option>
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </select>

              {/* Authenticated user status filter */}
              {user && (
                <>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Solved</option>
                    <option value="attempted">Attempted</option>
                    <option value="unsolved">Unsolved</option>
                  </select>

                  <button
                    onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                    className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                      onlyBookmarked
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${onlyBookmarked ? 'fill-current' : ''}`} />
                    Bookmarked Only
                  </button>
                </>
              )}

              {/* Active tag indicator */}
              {activeTag && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-brand-700 border border-brand-200 text-xs">
                  Tag: #{activeTag}
                  <button onClick={() => setActiveTag(null)} className="ml-1 text-slate-400 hover:text-slate-700">
                    ×
                  </button>
                </span>
              )}

              {/* Reset button */}
              {(searchTerm || selectedDifficulty !== 'all' || selectedCategory !== 'all' || selectedLanguage !== 'all' || activeTag || onlyBookmarked || selectedStatus !== 'all') && (
                <button
                  onClick={handleClearFilters}
                  className="h-8 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600 transition-colors ml-auto"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Challenges Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-56 rounded-2xl border border-slate-200 bg-white animate-pulse p-6" />
              ))}
            </div>
          ) : displayedChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedChallenges.map((item) => {
                const diffColor =
                  item.difficulty === 'hard'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : item.difficulty === 'medium'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between p-6 rounded-2xl border border-slate-200 bg-white hover:border-brand-300 hover:shadow-md transition-all duration-200 shadow-xs group relative"
                  >
                    <div>
                      {/* Top Badges Bar */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                            {item.category?.replace('_', ' ')}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${diffColor}`}>
                            {item.difficulty}
                          </span>
                          {item.user_status === 'completed' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" />
                              Solved
                            </span>
                          )}
                          {item.user_status === 'attempted' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="h-3 w-3" />
                              Attempted
                            </span>
                          )}
                        </div>

                        {/* Bookmark Button */}
                        <button
                          onClick={(e) => handleToggleBookmark(e, item.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            item.is_bookmarked
                              ? 'bg-amber-50 border-amber-200 text-amber-600'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                          }`}
                          title={item.is_bookmarked ? 'Remove bookmark' : 'Bookmark challenge'}
                        >
                          <Bookmark className={`h-4 w-4 ${item.is_bookmarked ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Title & Description */}
                      <Link to={`/dashboard/arena?challenge=${item.slug}`}>
                        <h2 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {item.title}
                        </h2>
                      </Link>
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
                          {item.tags.map((tag) => (
                            <button
                              key={tag.id}
                              onClick={() => {
                                setActiveTag(tag.slug);
                                setPage(1);
                              }}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 hover:text-brand-600 hover:border-brand-200 transition-colors"
                            >
                              #{tag.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata & CTA */}
                    <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Terminal className="h-3.5 w-3.5 text-brand-600" />
                          <span>{item.supported_languages?.join(', ') || 'python, typescript'}</span>
                        </div>

                        {/* Real Acceptance Rate if available */}
                        {item.acceptance_rate !== null && item.acceptance_rate !== undefined ? (
                          <div className="flex items-center gap-1 text-slate-600 font-medium" title={`${item.total_submissions} total submissions`}>
                            <TrendingUp className="h-3 w-3 text-emerald-600" />
                            <span>{item.acceptance_rate}% acceptance</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">Unattempted</span>
                        )}
                      </div>

                      <Link to={`/dashboard/arena?challenge=${item.slug}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs h-8 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-all font-medium"
                        >
                          Solve Challenge
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Clean Empty State */
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-white space-y-3">
              <div className="h-12 w-12 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-200">
                <CircleDashed className="h-6 w-6 animate-spin" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">No challenges match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try loosening your filters, clearing your search query, or checking back soon as new engineering challenges are deployed.
              </p>
              <Button size="sm" variant="outline" onClick={handleClearFilters} className="mt-2 gap-2 text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
                Reset All Filters
              </Button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-6 mt-8">
              <span className="text-xs text-slate-500">
                Showing {displayedChallenges.length} of {total} challenges • Page {page} of {totalPages}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="gap-1 h-8 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`h-8 w-8 rounded text-xs font-semibold transition-colors ${
                          page === pageNum
                            ? 'bg-brand-600 text-white'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="gap-1 h-8 text-xs"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
