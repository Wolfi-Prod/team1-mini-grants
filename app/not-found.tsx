import Link from "next/link";
import { Button } from "@/app/_components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[var(--color-bg)] px-6 py-20">
      <div className="flex w-full max-w-xl flex-col items-start gap-6 border border-[var(--color-border-muted)] bg-[var(--color-bg)] p-8">
        <p className="text-[10px] font-bold uppercase tracking-widest">Error 404</p>
        <h1 className="text-5xl font-black uppercase tracking-tight md:text-7xl">
          Page not found
        </h1>
        <p className="text-sm leading-relaxed text-[var(--color-fg-muted)]">
          The page you&apos;re looking for doesn&apos;t exist yet, has been moved, or is still on
          the build list. Check the URL or head back to one of the pages below.
        </p>
        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-border-muted)] pt-6">
          <Link href="/">
            <Button variant="primary">Back to home</Button>
          </Link>
          <Link href="/discover">
            <Button variant="secondary">Browse grants</Button>
          </Link>
          <Link href="/showcase">
            <Button variant="secondary">Browse projects</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
