import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://oicbkwytscoepgkxsyrq.supabase.co";
const supabaseAnonKey = "sb_publishable_OGUr_ffp2lLs_fltoPCX4Q_0MY6ysgj";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);