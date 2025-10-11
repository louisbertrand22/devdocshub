
import { PageWrapper } from "@/components/layout/PageWrapper";
import Dashboard from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <PageWrapper
      title="Tableau de bord"
      description="Vue d'ensemble de votre activité DevDocs Hub"
      className="page-wrapper--compact"
    >
      <Dashboard />
    </PageWrapper>
  );
}