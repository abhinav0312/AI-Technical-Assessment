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
      description: 'Micro-isolated execution containers for Python 3.12, TypeScript 5.6, C/C++, Java, and JavaScript with precise resource and memory boundaries.',
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
    <div className="min-h-screen bg-[#1a1a1a] text-[#eff2f6] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-[#ffa116] uppercase tracking-widest bg-[#ffa116]/15 border border-[#ffa116]/30 px-3 py-1 rounded-full">
              Platform Features & Architecture
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#ffffff] tracking-tight">
              Engineering Assessment Reimagined
            </h1>
            <p className="text-sm sm:text-base text-[#9ca3af] leading-relaxed">
              Explore the complete architectural matrix that powers DevMind AI's next-generation cognitive evaluation environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl border border-[#383838] bg-[#262626] hover:border-[#ffa116]/50 transition-all duration-200 shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/30">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#383838] text-[#d1d5db]">
                      {c.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#ffffff]">{c.title}</h3>
                  <p className="text-xs text-[#9ca3af] leading-relaxed">{c.description}</p>
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
