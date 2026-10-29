export type PasswordStrength = "débil" | "medio" | "seguro" | "muy seguro";

export interface PasswordEvaluation {
  strength: PasswordStrength;
  isValid: boolean;
  hasMinimumLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
}

export function evaluatePassword(password: string): PasswordEvaluation {
  const hasMinimumLength = password.length >= 9;
  const hasUppercase = /[A-ZÁÉÍÓÚÑ]/.test(password);
  const hasNumber = /\d/.test(password);
  const isValid = hasMinimumLength && hasUppercase && hasNumber;
  const hasSpecialCharacter = /[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9]/.test(password);

  let strength: PasswordStrength = "débil";
  if (isValid && password.length >= 14 && hasSpecialCharacter) {
    strength = "muy seguro";
  } else if (isValid && password.length >= 12) {
    strength = "seguro";
  } else if (isValid) {
    strength = "medio";
  }

  return { strength, isValid, hasMinimumLength, hasUppercase, hasNumber };
}
