import { ReactNode } from 'react';
import { cn } from "@/lib/utils";

interface CyberCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
}

export function CyberCard({ children, className, title, icon }: CyberCardProps) {
  return (
    <div className={cn("cyber-card flex flex-col h-full", className)}>
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-white/10">
          {icon && <span className="text-primary">{icon}</span>}
          {title && <h3 className="text-xl font-bold tracking-widest text-white uppercase">{title}</h3>}
        </div>
      )}
      <div className="flex-1 relative z-10">
        {children}
      </div>
    </div>
  );
}
