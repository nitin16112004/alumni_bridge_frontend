import { CircleAlert, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ title = 'Something went wrong', message, onRetry, compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'px-4 py-8' : 'px-5 py-14'}`} role="alert">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <CircleAlert className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-sm font-bold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-5">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Retry
        </Button>
      )}
    </div>
  );
}
