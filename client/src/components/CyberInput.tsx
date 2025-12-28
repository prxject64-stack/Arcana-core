import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from "@/lib/utils";

interface CyberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const CyberInput = forwardRef<HTMLInputElement, CyberInputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            className={cn(
              "cyber-input",
              error && "border-destructive focus:border-destructive focus:ring-destructive/50",
              className
            )}
            {...props}
          />
          {/* Corner accents */}
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-focus-within:border-primary transition-colors pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-focus-within:border-primary transition-colors pointer-events-none" />
        </div>
        {error && (
          <p className="text-destructive text-xs font-mono ml-1">{error}</p>
        )}
      </div>
    );
  }
);
CyberInput.displayName = "CyberInput";
