import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vulnerabilities, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const vulnSummary = vulnerabilities.map((v: any, i: number) => 
      `${i + 1}. **${v.title}** (${v.severity.toUpperCase()})
   - File: ${v.file}:${v.line}
   - CWE: ${v.cweId}
   - Issue: ${v.description}
   - Vulnerable: \`${v.vulnerableCode.split('\n')[0]}...\``
    ).join('\n\n');

    const systemPrompt = `You are DevGuard AI, an expert security analyst generating comprehensive security reports.

Your task is to analyze multiple vulnerabilities and produce a detailed security assessment report with:

1. **Executive Summary** - 2-3 sentences on overall security posture
2. **Risk Assessment** - Overall risk level (Critical/High/Medium/Low) with justification
3. **Attack Surface Analysis** - What attack vectors are exposed
4. **Priority Matrix** - Rank vulnerabilities by business impact and exploitability
5. **Remediation Roadmap** - Phased approach to fixing issues (Immediate/Short-term/Long-term)
6. **Code Quality Patterns** - Common anti-patterns detected
7. **Security Recommendations** - Proactive measures to prevent future issues
8. **Compliance Impact** - How these issues affect OWASP Top 10, SOC2, etc.

Format the report in clean markdown with clear sections and bullet points.
Be specific and actionable. Include code examples where helpful.`;

    const userPrompt = `Generate a comprehensive security analysis report for the following vulnerabilities detected in a code scan:

**Context:**
- Total Vulnerabilities: ${vulnerabilities.length}
- High Severity: ${vulnerabilities.filter((v: any) => v.severity === 'high').length}
- Medium Severity: ${vulnerabilities.filter((v: any) => v.severity === 'medium').length}
- Low Severity: ${vulnerabilities.filter((v: any) => v.severity === 'low').length}
${context?.repository ? `- Repository: ${context.repository}` : ''}
${context?.prTitle ? `- PR: ${context.prTitle}` : ''}

**Vulnerabilities Detected:**

${vulnSummary}

Please provide a thorough security assessment with actionable recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Batch analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
