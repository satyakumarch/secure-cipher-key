import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Key, Lock, Zap, Eye, CheckCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
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

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex h-20 w-20 rounded-full gradient-primary items-center justify-center mb-6 shadow-glow">
            <Shield className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Secure Password
            </span>
            <br />
            Management Made Simple
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate strong passwords and store them securely with client-side encryption. 
            Your data stays private, always.
          </p>
          
          <div className="flex gap-4 justify-center pt-4">
            {user ? (
              <>
                <Button asChild size="lg" className="gradient-primary">
                  <Link to="/generator">
                    <Key className="mr-2 h-5 w-5" />
                    Password Generator
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/vault">
                    <Lock className="mr-2 h-5 w-5" />
                    My Vault
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="gradient-primary">
                <Link to="/auth">Get Started Free</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-6 shadow-card hover:shadow-glow transition-all duration-300">
            <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
              <Key className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Strong Password Generator</h3>
            <p className="text-muted-foreground">
              Create cryptographically secure passwords with customizable length and character types
            </p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-glow transition-all duration-300">
            <div className="h-12 w-12 rounded-lg gradient-secondary flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Encrypted Vault</h3>
            <p className="text-muted-foreground">
              Store passwords with AES-256 encryption. All encryption happens in your browser
            </p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-glow transition-all duration-300">
            <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Fast & Private</h3>
            <p className="text-muted-foreground">
              Zero-knowledge architecture means we never see your passwords or master key
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Create Your Account</h3>
                <p className="text-muted-foreground">
                  Sign up with your email and create a secure master password
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Generate Passwords</h3>
                <p className="text-muted-foreground">
                  Use our generator to create strong, unique passwords for all your accounts
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Store Securely</h3>
                <p className="text-muted-foreground">
                  Save passwords to your encrypted vault, accessible only with your master password
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Security You Can Trust
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-success flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Client-Side Encryption</h4>
                <p className="text-sm text-muted-foreground">
                  All encryption happens in your browser using Web Crypto API
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-success flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Zero-Knowledge</h4>
                <p className="text-sm text-muted-foreground">
                  We never have access to your master password or decrypted data
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-success flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">AES-256 Encryption</h4>
                <p className="text-sm text-muted-foreground">
                  Military-grade encryption protects your sensitive information
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-success flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Secure Key Derivation</h4>
                <p className="text-sm text-muted-foreground">
                  PBKDF2 with 100,000 iterations ensures strong key generation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Secure Your Passwords?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of users protecting their digital life with SecureVault
            </p>
            <Button asChild size="lg" className="gradient-primary">
              <Link to="/auth">Create Free Account</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;
