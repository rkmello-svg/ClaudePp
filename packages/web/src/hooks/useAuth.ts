import { useAuthStore } from '../stores/authStore';
import type { User } from '../stores/authStore';

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();

  const login = (userData: User, tokenStr: string) => {
    setAuth({
      user: userData,
      token: tokenStr,
      isAuthenticated: true,
    });
    localStorage.setItem('token', tokenStr);
  };

  const logoutUser = () => {
    logout();
    localStorage.removeItem('token');
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout: logoutUser,
  };
};
