import { Network } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ compact = false, inverse = false, to = '/' }) {
  return (
    <Link to={to} className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200" aria-label="Alumni Bridge home">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${inverse ? 'bg-white/10 text-blue-200 ring-1 ring-white/15' : 'bg-[#111b44] text-white shadow-sm'}`}>
        <Network className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      {!compact && (
        <span className={`text-lg font-extrabold tracking-tight ${inverse ? 'text-white' : 'text-slate-950'}`}>
          Alumni<span className={inverse ? 'text-blue-200' : 'text-blue-600'}>Bridge</span>
        </span>
      )}
    </Link>
  );
}
