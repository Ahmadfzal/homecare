import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://ebpleqdvkfvqgeffmnni.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVicGxlcWR2a2Z2cWdlZmZtbm5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDAyODcsImV4cCI6MjA4NzE3NjI4N30.Sv95AJ4I4G5eQmSoH4LykG9utI3i_Qvrc9lLjPm4J9Y"
);