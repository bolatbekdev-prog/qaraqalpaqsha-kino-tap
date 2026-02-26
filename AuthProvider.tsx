
import React, { createContext, useEffect, useState, useContext } from "react";
// Real Firebase emes, ózimizdiń mock auth xızmetimizdi paydalanamız
import { onAuthStateChanged, auth } from "./firebase";
import { User } from "./types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Local firebase.ts faylımızdaǵı onAuthStateChanged funkciyasın paydalanamız
    const unsub = onAuthStateChanged(auth, (firebaseUser: any) => {
      if (firebaseUser) {
        const email = (firebaseUser.email || '').toLowerCase();
        const adminEmails = ['bolatbekpython@gmail.com'];
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Paydalanıwshı',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName}&background=random`,
          role: adminEmails.includes(email) || email.includes('admin') ? 'admin' : 'user'
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
