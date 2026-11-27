export const signupGenders = {
  woman: "Woman",
  man: "Man",
  non_binary: "Non-binary",
  another_identity: "Another identity",
  prefer_not_to_say: "Prefer not to say",
} as const;

export function validateSignupProfile(body: Record<string, unknown>) {
  if (body.age_confirmed !== true) {
    return { ok: false as const, message: "Confirm that you're 18 or older to create an account." };
  }

  const gender = body.gender;
  if (gender == null || gender === "" || gender === "prefer_not_to_say") {
    return { ok: true as const, data: { age_confirmed: true } };
  }
  if (typeof gender !== "string" || !Object.hasOwn(signupGenders, gender)) {
    return { ok: false as const, message: "Choose a gender from the list or leave it blank." };
  }

  return { ok: true as const, data: { age_confirmed: true, gender } };
}
