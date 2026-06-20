"use client";

// Minimal functional error boundary (plain styling — refined in the UI pass).
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-5 py-20 text-center">
      <h1 className="text-xl font-bold text-stone-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-stone-600">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Try again
      </button>
    </div>
  );
}
