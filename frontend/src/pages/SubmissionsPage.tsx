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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#383838]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ffa116]/10 border border-[#ffa116]/30 text-[#ffa116] text-xs font-semibold mb-2">
            <History className="h-3.5 w-3.5" />
            Evaluation Telemetry
          </div>
          <h1 className="text-2xl font-bold text-[#ffffff] tracking-tight">Submission History</h1>
          <p className="text-xs text-[#cbd5e1] mt-1">
            Review your historical coding evaluations, test-case scores, and execution metrics.
          </p>
        </div>

        <Link to="/dashboard/arena">
          <Button size="sm" className="gap-2 text-xs font-bold bg-[#ffa116] hover:bg-[#ffb43a] text-black shadow-xs">
            <Code2 className="h-3.5 w-3.5" />
            Open Coding Arena
          </Button>
        </Link>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-[#383838] bg-[#262626] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1e1e1e] text-[#9ca3af] uppercase tracking-wider text-[10px] border-b border-[#383838] font-semibold">
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
            <tbody className="divide-y divide-[#383838] text-[#d1d5db]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#9ca3af]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-5 w-5 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin" />
                      <span>Loading submission history...</span>
                    </div>
                  </td>
                </tr>
              ) : submissions.length > 0 ? (
                submissions.map((sub) => {
                  const isAccepted = sub.status === 'accepted';
                  const statusBadgeColor = isAccepted
                    ? 'bg-[#00b8a3]/10 text-[#00b8a3] border-[#00b8a3]/30'
                    : 'bg-[#ff375f]/10 text-[#ff375f] border-[#ff375f]/30';

                  return (
                    <tr key={sub.id} className="hover:bg-[#2e2e2e] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#ffffff]">
                        <Link
                          to={`/dashboard/arena?challenge=${sub.challenge_slug || sub.challenge_id}`}
                          className="hover:text-[#ffa116] transition-colors flex items-center gap-1.5"
                        >
                          {sub.challenge_title || 'Engineering Challenge'}
                          <ExternalLink className="h-3 w-3 text-[#9ca3af]" />
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${statusBadgeColor}`}>
                          {isAccepted ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {sub.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        <span className={isAccepted ? 'text-[#00b8a3] font-bold' : 'text-[#d1d5db]'}>
                          {sub.passed_tests}/{sub.total_tests} ({sub.score}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#9ca3af]">
                        {sub.execution_time_ms ? `${sub.execution_time_ms} ms` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#383838] text-[#d1d5db] text-[11px] font-medium">
                          {sub.language}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#9ca3af] text-[11px]">
                        {new Date(sub.created_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedSubmission(sub)}
                          className="h-7 text-xs text-[#ffa116] hover:text-[#ffb43a] hover:bg-[#ffa116]/10"
                        >
                          Inspect Details
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#9ca3af]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <History className="h-8 w-8 text-[#9ca3af]" />
                      <p className="text-sm font-semibold text-[#ffffff]">No submissions recorded yet</p>
                      <p className="text-xs max-w-sm text-[#9ca3af]">
                        You have not submitted any solutions yet. Open the Coding Arena to solve challenges!
                      </p>
                      <Link to="/challenges">
                        <Button size="sm" variant="outline" className="mt-2 text-xs border-[#383838] bg-[#1e1e1e] text-[#eff2f6] hover:bg-[#2e2e2e]">
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
          <div className="flex items-center justify-between p-4 border-t border-[#383838] bg-[#1e1e1e] text-xs">
            <span className="text-[#9ca3af]">
              Showing {submissions.length} of {total} submissions
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 text-xs gap-1 border-[#383838] bg-[#262626] text-[#eff2f6] hover:bg-[#2e2e2e]"
              >
                <ChevronLeft className="h-3 w-3" />
                Previous
              </Button>
              <span className="text-[#ffffff] px-2 font-mono">
                {page} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 text-xs gap-1 border-[#383838] bg-[#262626] text-[#eff2f6] hover:bg-[#2e2e2e]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="rounded-2xl border border-[#383838] bg-[#262626] max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-[#eff2f6]">
            <div className="p-4 border-b border-[#383838] bg-[#1e1e1e] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#ffffff] flex items-center gap-2">
                  <span>{selectedSubmission.challenge_title || 'Submission Details'}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      selectedSubmission.status === 'accepted'
                        ? 'bg-[#00b8a3]/10 text-[#00b8a3] border-[#00b8a3]/30'
                        : 'bg-[#ff375f]/10 text-[#ff375f] border-[#ff375f]/30'
                    }`}
                  >
                    {selectedSubmission.status.replace('_', ' ')}
                  </span>
                </h2>
                <p className="text-[11px] text-[#9ca3af] mt-0.5">
                  ID: <span className="font-mono text-[#d1d5db]">{selectedSubmission.id}</span> • {new Date(selectedSubmission.created_at).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-[#9ca3af] hover:bg-[#383838] hover:text-[#ffffff] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Telemetry Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-[#383838] bg-[#1e1e1e]">
                  <span className="text-[10px] text-[#9ca3af] font-semibold uppercase">Score</span>
                  <p className="text-base font-bold text-[#ffa116] mt-0.5">{selectedSubmission.score}%</p>
                </div>
                <div className="p-3 rounded-xl border border-[#383838] bg-[#1e1e1e]">
                  <span className="text-[10px] text-[#9ca3af] font-semibold uppercase">Tests Passed</span>
                  <p className="text-base font-bold text-[#00b8a3] mt-0.5">
                    {selectedSubmission.passed_tests} / {selectedSubmission.total_tests}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-[#383838] bg-[#1e1e1e]">
                  <span className="text-[10px] text-[#9ca3af] font-semibold uppercase">Execution Time</span>
                  <p className="text-base font-bold text-[#ffffff] mt-0.5">
                    {selectedSubmission.execution_time_ms ? `${selectedSubmission.execution_time_ms} ms` : '—'}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-[#383838] bg-[#1e1e1e]">
                  <span className="text-[10px] text-[#9ca3af] font-semibold uppercase">Language</span>
                  <p className="text-base font-bold text-[#ffffff] mt-0.5 capitalize">{selectedSubmission.language}</p>
                </div>
              </div>

              {/* Error log if present */}
              {selectedSubmission.error_message && (
                <div className="p-3.5 rounded-xl bg-[#ff375f]/10 border border-[#ff375f]/30 text-[#ff375f] font-mono text-[11px] whitespace-pre-wrap">
                  {selectedSubmission.error_message}
                </div>
              )}

              {/* Test Case breakdown */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#ffffff]">Test Cases Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedSubmission.test_results?.map((tr, i) => (
                    <div
                      key={tr.id || i}
                      className={`p-3 rounded-xl border text-xs ${
                        tr.status === 'passed'
                          ? 'bg-[#00b8a3]/10 border-[#00b8a3]/30 text-[#00b8a3]'
                          : 'bg-[#ff375f]/10 border-[#ff375f]/30 text-[#ff375f]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-medium">
                        <span className="flex items-center gap-1.5">
                          {tr.status === 'passed' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#00b8a3]" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-[#ff375f]" />
                          )}
                          Test #{i + 1} ({tr.is_sample ? 'Sample' : 'Hidden Edge Test'})
                        </span>
                        <span className="font-mono text-[11px] text-[#9ca3af]">{tr.execution_time_ms} ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submitted Source Code */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#ffffff]">Submitted Source Code</h3>
                <pre className="p-3.5 rounded-xl bg-[#141414] border border-[#383838] font-mono text-[11px] text-[#eff2f6] overflow-x-auto whitespace-pre-wrap max-h-56 shadow-inner">
                  {selectedSubmission.source_code}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-[#383838] bg-[#1e1e1e] flex items-center justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedSubmission(null)} className="text-xs border-[#383838] bg-[#262626] text-[#eff2f6] hover:bg-[#383838]">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
