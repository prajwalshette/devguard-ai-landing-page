-- Create scan_schedules table for scheduled scanning configuration
CREATE TABLE public.scan_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repository_name TEXT NOT NULL,
  repository_url TEXT NOT NULL,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('manual', 'daily', 'weekly', 'on_pr_merge', 'hourly')),
  schedule_time TEXT, -- Time in HH:MM format for daily/weekly
  schedule_day INTEGER CHECK (schedule_day >= 0 AND schedule_day <= 6), -- Day of week for weekly (0 = Sunday)
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_scan_at TIMESTAMP WITH TIME ZONE,
  next_scan_at TIMESTAMP WITH TIME ZONE,
  scan_branches TEXT[] DEFAULT ARRAY['main'],
  notify_on_complete BOOLEAN DEFAULT true,
  notify_on_critical BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scan_schedules ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (demo app)
CREATE POLICY "Allow all access to scan_schedules" 
ON public.scan_schedules 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_scan_schedules_enabled ON public.scan_schedules(enabled);
CREATE INDEX idx_scan_schedules_next_scan ON public.scan_schedules(next_scan_at);

-- Create scan_history table to track scan runs
CREATE TABLE public.scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES public.scan_schedules(id) ON DELETE CASCADE,
  repository_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('scheduled', 'manual', 'pr_merge', 'webhook')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  files_scanned INTEGER DEFAULT 0,
  vulnerabilities_found INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to scan_history" 
ON public.scan_history 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_scan_history_schedule ON public.scan_history(schedule_id);
CREATE INDEX idx_scan_history_started ON public.scan_history(started_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_history;