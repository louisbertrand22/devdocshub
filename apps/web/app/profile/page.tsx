
import { PageWrapper } from "@/components/layout/PageWrapper";
import Profile from "@/components/profile";

export default function ProfilePage() {
  return (
    <PageWrapper
      title="Mon Profil"
      description="Gérez vos informations personnelles"
      className="page-wrapper--compact"
    >
      <Profile />
    </PageWrapper>
  );
}
