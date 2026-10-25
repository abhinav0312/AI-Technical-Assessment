import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Brain, Cpu, Shield, Activity, Users, Layers } from 'lucide-react';

export function FeaturesPage() {
  const capabilities = [
    {
      icon: Brain,
      title: 'Cognitive Process Telemetry',
      badge: 'THINK Pillar',
      description: 'Beyond binary test passes: DevMind tracks cursor progression, refactoring steps, and hypothesis revisions to measure real problem-solving habits.',
    },
    {
      icon: Cpu,
      title: 'Sub-Second Sandboxed Execution',
      badge: 'CODE Pillar',
      description: 'Micro-isolated execution containers for Python 3.12, TypeScript 5.6, Go 1.23, and Rust 1.82 with precise resource and memory boundaries.',
    },
    {
      icon: Layers,
      title: 'Multi-File Architectural Sandboxes',
      badge: 'BUILD Pillar',
      description: 'Test candidates on production-realistic setups: mock microservice interfaces, distributed key-value stores, and database query tuning.',
    },
    {
      icon: Activity,
      title: 'SkillGraph Knowledge Mapping',
      badge: 'GROW Pillar',
      description: 'Generates multidimensional competency vectors across Concurrency, System Design, Data Structures, Security, and Code Cleanliness.',
    },
    {
      icon: Shield,
      title: 'Argon2id Enterprise Security',
      badge: 'Security',
      description: 'State-of-the-art cryptography for candidate identity protection, role-based access restrictions, and sanitized error boundaries.',
    },
    {
      icon: Users,
      title: 'Multi-Role Collaboration Hub',
      badge: 'Platform',
      description: 'Unified workspace for Candidates solving challenges, Creators crafting new problem sets, and Recruiters reviewing analytical telemetry.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">
              Platform Features & Architecture
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Engineering Assessment Reimagined
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Explore the complete architectural matrix that powers DevMind AI's next-generation cognitive evaluation environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-xl border border-border/70 bg-surface-card hover:border-brand-500/40 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-darkest border border-border/50 text-slate-300">
                      {c.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{c.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
