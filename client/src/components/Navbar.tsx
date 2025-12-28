import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Shield, LayoutDashboard, Pickaxe, Globe, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { CyberButton } from "./CyberButton";

export function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/mining", label: "Mining", icon: <Pickaxe className="w-4 h-4" /> },
    { href: "/explorer", label: "Explorer", icon: <Globe className="w-4 h-4" /> },
  ];

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="p-1 border border-primary bg-primary/10 group-hover:bg-primary group-hover:text-black transition-colors">
              <Shield className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-xl tracking-widest">ARCANA</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "px-4 py-2 flex items-center gap-2 font-mono text-sm uppercase tracking-wider cursor-pointer hover:text-primary transition-colors border border-transparent",
                  location === item.href && "text-primary border-primary/20 bg-primary/5"
                )}
              >
                {item.icon}
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end text-xs font-mono text-muted-foreground">
            <span>OPERATOR</span>
            <span className="text-primary">{user.username}</span>
          </div>
          <button 
            onClick={() => logout()}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className="md:hidden flex border-t border-white/5 bg-black/50 overflow-x-auto">
         {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex-1 px-4 py-3 flex flex-col items-center justify-center gap-1 font-mono text-[10px] uppercase tracking-wider cursor-pointer whitespace-nowrap",
                  location === item.href ? "text-primary bg-primary/5" : "text-muted-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </div>
            </Link>
          ))}
      </div>
    </header>
  );
}
