import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WebhookToken {
  id: string;
  name: string;
  token: string;
  repository_name: string | null;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export const useWebhookTokens = () => {
  const [tokens, setTokens] = useState<WebhookToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTokens = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("webhook_tokens")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching webhook tokens:", error);
      toast.error("Failed to load webhook tokens");
    } else {
      setTokens(data || []);
    }
    setIsLoading(false);
  };

  const generateToken = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  const createToken = async (name: string, repositoryName?: string) => {
    const token = generateToken();
    
    const { error } = await supabase.from("webhook_tokens").insert({
      name,
      token,
      repository_name: repositoryName || null,
    });

    if (error) {
      console.error("Error creating webhook token:", error);
      toast.error("Failed to create webhook token");
      return null;
    }

    toast.success("Webhook token created successfully");
    await fetchTokens();
    return token;
  };

  const deleteToken = async (id: string) => {
    const { error } = await supabase
      .from("webhook_tokens")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting webhook token:", error);
      toast.error("Failed to delete webhook token");
      return;
    }

    toast.success("Webhook token deleted");
    await fetchTokens();
  };

  const toggleToken = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("webhook_tokens")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      console.error("Error updating webhook token:", error);
      toast.error("Failed to update webhook token");
      return;
    }

    toast.success(isActive ? "Token activated" : "Token deactivated");
    await fetchTokens();
  };

  useEffect(() => {
    fetchTokens();

    const channel = supabase
      .channel("webhook_tokens_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "webhook_tokens" },
        () => fetchTokens()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    tokens,
    isLoading,
    createToken,
    deleteToken,
    toggleToken,
    refreshTokens: fetchTokens,
  };
};
