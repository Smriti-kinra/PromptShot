import { createClient } from "@supabase/supabase-js";
export { projectId, publicAnonKey } from "../../utils/supabase/info";
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
  ideal_water_ml?: number;   // NEW
  ideal_co2_grams?: number;  // NEW
  char_count: number;
  active: boolean;
  skill?: string;
  impactLesson?: string;
}
