import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: 'patient' | 'doctor' | null;
  loading: boolean;
  fullName: string | null;  // ← ADD THIS
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const ADMIN_EMAILS = ['admin@dermai.com'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'patient' | 'doctor' | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState<string | null>(null);  // ← ADD THIS

  const fetchRole = async (uid: string, email?: string) => {
    if (email && ADMIN_EMAILS.includes(email)) {
      setRole('doctor');
      return;
    }
    if (!supabase) { setRole('patient'); return; }
    const { data } = await supabase.from('profiles').select('role').eq('id', uid).single();
    setRole((data?.role as 'patient' | 'doctor') ?? 'patient');
  };

  // Helper to extract full name from user metadata
  const getFullName = (user: User | null): string | null => {
    if (!user) return null;
    // Check user_metadata first (from signup)
    const metaName = user.user_metadata?.full_name;
    if (metaName) return metaName;
    // Fallback to email prefix
    return user.email?.split('@')[0] ?? null;
  };

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setFullName(getFullName(session?.user ?? null));  // ← ADD THIS
      if (session?.user) fetchRole(session.user.id, session.user.email);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setFullName(getFullName(session?.user ?? null));  // ← ADD THIS
      if (session?.user) fetchRole(session.user.id, session.user.email);
      else setRole(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) return { error: new Error('Auth not configured') };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    // Set full name immediately after signup
    if (data?.user) {
      setFullName(fullName);
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Auth not configured') };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data?.user) {
      setFullName(getFullName(data.user));  // ← ADD THIS
    }
    return { error };
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    setFullName(null);  // ← ADD THIS
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading, fullName, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}