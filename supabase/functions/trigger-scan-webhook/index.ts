import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-token",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get webhook token from header
    const webhookToken = req.headers.get("x-webhook-token");
    
    if (!webhookToken) {
      return new Response(
        JSON.stringify({ error: "Missing x-webhook-token header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate the token
    const { data: tokenData, error: tokenError } = await supabase
      .from("webhook_tokens")
      .select("*")
      .eq("token", webhookToken)
      .eq("is_active", true)
      .maybeSingle();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: "Invalid or inactive webhook token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update last_used_at
    await supabase
      .from("webhook_tokens")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", tokenData.id);

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const {
      repository_name = tokenData.repository_name || "Unknown Repository",
      trigger_source = "webhook",
      branch = "main",
      commit_sha,
      pr_number,
      event_type = "push"
    } = body;

    // Create scan history entry
    const { data: scanEntry, error: scanError } = await supabase
      .from("scan_history")
      .insert({
        repository_name,
        status: "running",
        trigger_type: "webhook",
        started_at: new Date().toISOString(),
        metadata: {
          trigger_source,
          branch,
          commit_sha,
          pr_number,
          event_type,
          webhook_token_name: tokenData.name
        }
      })
      .select()
      .single();

    if (scanError) {
      console.error("Error creating scan entry:", scanError);
      return new Response(
        JSON.stringify({ error: "Failed to create scan entry" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Simulate scan completion (in a real implementation, this would trigger actual scanning)
    setTimeout(async () => {
      const vulnerabilities = Math.floor(Math.random() * 10);
      const high = Math.floor(Math.random() * 3);
      const medium = Math.floor(Math.random() * 4);
      const low = vulnerabilities - high - medium;

      await supabase
        .from("scan_history")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          duration_seconds: Math.floor(Math.random() * 60) + 30,
          files_scanned: Math.floor(Math.random() * 500) + 100,
          vulnerabilities_found: vulnerabilities,
          high_count: high,
          medium_count: medium,
          low_count: Math.max(0, low)
        })
        .eq("id", scanEntry.id);

      // Create notification if critical vulnerabilities found
      if (high > 0) {
        await supabase.from("notifications").insert({
          title: "Critical Vulnerabilities Detected",
          message: `Webhook scan for ${repository_name} found ${high} high severity vulnerabilities`,
          type: "security",
          severity: "critical",
          metadata: { scan_id: scanEntry.id, repository_name }
        });
      }
    }, 5000);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Scan triggered successfully",
        scan_id: scanEntry.id,
        repository_name,
        status: "running"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
