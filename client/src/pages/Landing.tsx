import { Link } from "wouter";
import { CyberButton } from "@/components/CyberButton";
import { CyberCard } from "@/components/CyberCard";
import { Shield, Lock, Eye, Database, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-block px-3 py-1 border border-primary/30 bg-primary/10 text-primary font-mono text-sm tracking-widest mb-4">
            SYSTEM STATUS: ONLINE
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter neon-text leading-none">
            RECLAIM YOUR <br/>
            <span className="text-primary">PRIVACY</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-sans font-light">
            The next generation of anonymous digital currency. Untraceable. Decentralized. Secure.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/auth?mode=register">
              <CyberButton className="w-full sm:w-auto text-lg px-10 py-4">
                Initialize Wallet
              </CyberButton>
            </Link>
            <Link href="/explorer">
              <CyberButton variant="secondary" className="w-full sm:w-auto text-lg px-10 py-4">
                View Network
              </CyberButton>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-black/50 border-t border-white/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <CyberCard 
                icon={<Lock className="w-8 h-8" />} 
                title="Untraceable"
                className="hover:border-primary/50 transition-colors"
              >
                <p className="text-muted-foreground leading-relaxed">
                  Advanced ring signatures obfuscate the origins of every transaction, making it impossible to trace funds back to you.
                </p>
              </CyberCard>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CyberCard 
                icon={<Eye className="w-8 h-8" />} 
                title="Private by Default"
                className="hover:border-primary/50 transition-colors"
              >
                <p className="text-muted-foreground leading-relaxed">
                  Unlike Bitcoin, your wallet balance and history are hidden from the public blockchain. Only you hold the view key.
                </p>
              </CyberCard>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CyberCard 
                icon={<Shield className="w-8 h-8" />} 
                title="ASIC Resistant"
                className="hover:border-primary/50 transition-colors"
              >
                <p className="text-muted-foreground leading-relaxed">
                  Our RandomX algorithm ensures mining remains decentralized and accessible to anyone with a standard CPU.
                </p>
              </CyberCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-t border-white/5 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <Cpu className="w-8 h-8 mx-auto text-primary mb-4" />
              <div className="text-3xl font-display font-bold">12.5 MH/s</div>
              <div className="text-sm font-mono text-muted-foreground">NETWORK HASHRATE</div>
            </div>
            <div className="space-y-2">
              <Database className="w-8 h-8 mx-auto text-primary mb-4" />
              <div className="text-3xl font-display font-bold">842,109</div>
              <div className="text-sm font-mono text-muted-foreground">BLOCK HEIGHT</div>
            </div>
            <div className="space-y-2">
              <Lock className="w-8 h-8 mx-auto text-primary mb-4" />
              <div className="text-3xl font-display font-bold">$0.00</div>
              <div className="text-sm font-mono text-muted-foreground">TX FEES</div>
            </div>
            <div className="space-y-2">
              <Shield className="w-8 h-8 mx-auto text-primary mb-4" />
              <div className="text-3xl font-display font-bold">100%</div>
              <div className="text-sm font-mono text-muted-foreground">UPTIME</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center">
        <p className="font-mono text-xs text-muted-foreground">
          ARCANA NETWORK © 2024 // DECENTRALIZED PROTOCOL v1.0.0
        </p>
      </footer>
    </div>
  );
}
