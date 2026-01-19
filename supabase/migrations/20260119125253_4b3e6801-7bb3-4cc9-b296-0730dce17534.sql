-- Create webhook_tokens table for managing webhook authentication
CREATE TABLE public.webhook_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  repository_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.webhook_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for access
CREATE POLICY "Allow all access to webhook_tokens" 
ON public.webhook_tokens 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.webhook_tokens;