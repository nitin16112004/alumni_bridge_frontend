import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import FormField from './FormField';

export default function PasswordField(props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <FormField
        {...props}
        type={visible ? 'text' : 'password'}
        icon={LockKeyhole}
        className="pr-12"
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-[38px] rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {visible ? <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" /> : <Eye className="h-[18px] w-[18px]" aria-hidden="true" />}
      </button>
    </div>
  );
}
