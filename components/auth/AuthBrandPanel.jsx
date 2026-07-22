import {
  ArrowUpRight,
  BriefcaseBusiness,
  MessageCircleMore,
  Network,
  UsersRound,
} from 'lucide-react';

const features = [
  { icon: UsersRound, title: 'Find trusted mentors', text: 'Learn from alumni who understand your path.' },
  { icon: BriefcaseBusiness, title: 'Discover opportunities', text: 'Find jobs and internships through your network.' },
  { icon: MessageCircleMore, title: 'Join alumni discussions', text: 'Turn introductions into meaningful conversations.' },
  { icon: Network, title: 'Grow your network', text: 'Build relationships that last beyond graduation.' },
];

const stats = [
  { value: 'Mentorship', label: 'Guidance that moves careers forward' },
  { value: 'Networking', label: 'Communities built around shared roots' },
  { value: 'Opportunities', label: 'Paths to what comes next' },
];

export default function AuthBrandPanel() {
  return (
    <aside className="relative overflow-hidden bg-[#111b44] px-5 py-7 text-white sm:px-8 sm:py-9 lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:px-12 lg:py-12 xl:px-16">
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative z-10 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
          <Network className="h-5 w-5 text-blue-200" aria-hidden="true" />
        </span>
        <span className="text-xl font-extrabold tracking-tight">
          Alumni<span className="text-blue-200">Bridge</span>
        </span>
      </div>

      <div className="relative z-10 mt-8 max-w-xl lg:my-auto lg:py-12">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200/20 bg-blue-200/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          One community. More possibilities.
        </div>
        <h2 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl xl:text-5xl">
          Build connections that shape careers.
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
          Alumni Bridge connects students, alumni, mentors, and institutions in one focused place to learn, contribute, and grow.
        </p>

        <div className="mt-8 hidden grid-cols-2 gap-3 lg:grid xl:mt-10 xl:gap-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition-colors duration-200 hover:bg-white/[0.1]">
              <Icon className="mb-3 h-5 w-5 text-blue-200" aria-hidden="true" />
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-7 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 lg:mt-0 lg:pt-6">
        {stats.map(({ value, label }) => (
          <div key={value}>
            <p className="text-xs font-bold text-blue-100 sm:text-sm">{value}</p>
            <p className="mt-1 hidden max-w-[150px] text-[11px] leading-4 text-slate-400 sm:block">{label}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
