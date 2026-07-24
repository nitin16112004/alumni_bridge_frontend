import Card from './Card';

export default function StatCard({ icon: Icon, label, value, helper, tone = 'blue', loading = false }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <Card className="min-w-0 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
          {loading ? <div className="mt-3 h-8 w-14 animate-pulse rounded-lg bg-slate-200" /> : <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">{value}</p>}
          {helper && <p className="mt-1 truncate text-xs text-slate-400">{helper}</p>}
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
      </div>
    </Card>
  );
}
