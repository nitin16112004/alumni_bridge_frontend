import { CheckCircle2, CircleAlert } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export default function Alert({ children, variant = 'error' }) {
  const reduceMotion = useReducedMotion();
  const success = variant === 'success';

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -4 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      role={success ? 'status' : 'alert'}
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${success ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}
    >
      {success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
      <span>{children}</span>
    </motion.div>
  );
}
