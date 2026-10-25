import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileCheck2, ArrowRight } from 'lucide-react';

export function AssessmentsPage() {
  const assessments = [
    {
      id: 'as-101',
      title: 'Distributed Event Broker Log Segmenter',
      category: 'Concurrency & Systems',
      status: 'Completed',
      score: 96,
      date: 'Oct 24, 2026',
      duration: '42 mins',
    },
    {
      id: 'as-102',
      title: 'Sliding Window Rate Limiter',
      category: 'System Design',
      status: 'In Progress',
      score: null,
      date: 'Oct 25, 2026',
      duration: 'Live',
    },
    {
      id: 'as-103',
      title: 'Consistent Hashing Ring with Virtual Nodes',
      category: 'Distributed Systems',
      status: 'Not Started',
      score: null,
      date: 'Available',
      duration: '60 mins',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-brand-400" />
            My Assessments
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track active evaluations, cognitive telemetry scores, and past submissions.
          </p>
        </div>

        <Link to="/challenges">
          <Button size="sm">Start New Assessment</Button>
        </Link>
      </div>

      <div className="rounded-xl border border-border/70 bg-surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-darkest border-b border-border/60 text-muted-foreground">
              <tr>
                <th className="py-3 px-4 font-semibold">Assessment Title</th>
                <th className="py-3 px-4 font-semibold">Domain</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Score</th>
                <th className="py-3 px-4 font-semibold">Duration</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-slate-200">
              {assessments.map((item) => (
                <tr key={item.id} className="hover:bg-surface-dark/50 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-white">{item.title}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{item.category}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        item.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : item.status === 'In Progress'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-surface-darkest text-muted-foreground border-border/60'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold">
                    {item.score ? (
                      <span className="text-emerald-400">{item.score}/100</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">{item.duration}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link to="/dashboard/arena">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-brand-300 hover:text-white">
                        {item.status === 'Completed' ? 'View Report' : 'Continue'}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
