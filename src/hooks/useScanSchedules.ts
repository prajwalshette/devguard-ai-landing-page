import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ScanSchedule {
  id: string;
  repository_name: string;
  repository_url: string;
  schedule_type: "manual" | "daily" | "weekly" | "on_pr_merge" | "hourly";
  schedule_time: string | null;
  schedule_day: number | null;
  enabled: boolean;
  last_scan_at: string | null;
  next_scan_at: string | null;
  scan_branches: string[];
  notify_on_complete: boolean;
  notify_on_critical: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScanHistory {
  id: string;
  schedule_id: string | null;
  repository_name: string;
  status: "pending" | "running" | "completed" | "failed";
  trigger_type: "scheduled" | "manual" | "pr_merge" | "webhook";
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  files_scanned: number;
  vulnerabilities_found: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  error_message: string | null;
  metadata: Record<string, unknown>;
}

export function useScanSchedules() {
  const [schedules, setSchedules] = useState<ScanSchedule[]>([]);
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSchedules = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("scan_schedules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSchedules((data || []) as ScanSchedule[]);
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
    }
  }, []);

  const fetchHistory = useCallback(async (limit = 20) => {
    try {
      const { data, error } = await supabase
        .from("scan_history")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      setHistory((data || []) as ScanHistory[]);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSchedule = useCallback(async (schedule: Omit<ScanSchedule, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase
        .from("scan_schedules")
        .insert(schedule)
        .select()
        .single();

      if (error) throw error;
      setSchedules((prev) => [data as ScanSchedule, ...prev]);
      toast.success("Schedule created successfully");
      return data as ScanSchedule;
    } catch (err) {
      console.error("Failed to create schedule:", err);
      toast.error("Failed to create schedule");
      throw err;
    }
  }, []);

  const updateSchedule = useCallback(async (id: string, updates: Partial<ScanSchedule>) => {
    try {
      const { data, error } = await supabase
        .from("scan_schedules")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setSchedules((prev) => prev.map((s) => (s.id === id ? (data as ScanSchedule) : s)));
      toast.success("Schedule updated");
      return data as ScanSchedule;
    } catch (err) {
      console.error("Failed to update schedule:", err);
      toast.error("Failed to update schedule");
      throw err;
    }
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("scan_schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      toast.success("Schedule deleted");
    } catch (err) {
      console.error("Failed to delete schedule:", err);
      toast.error("Failed to delete schedule");
    }
  }, []);

  const toggleSchedule = useCallback(async (id: string, enabled: boolean) => {
    return updateSchedule(id, { enabled });
  }, [updateSchedule]);

  const triggerManualScan = useCallback(async (schedule: ScanSchedule) => {
    try {
      // Create a scan history entry
      const { data, error } = await supabase
        .from("scan_history")
        .insert({
          schedule_id: schedule.id,
          repository_name: schedule.repository_name,
          status: "running",
          trigger_type: "manual",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Scan started", {
        description: `Scanning ${schedule.repository_name}...`,
      });

      // Simulate scan completion after a delay
      setTimeout(async () => {
        const mockResults = {
          status: "completed" as const,
          completed_at: new Date().toISOString(),
          duration_seconds: Math.floor(Math.random() * 120) + 30,
          files_scanned: Math.floor(Math.random() * 100) + 20,
          vulnerabilities_found: Math.floor(Math.random() * 10),
          high_count: Math.floor(Math.random() * 3),
          medium_count: Math.floor(Math.random() * 4),
          low_count: Math.floor(Math.random() * 5),
        };

        await supabase
          .from("scan_history")
          .update(mockResults)
          .eq("id", (data as ScanHistory).id);

        await supabase
          .from("scan_schedules")
          .update({ last_scan_at: new Date().toISOString() })
          .eq("id", schedule.id);

        // Create notification
        if (schedule.notify_on_complete || (schedule.notify_on_critical && mockResults.high_count > 0)) {
          await supabase.from("notifications").insert({
            type: mockResults.high_count > 0 ? "vulnerability_detected" : "scan_complete",
            title: mockResults.high_count > 0 
              ? `Critical vulnerabilities found in ${schedule.repository_name}`
              : `Scan complete: ${schedule.repository_name}`,
            message: `Found ${mockResults.vulnerabilities_found} vulnerabilities (${mockResults.high_count} high, ${mockResults.medium_count} medium, ${mockResults.low_count} low)`,
            severity: mockResults.high_count > 0 ? "high" : "info",
            metadata: { scheduleId: schedule.id, scanId: (data as ScanHistory).id },
          });
        }

        fetchHistory();
        fetchSchedules();
      }, 3000);

      return data as ScanHistory;
    } catch (err) {
      console.error("Failed to trigger scan:", err);
      toast.error("Failed to start scan");
      throw err;
    }
  }, [fetchHistory, fetchSchedules]);

  useEffect(() => {
    fetchSchedules();
    fetchHistory();

    // Setup realtime subscriptions
    const channel = supabase
      .channel("scan-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scan_schedules" },
        () => fetchSchedules()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scan_history" },
        () => fetchHistory()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSchedules, fetchHistory]);

  return {
    schedules,
    history,
    isLoading,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
    triggerManualScan,
    refetch: () => {
      fetchSchedules();
      fetchHistory();
    },
  };
}
