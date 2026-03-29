// src/hooks/useUserRole.ts
import { useEffect, useState } from 'react';
import { auth } from '../services/firebase';

export interface UserClaims {
  role?: 'student' | 'coordinator' | 'employer';
  status?: 'applied' | 'provisionally_accepted' | 'provisionally_rejected' | 'final_rejected' | 'final_accepted';
}

export const useUserRole = () => {
  const [claims, setClaims] = useState<UserClaims | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const idTokenResult = await user.getIdTokenResult(true);
        setClaims({
          role: idTokenResult.claims.role as any,
          status: idTokenResult.claims.status as any
        });
      } else {
        setClaims(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { claims, loading };
};