export interface CommunityEvent {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  date: string;
  location?: string;
  link?: string;
  created_at: string;
}
