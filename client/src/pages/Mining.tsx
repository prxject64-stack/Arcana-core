import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { CyberCard } from "@/components/CyberCard";
import { CyberButton } from "@/components/CyberButton";
import { useNetwork } from "@/hooks/use-network";
import { Terminal, Zap, Server, Activity, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Mining() {
  const { mineBlock, isMining, stats } = useNetwork();
  const [logs, setLogs] = useState<string[]>([]);
  const [isAutoMining, setIsAutoMining] = useState(false);
  const [hashrate, setHashrate] = useState(0);

  // Simulate mining logs
  useEffect(() => {
    if (!isAutoMining && !isMining) {
      setHashrate(0);
      return;
    }

    const interval = setInterval(() => {
      // Fluctuate hashrate
      setHashrate(prev => Math.floor(Math.random() * 500) + 1200);

      const newLog = `[${new Date().toLocaleTimeString()}] Hashing block candidate... Nonce: ${Math.floor(Math.random() * 9999999)}`;
      setLogs(prev => [newLog, ...prev].slice(0, 8));
    }, 200);

    return () => clearInterval(interval);
  }, [isAutoMining, isMining]);

  // Attempt to mine periodically if auto-mining
  useEffect(() => {
    if (!isAutoMining) return;

    const interval = setInterval(() => {
      if (!isMining && Math.random() > 0.7) { // 30% chance to find block every 3s
        mineBlock(undefined, {
          onSuccess: (data) => {
            setLogs(prev => [`[SUCCESS] BLOCK FOUND! Reward: ${data.reward} ARC`, ...prev]);
          }
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoMining, isMining, mineBlock]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
            <Terminal className="w-8 h-8 text-primary" />
            MINING TERMINAL
          </h1>
          <p className="font-mono text-muted-foreground text-sm">CONTRIBUTE HASHPOWER // SECURE THE NETWORK</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Mining Console */}
          <div className="lg:col-span-2 space-y-6">
            <CyberCard className="bg-black border-primary/20 min-h-[400px] flex flex-col font-mono text-sm relative overflow-hidden">
               {/* Scanlines overlay */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>
               
               <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-4 z-20">
                 <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></div>
                 </div>
                 <div className="text-xs text-muted-foreground">miner_v1.0.exe</div>
               </div>

               <div className="flex-1 space-y-2 font-mono text-xs md:text-sm text-green-500/80 z-20 overflow-hidden">
                 {logs.map((log, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1 - (i * 0.1), x: 0 }}
                     className="whitespace-nowrap"
                   >
                     {log}
                   </motion.div>
                 ))}
                 {!isAutoMining && !isMining && (
                   <div className="text-white/50 animate-pulse">_ Waiting for command...</div>
                 )}
               </div>
            </CyberCard>

            <div className="flex gap-4">
              <CyberButton 
                onClick={() => setIsAutoMining(!isAutoMining)}
                className={isAutoMining ? "border-destructive text-destructive hover:bg-destructive" : ""}
              >
                {isAutoMining ? "STOP MINING" : "START MINING"}
              </CyberButton>
              
              <CyberButton 
                variant="secondary" 
                onClick={() => mineBlock()} 
                disabled={isAutoMining || isMining}
              >
                MANUAL HASH
              </CyberButton>
            </div>
          </div>

          {/* Stats Column */}
          <div className="space-y-6">
            <CyberCard title="PERFORMANCE">
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">LOCAL HASHRATE</div>
                  <div className="text-3xl font-display font-bold text-primary flex items-end gap-2">
                    {hashrate} <span className="text-sm text-white/50 mb-1">H/s</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">NETWORK DIFF</div>
                    <div className="text-lg font-mono">{stats?.difficulty || "1.0"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">BLOCK HEIGHT</div>
                    <div className="text-lg font-mono">{stats?.height || 0}</div>
                  </div>
                </div>
              </div>
            </CyberCard>

            <CyberCard className="bg-primary/5 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded border border-primary/20">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">MINING REWARDS</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Successfully mined blocks reward 50 ARC. Rewards are credited immediately to your wallet.
                  </p>
                </div>
              </div>
            </CyberCard>
          </div>
        </div>
      </main>
    </div>
  );
}
