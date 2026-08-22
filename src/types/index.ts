// ==========================================
// Database Types
// ==========================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  estimated_level: string | null;
  role: "admin" | "student";
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string | null;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | null;
  message: string;
  is_read: boolean;
  is_replied: boolean;
  created_at: string;
}

export interface Exercise {
  id: string;
  title: string;
  level: "A1-A2" | "B1-B2" | "C1";
  category: string;
  file_url: string;
  file_name: string | null;
  created_at: string;
}

export interface DailyWord {
  id: string;
  word: string;
  pronunciation: string | null;
  meaning: string;
  example_sentence: string | null;
  level?: string;
  created_at: string;
}

export interface QuizResult {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  score: number;
  total_questions: number;
  estimated_level: string | null;
  created_at: string;
}

export interface UserSavedWord {
  id: string;
  user_id: string;
  word: string;
  pronunciation: string | null;
  meaning: string;
  example_sentence: string | null;
  created_at: string;
}

// ==========================================
// Quiz Types
// ==========================================

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
}

export interface PlacementQuestion {
  id: number;
  question_text: string;
  options: string[];
  correct_option: number;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  created_at: string;
}

// ==========================================
// Form Types
// ==========================================

export interface ContactFormData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  level: string;
  message: string;
}

// ==========================================
// Service Card Types
// ==========================================

export interface ServiceItem {
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export interface Testimonial {
  name: string;
  level: string;
  comment: string;
  avatar: string;
}
