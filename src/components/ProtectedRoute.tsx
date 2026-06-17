import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

interface Props {
  children: React.ReactNode;
  papeis: UserRole[];
}

export default function ProtectedRoute({ children, papeis }: Props) {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.pendente) return <Navigate to="/pendente" replace />;
  if (!papeis.includes(usuario.papel)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
