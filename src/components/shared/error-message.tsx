import { WarningIcon } from "@/components/shared/icons";

interface ErrorMessageProps {
  error: string; 
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <p
      id="error-message"
      role="alert"
      aria-live="assertive"
      className="flex gap-2 items-center px-4 py-2 rounded-lg bg-red-500/10 text-red-500"
    >
      <WarningIcon />
      {error}
    </p>
  );
}