import { LoaderCircle, Network } from 'lucide-react';

export default function RouteLoader({ label = 'Loading Alumni Bridge' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center" role="status" aria-live="polite">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111b44] text-white shadow-lg shadow-indigo-950/15">
          <Network className="h-5 w-5" aria-hidden="true" />
        </span>
        <LoaderCircle className="mx-auto mt-5 h-5 w-5 animate-spin text-blue-600" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium text-slate-600">{label}</p>
      </div>
    </div>
  );
}
