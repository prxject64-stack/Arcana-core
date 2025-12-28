import { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from "@/lib/utils";
import { Loader2 } from 'lucide-react';

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export function CyberButton({ 
  children, 
  className, 
  variant = 'primary', 
  isLoading,
  disabled,
  ...props 
}: CyberButtonProps) {
  const variants = {
    primary: "border-primary text-primary hover:bg-primary hover:text-black hover:shadow-[0_0_20px_rgba(255,153,0,0.5)]",
    secondary: "border-muted-foreground text-muted-foreground hover:border-white hover:text-white hover:shadow-[0_0_10px_rgba(255,255,255,0.3)]",
    danger: "border-destructive text-destructive hover:bg-destructive hover:text-white hover:shadow-[0_0_20px_rgba(255,0,0,0.5)]",
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={cn(
        "relative px-6 py-3 bg-transparent border font-bold uppercase tracking-widest transition-all duration-200 overflow-hidden group font-display text-sm md:text-base",
        variants[variant],
        (isLoading || disabled) && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </span>
      
      {/* Glitch overlay effect on hover */}
      <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0" />
    </button>
  );
}
