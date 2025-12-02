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
};

export type GoalDetail = Goal & {
  progress: GoalProgress[];
  created_by_user_id?: string;
};
