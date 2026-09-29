export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** 0..5 : longueur ≥ 8, majuscule, minuscule, chiffre, symbole. */
export function passwordScore(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

/** Règle affichée à l'utilisateur : 8 caractères minimum et au moins 3 critères sur 5. */
export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && passwordScore(password) >= 3;
}
