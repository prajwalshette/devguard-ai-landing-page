import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RepositoryList } from "@/components/dashboard/RepositoryList";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your code security across all repositories</p>
        </div>

        <div className="space-y-8">
          <DashboardStats />

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <RepositoryList />
            </div>
            <div className="lg:col-span-2">
              <RecentActivity />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
