import { apiClient } from "../api-client";

export const getFiles = async ({ projectId }: { projectId: string }) => {
    const { data, error } = await apiClient.fragments.get({ query: { projectId } })
    console.log(data)
    if (error) {
        throw error
    }
    return data
}