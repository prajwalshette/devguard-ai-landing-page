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
    const { securityData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are DevGuard AI, an expert security analyst specializing in proactive security recommendations. Based on the security patterns and data provided, generate actionable recommendations to improve the overall security posture.

For each recommendation, provide:
1. A clear, prioritized recommendation title
2. The priority level (critical, high, medium, low)
3. The category (authentication, authorization, data-protection, infrastructure, code-quality, dependencies, monitoring)
4. A brief description of the security improvement
5. The expected impact if implemented
6. Specific implementation steps

Format your response as a JSON array of recommendations with this structure:
{
  "recommendations": [
    {
      "title": "string",
      "priority": "critical|high|medium|low",
      "category": "string",
      "description": "string",
      "impact": "string",
      "steps": ["step1", "step2", ...]
    }
  ],
  "overallAssessment": "A brief paragraph summarizing the security posture and key areas for improvement",
  "riskScore": number (0-100, where 100 is highest risk)
}

Provide 5-8 actionable recommendations based on the patterns detected.`;

    const userPrompt = `Analyze the following security data and generate proactive recommendations:

**Security Metrics:**
- Total Vulnerabilities: ${securityData.totalVulnerabilities}
- Critical: ${securityData.critical}
- High: ${securityData.high}
- Medium: ${securityData.medium}
- Low: ${securityData.low}
- Current Security Score: ${securityData.securityScore}/100

**Recent Vulnerability Patterns:**
${securityData.patterns?.map((p: string) => `- ${p}`).join('\n') || 'No specific patterns detected'}

**Repository Information:**
- Total Repositories: ${securityData.repositoryCount}
- Active Scans: ${securityData.activeScans}
- Last Scan: ${securityData.lastScan}

**Common Vulnerability Types:**
${securityData.commonTypes?.map((t: string) => `- ${t}`).join('\n') || 'No common types identified'}

Generate comprehensive security recommendations to improve this security posture.`;

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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from the response
    let recommendations;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      recommendations = {
        recommendations: [],
        overallAssessment: content,
        riskScore: 50
      };
    }

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Security recommendations error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
