import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useNetwork() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: stats } = useQuery({
    queryKey: [api.network.stats.path],
    queryFn: async () => {
      const res = await fetch(api.network.stats.path);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.network.stats.responses[200].parse(await res.json());
    },
    refetchInterval: 10000, // Live updates
  });

  const { data: blocks } = useQuery({
    queryKey: [api.network.blocks.path],
    queryFn: async () => {
      const res = await fetch(api.network.blocks.path);
      if (!res.ok) throw new Error("Failed to fetch blocks");
      return api.network.blocks.responses[200].parse(await res.json());
    },
    refetchInterval: 10000,
  });

  const mineBlockMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.network.mine.path, {
        method: api.network.mine.method,
      });
      if (!res.ok) throw new Error("Mining failed");
      return api.network.mine.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.network.stats.path] });
      queryClient.invalidateQueries({ queryKey: [api.network.blocks.path] });
      queryClient.invalidateQueries({ queryKey: [api.wallet.get.path] }); // Update balance
      
      toast({
        title: "BLOCK DISCOVERED",
        description: `Reward: ${data.reward} ARC credited to your wallet.`,
        className: "border-accent text-accent bg-black font-mono",
      });
    },
  });

  return {
    stats,
    blocks,
    mineBlock: mineBlockMutation.mutate,
    isMining: mineBlockMutation.isPending,
  };
}
