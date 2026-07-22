import { Building2, GraduationCap, UserRound } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const roles = [
  { value: 'student', label: 'Student', description: 'Learn and connect', icon: UserRound },
  { value: 'alumni', label: 'Alumni', description: 'Mentor and contribute', icon: GraduationCap },
  { value: 'college', label: 'College', description: 'Manage your network', icon: Building2 },
];

export default function RoleSelector({ value, onChange }) {
  const reduceMotion = useReducedMotion();

  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-slate-700">Choose your path</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {roles.map(({ value: role, label, description, icon: Icon }) => {
          const selected = value === role;
          return (
            <motion.button
              key={role}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(role)}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className={`relative flex min-h-[98px] items-center gap-3 rounded-2xl border p-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 sm:block sm:min-h-[116px] ${selected
                ? 'border-blue-500 bg-blue-50 text-blue-950 shadow-sm shadow-blue-100'
                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/40'
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="mt-0 sm:mt-3 block">
                <span className="block text-sm font-bold">{label}</span>
                <span className={`mt-1 block text-xs ${selected ? 'text-blue-700' : 'text-slate-500'}`}>{description}</span>
              </span>
              {selected && <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />}
            </motion.button>
          );
        })}
      </div>
    </fieldset>
  );
}
