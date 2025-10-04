import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    console.log('[ProtectedRoute] Mounting, current path:', window.location.pathname);
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[ProtectedRoute] Initial session:', session ? 'exists' : 'null');
      setSession(session);
      if (session && requireAdmin) {
        checkSuperAdminStatus(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[ProtectedRoute] Auth state changed:', event, 'session:', session ? 'exists' : 'null');
      setSession(session);
      if (session && requireAdmin) {
        checkSuperAdminStatus(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [requireAdmin]);

  const checkSuperAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('super_admin_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        setIsSuperAdmin(true);
      }
    } catch (error) {
      console.error('Error checking super admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    // Redirect to admin login if admin route, otherwise to regular login
    const currentPath = window.location.pathname + window.location.search;
    const redirectPath = requireAdmin ? "/admin/login" : "/login";
    return <Navigate to={`${redirectPath}?redirect=${encodeURIComponent(currentPath)}`} replace />;
  }

  if (requireAdmin && !isSuperAdmin) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
