import { ChatPageClient } from "../_components/chat-page-client";
import { convexClient, getServerSession } from '~/lib/auth';
import { redirect } from "next/navigation";
import type { Id } from "~convex/_generated/dataModel";
import { api } from '~convex/_generated/api';

export default async function ChatPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const {id} = await params;
  
  const sessionData = await getServerSession();
  if (sessionData.error || !sessionData.data?.session) {
    redirect("/login");
  }

  if (!id) {
    redirect("/chat");
  }

  const sessionId = sessionData.data.session._id as Id<"session">;
  const userId = sessionData.data.session.userId as Id<"user">;

  // Check if chat exists and user has access
  let isAllowed = false;
  let initialChatData = null;
  
  try {
    isAllowed = await convexClient.query(api.chats.isAllowedToViewChat, {
      chatId: id as Id<"chats">,
      userId,
    });

    if (isAllowed) {
      // Get initial chat data to pass trade status
      initialChatData = await convexClient.query(api.chats.getChatById, {
        chatId: id as Id<"chats">,
        session: sessionId,
      });
    }
  } catch (error) {
    // Chat doesn't exist or other error occurred
    console.error("Error accessing chat:", error);
    redirect("/chat");
  }

  if (!isAllowed || !initialChatData) {
    redirect("/chat");
  }

  // Get current user info for ChatInput
  const currentUser = await convexClient.query(api.user.getPublicUserProfile, {
    userId,
  });

  if (!currentUser) {
    redirect("/login");
  }
  
  return (
    <ChatPageClient
      chatId={id}
      sessionId={sessionId}
      currentUserId={userId}
      currentUserName={currentUser.name ?? "Unknown User"}
      currentUserAvatar={currentUser.robloxAvatarUrl ?? undefined}
      currentUserRoles={currentUser.roles ?? []}
      initialTradeStatus={initialChatData.tradeStatus}
    />
  );
}