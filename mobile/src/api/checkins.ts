import { api } from "./client";

export type Checkin = {
  id: string;
  couple_id?: string;
  week_start_date: string;
  status: string;
  journey_state?: string;
  completed_at: string | null;
  responses: Record<string, string> | null;
  partner_responses?: Record<string, string> | null;
  completed_by?: string[];
  current_user_completed?: boolean;
  partner_completed?: boolean;
  needs_user_response?: boolean;
  awaiting_response_from_user_id?: string | null;
  next_step_title?: string;
  next_step_description?: string;
  focus_summary?: string | null;
  open_argument_count?: number;
  active_goal_count?: number;
  ai_harmony_report?: string | null;
  created_at?: string;
};

export type CheckinHistoryItem = Omit<Checkin, "responses">;

export type CheckinHistoryResponse = {
  checkins: CheckinHistoryItem[];
  next_offset: number | null;
};

export async function fetchCheckinHistory(params?: {
  limit?: number;
  offset?: number;
}): Promise<CheckinHistoryResponse> {
  const response = await api.get<CheckinHistoryResponse>(
    "/api/checkins/history",
    {
      params,
    },
  );
  return response.data;
}

export async function getCurrentCheckin(): Promise<Checkin> {
  const response = await api.get<Checkin>("/api/checkins/current");
  return response.data;
}

export async function completeCheckin(
  responses: Record<string, string>,
): Promise<Checkin> {
  const response = await api.post<Checkin>("/api/checkins/current/complete", {
    responses,
  });
  return response.data;
}
