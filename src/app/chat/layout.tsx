import { redirect } from "next/navigation";
import { ChatLayout } from "./_components/chat-layout";
import type { Id } from "~convex/_generated/dataModel";
import { getServerSession } from "~/lib/auth";

interface ChatLayoutProps {
  children: React.ReactNode;
}

// This is now an async Server Component! No "use client" here.
export default async function Layout({ children }: ChatLayoutProps) {
  const sessionData = await getServerSession();
  
  if (sessionData.error || !sessionData.data?.session) {
    redirect("/login");
  }

  const sessionId = sessionData.data.session._id as Id<"session">;
  const userId = sessionData.data.session.userId as Id<"user">;

  // 3. Render a Client Component and pass the necessary data as props
  return (
    <ChatLayout sessionId={sessionId} userId={userId}>
      {children}
    </ChatLayout>
  );
}
