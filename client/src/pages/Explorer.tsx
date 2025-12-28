import { Navbar } from "@/components/Navbar";
import { CyberCard } from "@/components/CyberCard";
import { useNetwork } from "@/hooks/use-network";
import { useWallet } from "@/hooks/use-wallet";
import { Box, Globe, Activity, Layers } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Explorer() {
  const { blocks, stats } = useNetwork();
  
  // Use wallet hook to check auth state for Navbar rendering
  // The Navbar handles its own auth check but we want consistent wrapper
  const { wallet } = useWallet();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
            <Globe className="w-8 h-8 text-primary" />
            BLOCK EXPLORER
          </h1>
          <p className="font-mono text-muted-foreground text-sm">PUBLIC LEDGER // NETWORK STATUS</p>
        </header>

        {/* Network Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CyberCard className="py-6">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-secondary/50 rounded-lg">
                 <Activity className="w-6 h-6 text-primary" />
               </div>
               <div>
                 <div className="text-xs text-muted-foreground font-mono uppercase">Network Hashrate</div>
                 <div className="text-xl font-bold font-display">{stats?.hashrate || "12.5 MH/s"}</div>
               </div>
            </div>
          </CyberCard>
          
          <CyberCard className="py-6">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-secondary/50 rounded-lg">
                 <Layers className="w-6 h-6 text-accent" />
               </div>
               <div>
                 <div className="text-xs text-muted-foreground font-mono uppercase">Block Height</div>
                 <div className="text-xl font-bold font-display">#{stats?.height || 0}</div>
               </div>
            </div>
          </CyberCard>

          <CyberCard className="py-6">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-secondary/50 rounded-lg">
                 <Box className="w-6 h-6 text-white" />
               </div>
               <div>
                 <div className="text-xs text-muted-foreground font-mono uppercase">Circulating Supply</div>
                 <div className="text-xl font-bold font-display">{(Number(stats?.supply || 0)).toLocaleString()} ARC</div>
               </div>
            </div>
          </CyberCard>
          
          <CyberCard className="py-6">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-secondary/50 rounded-lg">
                 <Activity className="w-6 h-6 text-destructive" />
               </div>
               <div>
                 <div className="text-xs text-muted-foreground font-mono uppercase">Difficulty</div>
                 <div className="text-xl font-bold font-display">{stats?.difficulty || "1.0"}</div>
               </div>
            </div>
          </CyberCard>
        </div>

        {/* Recent Blocks Table */}
        <CyberCard title="LATEST BLOCKS">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground">
                  <th className="px-4 py-3 font-normal">HEIGHT</th>
                  <th className="px-4 py-3 font-normal">HASH</th>
                  <th className="px-4 py-3 font-normal">NONCE</th>
                  <th className="px-4 py-3 font-normal">TIME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {blocks?.map((block) => (
                  <tr key={block.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-primary font-bold">#{block.height}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[200px]">
                      {block.hash}
                    </td>
                    <td className="px-4 py-3">{block.nonce}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {block.timestamp && formatDistanceToNow(new Date(block.timestamp), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
                {(!blocks || blocks.length === 0) && (
                   <tr>
                     <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                       No blocks found. Start mining to generate blocks.
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </CyberCard>
      </main>
    </div>
  );
}
