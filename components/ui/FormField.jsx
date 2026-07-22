import { forwardRef } from 'react';

const FormField = forwardRef(function FormField({
  label,
  icon: Icon,
  error,
  hint,
  id,
  className = '',
  ...props
}, ref) {
  const inputId = id || props.name;
  const descriptionId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" aria-hidden="true" />}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
          className={`h-[52px] w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${Icon ? 'pl-11' : ''} ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'} ${className}`}
          {...props}
        />
      </div>
      {(error || hint) && <p id={descriptionId} role={error ? 'alert' : undefined} className={`mt-1.5 text-xs ${error ? 'text-red-600' : 'text-slate-500'}`}>{error || hint}</p>}
    </div>
  );
});

export default FormField;
