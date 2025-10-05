import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import PasswordGenerator from "@/components/PasswordGenerator";
import { supabase } from "@/integrations/supabase/client";

const Generator = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <PasswordGenerator />
        </div>
      </div>
    </div>
  );
};

export default Generator;
