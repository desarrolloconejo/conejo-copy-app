import { TRPCClientError } from "@trpc/client";

type ValidationData = {
  fieldErrors?: Record<string, string[] | undefined> | null;
  formErrors?: string[] | null;
};

/**
 * Turns anything thrown by a procedure into one sentence worth showing.
 *
 * Validation failures arrive with `fieldErrors` attached by the server's error
 * formatter; without reading those, the raw `message` of a rejected input is
 * the stringified list of Zod issues, which is not something to put in front of
 * a person. Anything unexpected falls back to the caller's own wording.
 */
export function describeError(caught: unknown, fallback: string): string {
  if (!(caught instanceof TRPCClientError)) return fallback;

  const data = caught.data as ValidationData | undefined;

  const fieldMessage = Object.values(data?.fieldErrors ?? {})
    .flatMap(messages => messages ?? [])
    .find(message => message.trim().length > 0);
  if (fieldMessage) return fieldMessage;

  const formMessage = (data?.formErrors ?? []).find(
    message => message.trim().length > 0
  );
  if (formMessage) return formMessage;

  // A message that still looks like serialised issues is not presentable.
  const message = caught.message?.trim();
  if (!message || message.startsWith("[") || message.startsWith("{")) return fallback;

  return message;
}
