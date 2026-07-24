import { LoaderCircle } from 'lucide-react';

export default function SubmitButton({ children, loading, loadingLabel, className = '', disabled = false, ...props }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      aria-busy={loading}
      {...props}
      className={`inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm shadow-blue-200 transition duration-200 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:pointer-events-none disabled:opacity-55 ${className}`}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {loading ? loadingLabel : children}
    </button>
  );
}
