export type GenerationStep =
  | "idle"
  | "research"
  | "product"
  | "website"
  | "marketing"
  | "critic"
  | "complete"
  | "error";

export type StepResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
