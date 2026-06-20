import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-5 py-20 text-center">
      <h1 className="text-xl font-bold text-stone-900">Page not found</h1>
      <p className="mt-2 text-sm text-stone-600">That page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-5 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Go home
      </Link>
    </div>
  );
}
