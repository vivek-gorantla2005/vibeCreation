"use server";
import { inngest } from "@/inngest/client";
import { userChannel } from "@/inngest/functions";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";

export type UserChannelToken = Realtime.Token<typeof userChannel, ["projectInfo"]>;

export async function fetchRealtimeSubscriptionToken(projectId: string): Promise<UserChannelToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: userChannel(projectId),
    topics: ["projectInfo"] as const,
  });

  return token;
}