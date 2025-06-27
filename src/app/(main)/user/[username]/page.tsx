import { notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';
import GradientBackground from "~/components/layout/gradient-background";
import UserProfileWrapper from "./_components/user-profile-wrapper";

interface UserProfilePageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata({ params }: UserProfilePageProps) {
  const decodedUsername = decodeURIComponent(params.username);
  
  return {
    title: `${decodedUsername} - User Profile | Grow a Garden Trading Hub`,
    description: `View ${decodedUsername}'s trading profile, trade history, and reputation on our Grow a Garden trading platform.`,
  };
}

async function UserProfilePage({ params }: UserProfilePageProps) {
  const t = await getTranslations('userProfile');
  const decodedUsername = decodeURIComponent(params.username);

  return (
    <GradientBackground still>
      <div className="min-h-screen pt-[72px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-pulse-slow absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-[#9747FF]/10 to-[#7E3BFF]/10 blur-3xl" />
          <div
            className="animate-pulse-slow absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-gradient-to-r from-[#7E3BFF]/10 to-[#9747FF]/10 blur-3xl"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10 h-full">
          <div className="container mx-auto h-full max-w-7xl px-4 py-16">
            <UserProfileWrapper username={decodedUsername} />
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}

export default UserProfilePage;