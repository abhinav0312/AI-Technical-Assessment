import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Terminal, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6 text-foreground">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-4">
        <Terminal className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white">404</h1>
      <h2 className="text-lg font-bold text-slate-200 mt-2">Resource Route Not Found</h2>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
        The endpoint or route you requested does not exist in the DevMind AI platform directory.
      </p>
      <Link to="/" className="mt-6">
        <Button size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Button>
      </Link>
    </div>
  );
}
