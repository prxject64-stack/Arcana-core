import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { CyberButton } from "@/components/CyberButton";
import { CyberInput } from "@/components/CyberInput";
import { CyberCard } from "@/components/CyberCard";
import { Shield } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

const authSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
  
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const { login, register, isLoggingIn, isRegistering, user } = useAuth();

  const { register: registerField, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  // Redirect if already logged in
  if (user) {
    setLocation("/dashboard");
    return null;
  }

  const onSubmit = (data: AuthFormData) => {
    if (mode === "login") {
      login(data);
    } else {
      register(data);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <CyberCard className="border-primary/30">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
            <h1 className="text-2xl font-display font-bold tracking-widest text-white">
              {mode === "login" ? "AUTHENTICATION" : "NEW IDENTITY"}
            </h1>
            <p className="text-muted-foreground font-mono text-sm mt-2">
              {mode === "login" ? "Enter your credentials to access the network." : "Create a secure decentralized identity."}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <CyberInput
              label="Username"
              placeholder="Enter codename..."
              {...registerField("username")}
              error={errors.username?.message}
            />
            
            <CyberInput
              label="Password"
              type="password"
              placeholder="••••••••••••"
              {...registerField("password")}
              error={errors.password?.message}
            />

            <CyberButton 
              type="submit" 
              className="w-full" 
              isLoading={isLoggingIn || isRegistering}
            >
              {mode === "login" ? "Access Terminal" : "Initialize Identity"}
            </CyberButton>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
            >
              {mode === "login" ? "Create new account" : "Back to login"}
            </button>
          </div>
        </CyberCard>
      </motion.div>
    </div>
  );
}
