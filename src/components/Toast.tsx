import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import type { Toast, ToastTipo } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  remover: (id: string) => void;
}

const icones: Record<ToastTipo, React.ReactNode> = {
  sucesso: <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />,
  erro: <XCircle className="h-5 w-5 text-red-500 shrink-0" />,
  info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
};

const estilos: Record<ToastTipo, string> = {
  sucesso: 'border-l-4 border-emerald-500',
  erro: 'border-l-4 border-red-500',
  info: 'border-l-4 border-blue-500',
};

export default function ToastContainer({ toasts, remover }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-start gap-3 bg-white rounded-xl shadow-xl p-4 ${estilos[t.tipo]}`}
        >
          {icones[t.tipo]}
          <p className="text-sm text-slate-700 font-medium flex-1">{t.mensagem}</p>
          <button onClick={() => remover(t.id)} className="text-slate-400 hover:text-slate-600 shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
