import type { PostgrestError } from "@supabase/supabase-js"

export function handleSupabaseError(
  error: PostgrestError | null | unknown,
  defaultMessage = "An error occurred",
): string {
  if (!error) return defaultMessage

  if (typeof error === "object" && error !== null && "code" in error && "message" in error) {
    const pgError = error as PostgrestError

    // Handle specific error codes
    switch (pgError.code) {
      case "23505": // Unique violation
        return "This record already exists"
      case "23503": // Foreign key violation
        return "This operation would break a relationship with another record"
      case "42P01": // Undefined table
        return "The requested resource does not exist"
      case "42703": // Undefined column
        return "Invalid field requested"
      case "28P01": // Invalid password
        return "Invalid credentials"
      case "3D000": // Invalid catalog name
        return "Database does not exist"
      case "3F000": // Invalid schema name
        return "Schema does not exist"
      default:
        return pgError.message || defaultMessage
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return defaultMessage
}

export function logError(error: unknown, context: string): void {
  console.error(`Error in ${context}:`, error)

  // In a production app, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
}

