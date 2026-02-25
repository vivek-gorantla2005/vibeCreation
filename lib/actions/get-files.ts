"use server"
import { getApiClient } from "../api-client";
import { headers } from "next/headers";

export const getFiles = async ({ projectId }: { projectId: string }) => {
    const requestHeaders = await headers();
    const apiClient = getApiClient(requestHeaders);
    const { data, error } = await apiClient.fragments.get({ query: { projectId } })

    if (error) {
        console.error('[getFiles action] error:', error)
        throw error
    }
    return data
}