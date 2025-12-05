import { api } from "./client";

export async function exportUserData(): Promise<{
  success: boolean;
  data: any;
  format: string;
  downloadable: boolean;
}> {
  const response = await api.get("/api/users/me/export");
  return response.data;
}

export async function deleteAccount(
  confirmation: string,
): Promise<{ success: boolean; message: string; note?: string }> {
  const response = await api.delete("/api/users/me/account", {
    params: { confirmation },
  });
  return response.data;
}
