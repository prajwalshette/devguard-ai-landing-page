import { useState, useEffect, useCallback } from "react";

export type DismissReason = "ignored" | "false_positive";

export interface DismissedVulnerability {
  id: string;
  reason: DismissReason;
  dismissedAt: string;
}

const STORAGE_KEY = "devguard_dismissed_vulnerabilities";

export const getDismissedVulnerabilities = (): DismissedVulnerability[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const isVulnerabilityDismissed = (id: string): boolean => {
  const dismissed = getDismissedVulnerabilities();
  return dismissed.some((d) => d.id === id);
};

export const getDismissInfo = (id: string): DismissedVulnerability | undefined => {
  const dismissed = getDismissedVulnerabilities();
  return dismissed.find((d) => d.id === id);
};

export const useDismissedVulnerabilities = () => {
  const [dismissed, setDismissed] = useState<DismissedVulnerability[]>([]);

  useEffect(() => {
    setDismissed(getDismissedVulnerabilities());
  }, []);

  const dismissVulnerability = useCallback((id: string, reason: DismissReason) => {
    const newDismissed: DismissedVulnerability = {
      id,
      reason,
      dismissedAt: new Date().toISOString(),
    };
    
    const updated = [...dismissed.filter((d) => d.id !== id), newDismissed];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setDismissed(updated);
  }, [dismissed]);

  const restoreVulnerability = useCallback((id: string) => {
    const updated = dismissed.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setDismissed(updated);
  }, [dismissed]);

  const isDissmissed = useCallback((id: string) => {
    return dismissed.some((d) => d.id === id);
  }, [dismissed]);

  const getInfo = useCallback((id: string) => {
    return dismissed.find((d) => d.id === id);
  }, [dismissed]);

  return {
    dismissed,
    dismissVulnerability,
    restoreVulnerability,
    isDissmissed,
    getInfo,
  };
};
