import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'ADMIN' | 'TUTEUR' | 'STANDARD';
  estActif: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, motDePasse: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: 'ADMIN' | 'TUTEUR' | 'STANDARD';
}

interface JWTPayload {
  userId: number;
  role: string;
  sub: string;
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:9000/api';

axios.defaults.baseURL = API_BASE_URL;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const normalizeRole = (rawRole: any): 'ADMIN' | 'TUTEUR' | 'STANDARD' => {
    if (!rawRole) return 'STANDARD';
    const val = String(rawRole).toUpperCase().replace(/^ROLE_/, '');
    if (val.includes('ADMIN')) return 'ADMIN';
    if (val.includes('TUTEUR') || val.includes('TUTOR')) return 'TUTEUR';
    return 'STANDARD';
  };

  const normalizeUser = (raw: any): User => {
    return {
      id: Number(raw?.id ?? raw?.userId ?? raw?.user_id ?? raw?.sub ?? 0),
      nom: String(raw?.nom ?? raw?.lastName ?? raw?.surname ?? ''),
      prenom: String(raw?.prenom ?? raw?.firstName ?? raw?.given_name ?? ''),
      email: String(raw?.email ?? ''),
      role: normalizeRole(raw?.role),
      estActif: Boolean(raw?.estActif ?? raw?.active ?? true),
    };
  };

  const buildUserFromToken = (jwt: string): User | null => {
    try {
      const decoded: any = jwtDecode(jwt);
      const candidate = {
        id: decoded?.userId ?? decoded?.id ?? decoded?.sub ?? 0,
        nom: decoded?.nom ?? decoded?.lastName ?? '',
        prenom: decoded?.prenom ?? decoded?.firstName ?? '',
        email: decoded?.email ?? '',
        role: decoded?.role ?? decoded?.roles?.[0] ?? '',
        estActif: true,
      };
      return normalizeUser(candidate);
    } catch (_) {
      return null;
    }
  };

  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);

  useEffect(() => {
    const loadUserData = async () => {
      if (token) {
        try {
          const decoded = jwtDecode<JWTPayload>(token);
          
          if (decoded.exp * 1000 < Date.now()) {
            logout();
            return;
          }

          let loadedUser: any = null;
          try {
            if (decoded.userId) {
              const response = await axios.get(`/user/${decoded.userId}`);
              loadedUser = response.data;
            }
          } catch (_) {
            // ignore and try self endpoints
          }

          if (!loadedUser) {
            const candidates = ['/user/me', '/auth/me', '/me'];
            for (const path of candidates) {
              try {
                const meResp = await axios.get(path);
                if (meResp?.data) {
                  loadedUser = meResp.data;
                  break;
                }
              } catch (_) {}
            }
          }

          if (!loadedUser) {
            throw new Error('Impossible de charger les informations utilisateur');
          }

          setUser(normalizeUser(loadedUser));
        } catch (error) {
          console.error('Failed to load user data:', error);
          const minimalUser = buildUserFromToken(token);
          if (minimalUser) {
            setUser(minimalUser);
          } else {
            logout();
          }
        }
      }
      setIsLoading(false);
    };

    loadUserData();
  }, [token]);

  const login = async (email: string, motDePasse: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await axios.post('/auth/login', {
        email,
        motDePasse
      });

      const data = response.data || {};
      const newToken: string = data.token
        || data.accessToken
        || data.access_token
        || data.jwt
        || data.id_token
        || (response.headers && typeof response.headers.authorization === 'string' ? response.headers.authorization.replace(/^Bearer\s+/i, '') : '');

      if (!newToken) {
        throw new Error('Jeton d’authentification manquant dans la réponse');
      }

      setToken(newToken);
      localStorage.setItem('token', newToken);

      let resolvedUser: any = data.user || null;
      let resolvedUserId: number | null = data.userId ?? null;

      if (!resolvedUserId) {
        try {
          const decoded = jwtDecode<JWTPayload>(newToken);
          const candidate = (decoded as any).userId ?? (decoded as any).id ?? (decoded as any).sub;
          resolvedUserId = candidate != null ? Number(candidate) : null;
        } catch (_) {
          resolvedUserId = null;
        }
      }

      if (!resolvedUser) {
        try {
          if (resolvedUserId) {
            const userResponse = await axios.get(`/user/${resolvedUserId}`, {
              headers: { Authorization: `Bearer ${newToken}` }
            });
            resolvedUser = userResponse.data;
          }
        } catch (_) {}
      }

      if (!resolvedUser) {
        const candidates = ['/user/me', '/auth/me', '/me'];
        for (const path of candidates) {
          try {
            const meResp = await axios.get(path, { headers: { Authorization: `Bearer ${newToken}` } });
            if (meResp?.data) {
              resolvedUser = meResp.data;
              break;
            }
          } catch (_) {}
        }
      }

      if (!resolvedUser) {
        const minimalUser = buildUserFromToken(newToken);
        if (!minimalUser) {
          throw new Error('Impossible de récupérer les informations utilisateur');
        }
        setUser(minimalUser);
      } else {
        setUser(normalizeUser(resolvedUser));
      }
      toast.success('Connexion réussie!');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Erreur de connexion');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      await axios.post('/auth/register', userData);
      toast.success('Inscription réussie! Vous pouvez maintenant vous connecter.');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur d\'inscription');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    toast.success('Déconnexion réussie');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};