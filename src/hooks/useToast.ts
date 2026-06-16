import { useState, useCallback } from 'react';

export type ToastTipo = 'sucesso' | 'erro' | 'info';

export interface Toast {
  id: string;
  mensagem: string;
  tipo: ToastTipo;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const mostrar = useCallback((mensagem: string, tipo: ToastTipo = 'sucesso') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, mensagem, tipo }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const remover = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, mostrar, remover };
}
