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

// Friendly name for greetings.
export function getFirstName(user: User | null): string {
  const fullName = getLearnerName(user);

  // Names saved as "Last, First M." keep the part after the comma
  const givenNames = fullName.includes(",") ? fullName.split(",")[1] : fullName;

  // Drop a trailing middle initial like "G." or "G"
  const cleaned = givenNames.replace(/\s+[A-Za-z]\.?$/, "").trim();

  return cleaned || fullName;
}