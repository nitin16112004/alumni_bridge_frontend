import { LoaderCircle } from 'lucide-react';
import { forwardRef } from 'react';

const variants = {
  primary: 'bg-blue-600 text-white shadow-sm shadow-blue-200 hover:bg-blue-700 focus-visible:ring-blue-200',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-100',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-slate-200',
  danger: 'border border-red-200 bg-white text-red-600 hover:bg-red-50 focus-visible:ring-red-100',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-100',
};

const sizes = {
  sm: 'min-h-9 px-3 text-xs',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-[52px] px-5 text-sm',
  icon: 'h-11 w-11',
};

const Button = forwardRef(function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}, ref) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
});

export default Button;
