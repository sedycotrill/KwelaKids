import type { User } from "@supabase/supabase-js";

// Get the current user's display name
export function getLearnerName(user: User | null): string {
  if (!user) return "Learner";

  const metadata = user.user_metadata ?? {};
  const possibleNames = [metadata.display_name, metadata.full_name, metadata.name];

  for (const name of possibleNames) {
    if (typeof name === "string" && name.trim()) return name.trim();
  }

  // Fallback to the email username
  const emailName = user.email?.split("@")[0];
  if (emailName) {
    return emailName
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  return "Learner";
}