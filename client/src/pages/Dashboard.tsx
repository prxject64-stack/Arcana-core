import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { CyberCard } from "@/components/CyberCard";
import { CyberButton } from "@/components/CyberButton";
import { CyberInput } from "@/components/CyberInput";
import { TransactionList } from "@/components/TransactionList";
import { Copy, Plus, Send, Wallet, RefreshCw, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { wallet, createWallet, isCreatingWallet, sendTransaction, isSending, history, isHistoryLoading } = useWallet();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      toast({ title: "COPIED", description: "Address copied to clipboard", className: "bg-black text-primary border-primary" });
    }
  };

  const handleSend = () => {
    sendTransaction({ toAddress: recipient, amount }, {
      onSuccess: () => {
        setIsOpen(false);
        setRecipient("");
        setAmount("");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">DASHBOARD</h1>
            <p className="font-mono text-muted-foreground text-sm">SECURE TERMINAL // {user?.username}</p>
          </div>
        </header>

        {!wallet ? (
          <div className="flex flex-col items-center justify-center py-20 bg-secondary/20 border border-dashed border-white/10">
            <Wallet className="w-16 h-16 text-muted-foreground mb-6 opacity-50" />
            <h2 className="text-xl font-display mb-4">NO WALLET FOUND</h2>
            <CyberButton onClick={() => createWallet()} isLoading={isCreatingWallet}>
              GENERATE KEYPAIR
            </CyberButton>
          </div>
        ) : (
          <>
            {/* Wallet Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <CyberCard className="h-full bg-gradient-to-br from-black to-secondary/30">
                  <div className="flex flex-col h-full justify-between gap-8">
                    <div>
                      <h3 className="text-sm font-mono text-muted-foreground mb-1 uppercase tracking-wider">Total Balance</h3>
                      <div className="text-5xl md:text-6xl font-display font-bold text-primary neon-text break-all">
                        {Number(wallet.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} 
                        <span className="text-2xl ml-2 text-white">ARC</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Public Address</h3>
                      <div 
                        onClick={copyAddress}
                        className="font-mono text-xs md:text-sm bg-black/50 p-4 border border-white/10 rounded break-all cursor-pointer hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-between group"
                      >
                        {wallet.address}
                        <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                          <CyberButton className="flex-1">
                            <Send className="w-4 h-4 mr-2" /> SEND ARC
                          </CyberButton>
                        </DialogTrigger>
                        <DialogContent className="bg-black/95 border-primary/50">
                          <DialogHeader>
                            <DialogTitle className="font-display tracking-widest text-primary">INITIATE TRANSFER</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 pt-4">
                            <CyberInput 
                              label="Recipient Address" 
                              placeholder="arc..." 
                              value={recipient}
                              onChange={(e) => setRecipient(e.target.value)}
                            />
                            <CyberInput 
                              label="Amount" 
                              type="number"
                              placeholder="0.00" 
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                            />
                            <CyberButton 
                              className="w-full" 
                              onClick={handleSend}
                              isLoading={isSending}
                            >
                              CONFIRM TRANSACTION
                            </CyberButton>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <CyberButton variant="secondary" className="flex-1" onClick={() => copyAddress()}>
                        <Plus className="w-4 h-4 mr-2" /> RECEIVE
                      </CyberButton>
                    </div>
                  </div>
                </CyberCard>
              </div>

              {/* Quick Stats or Ad */}
              <div className="hidden lg:block">
                 <CyberCard className="h-full bg-accent/5 border-accent/20">
                   <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                     <div className="p-4 bg-accent/10 rounded-full">
                       <RefreshCw className="w-8 h-8 text-accent animate-[spin_10s_linear_infinite]" />
                     </div>
                     <div>
                        <h3 className="text-accent font-display font-bold text-xl">MINING ACTIVE</h3>
                        <p className="text-xs font-mono text-muted-foreground mt-2 px-8">
                          Participate in network security and earn rewards.
                        </p>
                     </div>
                     <CyberButton variant="secondary" className="mt-4 text-xs border-accent text-accent hover:bg-accent">
                       GO TO MINER
                     </CyberButton>
                   </div>
                 </CyberCard>
              </div>
            </div>

            {/* Transaction History */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h2 className="text-xl font-display font-bold">RECENT ACTIVITY</h2>
                {isHistoryLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              </div>
              
              <div className="min-h-[300px]">
                <TransactionList transactions={history} currentWalletAddress={wallet.address} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
