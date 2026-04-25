import { useAuthStore } from "@/store/authStore";
import { authService } from "@/api/authService";
import { LoginDto, RegisterDto } from "@/types";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const { setAuth, clearAuth, user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const login = async (dto: LoginDto) => {
    const { data } = await authService.login(dto);
    if (data.success && data.data.token) {
      setAuth(data.data.token, data.data.refreshToken!, data.data.user);
      navigate("/");
    } else {
      throw new Error(data.message || "Login failed");
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      /* ignore */
    }
    clearAuth();
    navigate("/login");
  };

  const register = async (dto: RegisterDto) => {
    const { data } = await authService.register(dto);
    if (data.success && data.data.token) {
      setAuth(data.data.token, data.data.refreshToken!, data.data.user);
      navigate("/");
    } else {
      throw new Error(data.message || "Registration failed");
    }
  };

  return { login, logout, register, user, isAuthenticated };
}
