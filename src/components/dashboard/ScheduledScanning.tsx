import { useState } from "react";
import {
  Calendar,
  Clock,
  GitBranch,
  GitMerge,
  Play,
  Plus,
  Settings2,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScanSchedules, ScanSchedule, ScanHistory } from "@/hooks/useScanSchedules";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const getScheduleIcon = (type: ScanSchedule["schedule_type"]) => {
  switch (type) {
    case "hourly":
      return <Timer className="h-4 w-4" />;
    case "daily":
      return <Calendar className="h-4 w-4" />;
    case "weekly":
      return <Calendar className="h-4 w-4" />;
    case "on_pr_merge":
      return <GitMerge className="h-4 w-4" />;
    default:
      return <Play className="h-4 w-4" />;
  }
};

const getScheduleLabel = (schedule: ScanSchedule) => {
  switch (schedule.schedule_type) {
    case "hourly":
      return "Every hour";
    case "daily":
      return `Daily at ${schedule.schedule_time || "00:00"}`;
    case "weekly":
      return `${DAYS_OF_WEEK[schedule.schedule_day || 0]} at ${schedule.schedule_time || "00:00"}`;
    case "on_pr_merge":
      return "On PR merge";
    default:
      return "Manual only";
  }
};

const getStatusIcon = (status: ScanHistory["status"]) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "running":
      return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

interface ScheduleFormData {
  repository_name: string;
  repository_url: string;
  schedule_type: ScanSchedule["schedule_type"];
  schedule_time: string;
  schedule_day: number;
  scan_branches: string[];
  notify_on_complete: boolean;
  notify_on_critical: boolean;
}

const defaultFormData: ScheduleFormData = {
  repository_name: "",
  repository_url: "",
  schedule_type: "daily",
  schedule_time: "09:00",
  schedule_day: 1,
  scan_branches: ["main"],
  notify_on_complete: true,
  notify_on_critical: true,
};

export function ScheduledScanning() {
  const {
    schedules,
    history,
    isLoading,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
    triggerManualScan,
  } = useScanSchedules();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScanSchedule | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateOrUpdate = async () => {
    setIsSubmitting(true);
    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, formData);
      } else {
        await createSchedule({
          ...formData,
          enabled: true,
          last_scan_at: null,
          next_scan_at: null,
        });
      }
      setShowCreateDialog(false);
      setEditingSchedule(null);
      setFormData(defaultFormData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (schedule: ScanSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      repository_name: schedule.repository_name,
      repository_url: schedule.repository_url,
      schedule_type: schedule.schedule_type,
      schedule_time: schedule.schedule_time || "09:00",
      schedule_day: schedule.schedule_day || 1,
      scan_branches: schedule.scan_branches || ["main"],
      notify_on_complete: schedule.notify_on_complete,
      notify_on_critical: schedule.notify_on_critical,
    });
    setShowCreateDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      await deleteSchedule(id);
    }
  };

  const runningScans = history.filter((h) => h.status === "running");

  return (
    <div className="space-y-6">
      <Tabs defaultValue="schedules" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="schedules" className="gap-2">
              <Calendar className="h-4 w-4" />
              Schedules ({schedules.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              Scan History
            </TabsTrigger>
          </TabsList>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Schedule
          </Button>
        </div>

        <TabsContent value="schedules" className="space-y-4">
          {/* Running Scans Alert */}
          {runningScans.length > 0 && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  <div>
                    <p className="font-medium">
                      {runningScans.length} scan{runningScans.length > 1 ? "s" : ""} in progress
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {runningScans.map((s) => s.repository_name).join(", ")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : schedules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No schedules configured</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  Set up automated security scans to run on a schedule or when PRs are merged.
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Schedule
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id} className={cn(!schedule.enabled && "opacity-60")}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-lg",
                          schedule.enabled ? "bg-primary/10" : "bg-muted"
                        )}>
                          {getScheduleIcon(schedule.schedule_type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{schedule.repository_name}</h4>
                            <Badge variant={schedule.enabled ? "default" : "secondary"}>
                              {schedule.enabled ? "Active" : "Paused"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              {getScheduleIcon(schedule.schedule_type)}
                              {getScheduleLabel(schedule)}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitBranch className="h-3 w-3" />
                              {schedule.scan_branches?.join(", ") || "main"}
                            </span>
                          </div>
                          {schedule.last_scan_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Last scan: {formatDistanceToNow(new Date(schedule.last_scan_at), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={schedule.enabled}
                          onCheckedChange={(enabled) => toggleSchedule(schedule.id, enabled)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerManualScan(schedule)}
                          disabled={runningScans.some((r) => r.schedule_id === schedule.id)}
                        >
                          {runningScans.some((r) => r.schedule_id === schedule.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(schedule)}
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Scan History</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No scans have been run yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Repository</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Trigger</TableHead>
                        <TableHead>Findings</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Started</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((scan) => (
                        <TableRow key={scan.id}>
                          <TableCell className="font-medium">{scan.repository_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(scan.status)}
                              <span className="capitalize">{scan.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {scan.trigger_type.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {scan.status === "completed" ? (
                              <div className="flex items-center gap-2">
                                {scan.high_count > 0 && (
                                  <Badge variant="high" className="text-xs">
                                    {scan.high_count} High
                                  </Badge>
                                )}
                                {scan.medium_count > 0 && (
                                  <Badge variant="medium" className="text-xs">
                                    {scan.medium_count} Med
                                  </Badge>
                                )}
                                {scan.low_count > 0 && (
                                  <Badge variant="low" className="text-xs">
                                    {scan.low_count} Low
                                  </Badge>
                                )}
                                {scan.vulnerabilities_found === 0 && (
                                  <span className="text-green-500 text-sm">Clean</span>
                                )}
                              </div>
                            ) : scan.status === "failed" ? (
                              <span className="text-red-500 text-sm">{scan.error_message || "Error"}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {scan.duration_seconds ? `${scan.duration_seconds}s` : "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(scan.started_at), "MMM d, HH:mm")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        if (!open) {
          setEditingSchedule(null);
          setFormData(defaultFormData);
        }
        setShowCreateDialog(open);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? "Edit Schedule" : "Create Scan Schedule"}
            </DialogTitle>
            <DialogDescription>
              Configure automated security scans for your repository.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="repo-name">Repository Name</Label>
                <Input
                  id="repo-name"
                  placeholder="my-project"
                  value={formData.repository_name}
                  onChange={(e) => setFormData({ ...formData, repository_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repo-url">Repository URL</Label>
                <Input
                  id="repo-url"
                  placeholder="https://github.com/user/repo"
                  value={formData.repository_url}
                  onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Schedule Type</Label>
              <Select
                value={formData.schedule_type}
                onValueChange={(value: ScanSchedule["schedule_type"]) =>
                  setFormData({ ...formData, schedule_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Only</SelectItem>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="on_pr_merge">On PR Merge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.schedule_type === "daily" || formData.schedule_type === "weekly") && (
              <div className="grid grid-cols-2 gap-4">
                {formData.schedule_type === "weekly" && (
                  <div className="space-y-2">
                    <Label>Day of Week</Label>
                    <Select
                      value={String(formData.schedule_day)}
                      onValueChange={(value) =>
                        setFormData({ ...formData, schedule_day: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day, i) => (
                          <SelectItem key={i} value={String(i)}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="schedule-time">Time (UTC)</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={formData.schedule_time}
                    onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="branches">Branches (comma-separated)</Label>
              <Input
                id="branches"
                placeholder="main, develop"
                value={formData.scan_branches.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scan_branches: e.target.value.split(",").map((b) => b.trim()).filter(Boolean),
                  })
                }
              />
            </div>

            <div className="space-y-3">
              <Label>Notifications</Label>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm">Notify when scan completes</span>
                <Switch
                  checked={formData.notify_on_complete}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, notify_on_complete: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm">Alert on critical vulnerabilities</span>
                <Switch
                  checked={formData.notify_on_critical}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, notify_on_critical: checked })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrUpdate}
              disabled={!formData.repository_name || !formData.repository_url || isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingSchedule ? "Save Changes" : "Create Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
