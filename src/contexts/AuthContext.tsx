import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase.ts'; 
import { User } from 'firebase/auth';
import { getCurrentUserData } from '@/services/authService';
import { useAppStore } from '@/lib/store';

interface AuthContextType {
  currentUser: User | null;
  userData: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { login, logout } = useAppStore();

  useEffect(() => {
    // onAuthStateChanged is the most reliable way to track login status
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      setCurrentUser(user);
      
      if (user) {
        const data = await getCurrentUserData(user);
        setUserData(data);
        if (data) {
          login({ id: user.uid, ...data } as any);
        }
      } else {
        setUserData(null);
        logout();
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [login, logout]);

  return (
    <AuthContext.Provider value={{ currentUser, userData, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};