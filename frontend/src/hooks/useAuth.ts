import { useAppSelector } from '../app/hooks';

export function useAuth() {
  const { user, token } = useAppSelector((state) => state.auth);
  return { user, token, isAuthenticated: Boolean(token) };
}
