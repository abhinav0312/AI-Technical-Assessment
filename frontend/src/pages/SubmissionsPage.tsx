import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Submission } from '@/types/submission';
import { Button } from '@/components/ui/button';
import {
  History,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Code2,
} from 'lucide-react';

export function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient<{ items: Submission[]; total: number; total_pages: number }>(
        `/submissions?page=${page}&page_size=${pageSize}`
      );
      if (res && res.items) {
        setSubmissions(res.items);
        setTotal(res.total);
        setTotalPages(res.total_pages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-2">
            <History className="h-3.5 w-3.5" />
            Evaluation Telemetry
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Submission History</h1>
          <p className="text-xs text-slate-600 mt-1">
            Review your historical coding evaluations, test-case scores, and execution metrics.
          </p>
        </div>

        <Link to="/dashboard/arena">
          <Button size="sm" className="gap-2 text-xs shadow-xs">
            <Code2 className="h-3.5 w-3.5" />
            Open Coding Arena
          </Button>
        </Link>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Challenge</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Runtime</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Submitted At</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-5 w-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading submission history...</span>
                    </div>
                  </td>
                </tr>
              ) : submissions.length > 0 ? (
                submissions.map((sub) => {
                  const isAccepted = sub.status === 'accepted';
                  const statusBadgeColor = isAccepted
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200';

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <Link
                          to={`/dashboard/arena?challenge=${sub.challenge_slug || sub.challenge_id}`}
                          className="hover:text-brand-600 transition-colors flex items-center gap-1.5"
                        >
                          {sub.challenge_title || 'Engineering Challenge'}
                          <ExternalLink className="h-3 w-3 text-slate-400" />
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${statusBadgeColor}`}>
                          {isAccepted ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {sub.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        <span className={isAccepted ? 'text-emerald-600 font-bold' : 'text-slate-800'}>
                          {sub.passed_tests}/{sub.total_tests} ({sub.score}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {sub.execution_time_ms ? `${sub.execution_time_ms} ms` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium">
                          {sub.language}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(sub.created_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedSubmission(sub)}
                          className="h-7 text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                        >
                          Inspect Details
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <History className="h-8 w-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-900">No submissions recorded yet</p>
                      <p className="text-xs max-w-sm text-slate-500">
                        You have not submitted any solutions yet. Open the Coding Arena to solve challenges!
                      </p>
                      <Link to="/challenges">
                        <Button size="sm" variant="outline" className="mt-2 text-xs">
                          Browse Challenges
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50 text-xs">
            <span className="text-slate-500">
              Showing {submissions.length} of {total} submissions
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 text-xs gap-1"
              >
                <ChevronLeft className="h-3 w-3" />
                Previous
              </Button>
              <span className="text-slate-700 px-2 font-mono">
                {page} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 text-xs gap-1"
              >
                Next
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Submission Detail Modal / Inspection Drawer */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="rounded-2xl border border-slate-200 bg-white max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>{selectedSubmission.challenge_title || 'Submission Details'}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      selectedSubmission.status === 'accepted'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {selectedSubmission.status.replace('_', ' ')}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ID: <span className="font-mono text-slate-700">{selectedSubmission.id}</span> • {new Date(selectedSubmission.created_at).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Telemetry Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Score</span>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{selectedSubmission.score}%</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Tests Passed</span>
                  <p className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedSubmission.passed_tests} / {selectedSubmission.total_tests}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Execution Time</span>
                  <p className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedSubmission.execution_time_ms ? `${selectedSubmission.execution_time_ms} ms` : '—'}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Language</span>
                  <p className="text-base font-bold text-slate-900 mt-0.5 capitalize">{selectedSubmission.language}</p>
                </div>
              </div>

              {/* Error log if present */}
              {selectedSubmission.error_message && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-mono text-[11px] whitespace-pre-wrap">
                  {selectedSubmission.error_message}
                </div>
              )}

              {/* Test Case breakdown */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Test Cases Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedSubmission.test_results?.map((tr, i) => (
                    <div
                      key={tr.id || i}
                      className={`p-3 rounded-xl border text-xs ${
                        tr.status === 'passed'
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50/50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="flex items-center justify-between font-medium">
                        <span className="flex items-center gap-1.5">
                          {tr.status === 'passed' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-rose-600" />
                          )}
                          Test #{i + 1} ({tr.is_sample ? 'Sample' : 'Hidden Edge Test'})
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">{tr.execution_time_ms} ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submitted Source Code */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Submitted Source Code</h3>
                <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-100 overflow-x-auto whitespace-pre-wrap max-h-56 shadow-inner">
                  {selectedSubmission.source_code}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedSubmission(null)} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
