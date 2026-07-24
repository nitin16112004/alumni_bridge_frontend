import { motion, useReducedMotion } from 'framer-motion';
import AuthBrandPanel from './AuthBrandPanel';

export default function AuthLayout({ children }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[42%_58%]">
      <AuthBrandPanel />
      <main className="auth-form-panel min-h-screen bg-slate-50 lg:max-h-screen lg:overflow-y-auto">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="mx-auto flex min-h-full w-full max-w-[680px] flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
