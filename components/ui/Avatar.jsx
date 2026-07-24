export default function Avatar({ name = '', src, size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs rounded-lg',
    md: 'h-10 w-10 text-sm rounded-xl',
    lg: 'h-14 w-14 text-lg rounded-2xl',
    xl: 'h-20 w-20 text-2xl rounded-2xl',
  };
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';

  if (src) {
    return <img src={src} alt="" className={`${sizes[size]} shrink-0 object-cover ${className}`} />;
  }

  return (
    <span aria-hidden="true" className={`${sizes[size]} flex shrink-0 items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 font-bold text-indigo-700 ${className}`}>
      {initials}
    </span>
  );
}
