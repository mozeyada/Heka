export type GoalProgress = {
  date: string;
  notes?: string | null;
  progress_value?: number | null;
};

export type Goal = {
  id: string;
  couple_id?: string;
  title: string;
  description: string | null;
  status: string;
  target_date: string | null;
  created_at: string;
  updated_at?: string;
  completed_at?: string | null;
  progress_updates?: number;
  progress?: GoalProgress[];
  created_by_user_id?: string;
  current_user_has_progress?: boolean;
  partner_has_progress?: boolean;
  latest_progress_id?: string | null;
  latest_progress_by_user_id?: string | null;
  latest_progress_at?: string | null;
  latest_progress_note?: string | null;
  latest_progress_value?: number | null;
  latest_progress_acknowledged_by_current_user?: boolean;
  needs_user_progress?: boolean;
  archived_for_current_user?: boolean;
  next_action_type?: string;
  next_action_title?: string;
  next_action_description?: string;
  momentum_state?: string;
};

export type GoalDetail = Goal & { progress: GoalProgress[] };
