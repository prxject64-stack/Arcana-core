import { Link } from "wouter";
import { CyberButton } from "@/components/CyberButton";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="text-center space-y-6 max-w-md">
        <AlertTriangle className="w-24 h-24 text-primary mx-auto opacity-80" />
        
        <h1 className="text-8xl font-display font-black text-white glitch-text neon-text">
          404
        </h1>
        
        <p className="text-xl font-mono text-muted-foreground uppercase tracking-widest">
          Sector Not Found
        </p>
        
        <p className="text-sm text-muted-foreground">
          The requested data coordinates could not be located in the neural net.
        </p>
        
        <div className="pt-8">
          <Link href="/">
            <CyberButton variant="secondary">
              Return to Grid
            </CyberButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
