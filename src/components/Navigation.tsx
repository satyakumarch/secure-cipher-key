import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Key, Lock, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { clearKeyFromSession } from "@/lib/encryption";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      if (user) {
        clearKeyFromSession(user.id);
      }
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Shield className="h-6 w-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SecureVault
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button
                  variant={isActive("/generator") ? "default" : "ghost"}
                  asChild
                  className="gap-2"
                >
                  <Link to="/generator">
                    <Key className="h-4 w-4" />
                    Generator
                  </Link>
                </Button>
                <Button
                  variant={isActive("/vault") ? "default" : "ghost"}
                  asChild
                  className="gap-2"
                >
                  <Link to="/vault">
                    <Lock className="h-4 w-4" />
                    Vault
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button asChild variant="default">
                <Link to="/auth">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

// Add missing import
import { useEffect, useState } from "react";
