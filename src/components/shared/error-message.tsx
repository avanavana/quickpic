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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 shrink-0"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
        <path d="M12 9v4"/>
        <path d="M12 17h.01"/>
      </svg>
      {error}
    </p>
  );
}