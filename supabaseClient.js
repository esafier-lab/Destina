import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(
  "https://obzdtioqfssfyufqichh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iemR0aW9xZnNzZnl1ZnFpY2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MjY1MTcsImV4cCI6MjA4MzMwMjUxN30.wUbEMyoSkk_TvlHHVCFdBBOBRNi1-s5q0g_2It0dKcE"
);
