import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { safeStorage } from "./safeStorage";

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    storage: safeStorage,
    persistSession: true,
    detectSessionInUrl: true,
  }
});

export interface Challenge {
  id: string;
  category: string;
  difficulty: string;
  target_output: string;
  ideal_prompt?: string;
  char_count: number;
  active: boolean;
  skill?: string;
  impactLesson?: string;
}
