import { useState, useEffect } from "react";

interface GitHubConfig {
  repoUrl: string;
  branch: string;
}

const DEFAULT_CONFIG: GitHubConfig = {
  repoUrl: "https://github.com/kunaljoshi-creator/devpilot-ai",
  branch: "dev-v1",
};

const STORAGE_KEY = "devguard-github-config";

export const useGitHubConfig = () => {
  const [config, setConfig] = useState<GitHubConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch {
        setConfig(DEFAULT_CONFIG);
      }
    }
  }, []);

  const updateConfig = (newConfig: GitHubConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { config, updateConfig, resetConfig, defaultConfig: DEFAULT_CONFIG };
};

export const getGitHubConfig = (): GitHubConfig => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_CONFIG;
    }
  }
  return DEFAULT_CONFIG;
};
