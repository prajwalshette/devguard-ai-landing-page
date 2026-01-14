import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Vulnerability {
  id: string;
  title: string;
  severity: string;
  file: string;
  line: number;
  description: string;
  vulnerableCode: string;
  fixedCode: string;
  cweId: string;
}

interface RemediationRequest {
  vulnerability: Vulnerability;
  action: "generate" | "validate" | "apply";
  context?: {
    repository?: string;
    branch?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vulnerability, action, context } = (await req.json()) as RemediationRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "generate") {
      systemPrompt = `You are an expert security engineer specializing in automated code remediation. Your task is to generate a comprehensive, production-ready fix for security vulnerabilities.

You must respond with a valid JSON object containing:
{
  "enhancedFix": "The improved, production-ready fixed code",
  "explanation": "Brief explanation of the fix",
  "steps": ["Step 1", "Step 2", ...], // Implementation steps
  "testCases": ["Test case 1", "Test case 2", ...], // Suggested tests
  "additionalChanges": [{"file": "path", "change": "description"}], // Other files that may need changes
  "securityNotes": ["Note 1", "Note 2", ...], // Security considerations
  "rollbackPlan": "How to safely rollback if issues occur"
}`;

      userPrompt = `Generate a comprehensive remediation plan for this vulnerability:

**Vulnerability:** ${vulnerability.title}
**Severity:** ${vulnerability.severity}
**File:** ${vulnerability.file}:${vulnerability.line}
**CWE:** ${vulnerability.cweId}
**Description:** ${vulnerability.description}

**Current Vulnerable Code:**
\`\`\`
${vulnerability.vulnerableCode}
\`\`\`

**Suggested Fix:**
\`\`\`
${vulnerability.fixedCode}
\`\`\`

Please enhance this fix with production-ready code, implementation steps, test cases, and security notes.`;
    } else if (action === "validate") {
      systemPrompt = `You are a security code reviewer. Validate that the proposed fix correctly addresses the vulnerability without introducing new issues.

Respond with a JSON object:
{
  "isValid": true/false,
  "issues": ["Issue 1", ...] or [],
  "suggestions": ["Suggestion 1", ...],
  "securityScore": 1-10,
  "confidence": "high" | "medium" | "low"
}`;

      userPrompt = `Validate this security fix:

**Original Issue:** ${vulnerability.title} (${vulnerability.cweId})

**Vulnerable Code:**
\`\`\`
${vulnerability.vulnerableCode}
\`\`\`

**Proposed Fix:**
\`\`\`
${vulnerability.fixedCode}
\`\`\`

Verify this fix properly addresses the vulnerability.`;
    } else if (action === "apply") {
      systemPrompt = `You are a DevOps automation expert. Generate the exact commands and workflow to apply a security fix to a codebase.

Respond with a JSON object:
{
  "commands": ["command 1", "command 2", ...],
  "prTitle": "PR title",
  "prBody": "PR description in markdown",
  "commitMessage": "Commit message",
  "labels": ["label1", "label2"],
  "reviewers": ["suggested reviewers or team names"]
}`;

      userPrompt = `Generate apply workflow for:

**Repository:** ${context?.repository || "unknown"}
**Branch:** ${context?.branch || "main"}
**File:** ${vulnerability.file}
**Line:** ${vulnerability.line}

**Fix to Apply:**
\`\`\`
${vulnerability.fixedCode}
\`\`\`

**Vulnerability:** ${vulnerability.title} (${vulnerability.cweId})`;
    }

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
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const result = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ success: true, action, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Auto-remediation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
