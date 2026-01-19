import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Webhook, Plus, Copy, Trash2, Key, Clock, CheckCircle, XCircle, Code, ExternalLink } from "lucide-react";
import { useWebhookTokens } from "@/hooks/useWebhookTokens";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const WEBHOOK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trigger-scan-webhook`;

export const WebhookIntegration = () => {
  const { tokens, isLoading, createToken, deleteToken, toggleToken } = useWebhookTokens();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenRepo, setNewTokenRepo] = useState("");
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  const handleCreateToken = async () => {
    if (!newTokenName.trim()) {
      toast.error("Please enter a token name");
      return;
    }

    const token = await createToken(newTokenName.trim(), newTokenRepo.trim() || undefined);
    if (token) {
      setCreatedToken(token);
      setNewTokenName("");
      setNewTokenRepo("");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCreatedToken(null);
    setNewTokenName("");
    setNewTokenRepo("");
  };

  const githubActionsExample = `name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  trigger-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger DevGuard Scan
        run: |
          curl -X POST "${WEBHOOK_URL}" \\
            -H "Content-Type: application/json" \\
            -H "x-webhook-token: \${{ secrets.DEVGUARD_WEBHOOK_TOKEN }}" \\
            -d '{
              "repository_name": "\${{ github.repository }}",
              "branch": "\${{ github.ref_name }}",
              "commit_sha": "\${{ github.sha }}",
              "pr_number": "\${{ github.event.pull_request.number }}",
              "event_type": "\${{ github.event_name }}"
            }'`;

  const curlExample = `curl -X POST "${WEBHOOK_URL}" \\
  -H "Content-Type: application/json" \\
  -H "x-webhook-token: YOUR_TOKEN_HERE" \\
  -d '{
    "repository_name": "my-org/my-repo",
    "branch": "main",
    "commit_sha": "abc123",
    "event_type": "push"
  }'`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              <CardTitle>Webhook Integration</CardTitle>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Token
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {createdToken ? "Token Created!" : "Create Webhook Token"}
                  </DialogTitle>
                  <DialogDescription>
                    {createdToken
                      ? "Save this token now. You won't be able to see it again."
                      : "Create a new token to authenticate webhook requests from your CI/CD pipelines."}
                  </DialogDescription>
                </DialogHeader>

                {createdToken ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <Label className="text-xs text-muted-foreground">Your Webhook Token</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 text-sm break-all font-mono bg-background p-2 rounded border">
                          {createdToken}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(createdToken, "Token")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <Label className="text-xs text-muted-foreground">Webhook URL</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 text-xs break-all font-mono bg-background p-2 rounded border">
                          {WEBHOOK_URL}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(WEBHOOK_URL, "URL")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleDialogClose}>Done</Button>
                    </DialogFooter>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="token-name">Token Name *</Label>
                      <Input
                        id="token-name"
                        placeholder="e.g., GitHub Actions - Main Repo"
                        value={newTokenName}
                        onChange={(e) => setNewTokenName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="token-repo">Repository Name (optional)</Label>
                      <Input
                        id="token-repo"
                        placeholder="e.g., my-org/my-repo"
                        value={newTokenRepo}
                        onChange={(e) => setNewTokenRepo(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Default repository for scans triggered with this token
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={handleDialogClose}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateToken}>Create Token</Button>
                    </DialogFooter>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Trigger security scans from external CI/CD pipelines like GitHub Actions, GitLab CI, or Jenkins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <Label className="text-sm font-medium">Webhook Endpoint</Label>
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 text-sm font-mono bg-background p-2 rounded border break-all">
                {WEBHOOK_URL}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(WEBHOOK_URL, "Webhook URL")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tokens...</div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No webhook tokens created yet</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Token
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{token.name}</span>
                      <Badge variant={token.is_active ? "default" : "secondary"}>
                        {token.is_active ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {token.repository_name && (
                        <span className="truncate">{token.repository_name}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created {formatDistanceToNow(new Date(token.created_at), { addSuffix: true })}
                      </span>
                      {token.last_used_at && (
                        <span>
                          Last used {formatDistanceToNow(new Date(token.last_used_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={token.is_active}
                      onCheckedChange={(checked) => toggleToken(token.id, checked)}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Webhook Token?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the token "{token.name}". Any CI/CD pipelines using this token will no longer be able to trigger scans.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteToken(token.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <CardTitle>Integration Examples</CardTitle>
          </div>
          <CardDescription>
            Copy these examples to integrate DevGuard scans into your CI/CD pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="github">
            <TabsList>
              <TabsTrigger value="github">GitHub Actions</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>
            <TabsContent value="github" className="mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Add this workflow to your repository's <code className="bg-muted px-1 rounded">.github/workflows/</code> directory.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(githubActionsExample, "GitHub Actions workflow")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                  <code>{githubActionsExample}</code>
                </pre>
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Don't forget to add the secret!
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      Go to your GitHub repository → Settings → Secrets and add <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">DEVGUARD_WEBHOOK_TOKEN</code> with your token value.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="curl" className="mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Use this cURL command to trigger a scan manually or from any CI/CD system.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(curlExample, "cURL command")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                  <code>{curlExample}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
