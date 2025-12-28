import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type SendTransactionRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useWallet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: [api.wallet.get.path],
    queryFn: async () => {
      const res = await fetch(api.wallet.get.path);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch wallet");
      return api.wallet.get.responses[200].parse(await res.json());
    },
    retry: false,
  });

  const createWalletMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.wallet.create.path, {
        method: api.wallet.create.method,
      });
      if (!res.ok) throw new Error("Failed to create wallet");
      return api.wallet.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.wallet.get.path] });
      toast({
        title: "WALLET GENERATED",
        description: "New secure keypair initialized.",
        className: "border-primary text-primary bg-black font-mono",
      });
    },
  });

  const sendTransactionMutation = useMutation({
    mutationFn: async (data: SendTransactionRequest) => {
      const res = await fetch(api.transactions.send.path, {
        method: api.transactions.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const err = await res.json();
          throw new Error(err.message);
        }
        throw new Error("Transaction failed");
      }
      
      return api.transactions.send.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.wallet.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.transactions.history.path] });
      toast({
        title: "TRANSACTION INITIATED",
        description: "Funds are propagating through the network.",
        className: "border-primary text-primary bg-black font-mono",
      });
    },
    onError: (error) => {
      toast({
        title: "TRANSACTION REJECTED",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: [api.transactions.history.path],
    queryFn: async () => {
      const res = await fetch(api.transactions.history.path);
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.transactions.history.responses[200].parse(await res.json());
    },
    enabled: !!wallet, // Only fetch history if wallet exists
  });

  return {
    wallet,
    isWalletLoading,
    createWallet: createWalletMutation.mutate,
    isCreatingWallet: createWalletMutation.isPending,
    sendTransaction: sendTransactionMutation.mutate,
    isSending: sendTransactionMutation.isPending,
    history,
    isHistoryLoading,
  };
}
