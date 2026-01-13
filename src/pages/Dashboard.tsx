import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RepositoryList } from "@/components/dashboard/RepositoryList";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { LiveThreatIndicator } from "@/components/dashboard/LiveThreatIndicator";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { TeamActivityFeed } from "@/components/dashboard/TeamActivityFeed";
import { DependencyGraph } from "@/components/dashboard/DependencyGraph";
import { SecurityTimeline } from "@/components/dashboard/SecurityTimeline";
import { SecurityRecommendations } from "@/components/dashboard/SecurityRecommendations";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm text-green-400 font-medium">Live</span>
          </div>
          <p className="text-muted-foreground">
            Real-time security monitoring across all repositories
          </p>
        </div>

        <div className="space-y-8">
          {/* Top Row: Stats */}
          <DashboardStats />

          {/* Second Row: Threat Indicator + Quick Actions */}
          <div className="grid lg:grid-cols-2 gap-6">
            <LiveThreatIndicator />
            <QuickActionsPanel />
          </div>

          {/* Third Row: Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column: Repositories */}
            <div className="lg:col-span-2">
              <RepositoryList />
            </div>
            {/* Right Column: Timeline */}
            <div>
              <SecurityTimeline />
            </div>
          </div>

          {/* Fourth Row: Dependencies + Team Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            <DependencyGraph />
            <TeamActivityFeed />
          </div>

          {/* AI Recommendations */}
          <SecurityRecommendations />

          {/* Bottom Row: Recent Activity */}
          <RecentActivity />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
