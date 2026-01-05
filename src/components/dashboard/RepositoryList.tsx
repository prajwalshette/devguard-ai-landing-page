import { RepositoryCard } from "./RepositoryCard";

const mockRepositories = [
  {
    id: "1",
    name: "api-gateway",
    owner: "acme-corp",
    prsScanned: 47,
    vulnerabilities: { high: 2, medium: 5, low: 12 },
  },
  {
    id: "2",
    name: "auth-service",
    owner: "acme-corp",
    prsScanned: 23,
    vulnerabilities: { high: 0, medium: 2, low: 4 },
  },
  {
    id: "3",
    name: "web-client",
    owner: "acme-corp",
    prsScanned: 89,
    vulnerabilities: { high: 1, medium: 0, low: 8 },
  },
  {
    id: "4",
    name: "infra-terraform",
    owner: "acme-corp",
    prsScanned: 12,
    vulnerabilities: { high: 0, medium: 0, low: 0 },
  },
  {
    id: "5",
    name: "ml-pipeline",
    owner: "acme-corp",
    prsScanned: 31,
    vulnerabilities: { high: 3, medium: 7, low: 2 },
  },
];

export function RepositoryList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Connected Repositories</h2>
          <p className="text-sm text-muted-foreground">{mockRepositories.length} repositories monitored</p>
        </div>
      </div>

      <div className="grid gap-3">
        {mockRepositories.map((repo, index) => (
          <div
            key={repo.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
          >
            <RepositoryCard repo={repo} />
          </div>
        ))}
      </div>
    </div>
  );
}
