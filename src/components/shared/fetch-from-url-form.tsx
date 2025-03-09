import { LinkIcon } from "@/components/shared/icons";

function Spinner() {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label="Loading…"
      className="inline-block w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full [animation:spin_1s_linear_infinite]"
    />
  )
}

type FetchFromUrlFormProps = {
  accept: ".svg" | "image/svg+xml" | "image/*" | ".jpg" | ".jpeg" | ".png" | ".webp";
  error: string | null;
  handleSubmit: (payload: FormData) => void;
  pending: boolean;
}

export function FetchFromUrlForm({ accept, error, handleSubmit, pending }: FetchFromUrlFormProps) {
  return (
    <div className='flex flex-col items-center gap-4 w-full sm:w-container max-w-container'>
      <form action={handleSubmit} className="flex items-center gap-2 w-full" autoComplete="off" noValidate>
        <div className='group relative grow min-w-0'>
          <input
            type="text"
            name="url"
            placeholder="https://"
            className="min-w-0 w-full py-2 pr-3 pl-9 h-10 font-medium text-sm rounded-lg bg-white/5 text-gray-500 group-focus-within:text-white group-hover:text-white placeholder:text-gray-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-none disabled:cursor-not-allowed disabled:opacity-50"
            autoComplete="off"
            required
            {...(error && {
              'aria-invalid': true,
              'aria-errormessage': 'error-message',
              'aria-describedby': 'error-message'
            })}
          />
          <LinkIcon className="absolute left-2 top-2.5 size-5 text-gray-500" />
        </div>
        <input type="hidden" name="accept" value={accept} />
        <button
          type='submit'
          disabled={pending}
          className="flex justify-center items-center gap-2 rounded-lg bg-blue-600 h-10 px-4 py-2 font-semibold text-white shadow-md whitespace-nowrap transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
        >
          {pending ? <Spinner /> : "or, use URL"}
        </button>
      </form>
    </div>
  )
}