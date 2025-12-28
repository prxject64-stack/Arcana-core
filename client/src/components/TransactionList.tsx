import { Transaction } from "@shared/schema";
import { ArrowDownLeft, ArrowUpRight, Clock, Box } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TransactionListProps {
  transactions?: Transaction[];
  currentWalletAddress?: string;
}

export function TransactionList({ transactions, currentWalletAddress }: TransactionListProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed border-white/10 rounded-lg">
        <Box className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-mono uppercase text-sm">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const isIncoming = tx.toAddress === currentWalletAddress;
        const isMining = !tx.fromAddress;

        return (
          <div 
            key={tx.id} 
            className="group flex items-center justify-between p-4 bg-black/40 border border-white/5 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${isMining ? 'bg-accent/10 text-accent' : isIncoming ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {isMining ? <Box className="w-5 h-5" /> : isIncoming ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>
              
              <div>
                <div className="font-mono text-sm text-white font-bold flex items-center gap-2">
                  {isMining ? 'MINING REWARD' : isIncoming ? 'RECEIVED' : 'SENT'}
                  {tx.status === 'pending' && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 rounded">
                      PENDING
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground font-mono truncate max-w-[120px] md:max-w-[300px]">
                  {isMining 
                    ? `Block #${tx.blockHeight}` 
                    : isIncoming 
                      ? `From: ${tx.fromAddress}` 
                      : `To: ${tx.toAddress}`
                  }
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className={`font-mono font-bold text-lg ${isIncoming || isMining ? 'text-green-500' : 'text-red-500'}`}>
                {isIncoming || isMining ? '+' : '-'}{Number(tx.amount).toFixed(4)} ARC
              </div>
              <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {tx.timestamp && formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
