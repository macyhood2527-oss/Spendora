import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <FadeIn className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--color-primary)]">
          Offline
        </p>
        <h1 className="font-display text-[3rem] leading-none text-[var(--color-text)] sm:text-[3.75rem] md:text-6xl">
          You are offline right now
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-[color:rgba(43,43,43,0.68)] md:text-base">
          Spendora can still work with your cached pages and local data, but this page
          appears when the browser cannot reach a route that has not been cached yet.
        </p>
      </FadeIn>

      <FadeIn delay={0.08}>
        <section className="rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(139,94,60,0.08)] backdrop-blur md:p-8">
          <div className="space-y-4 text-sm leading-7 text-[color:rgba(43,43,43,0.66)] md:text-base">
            <p>
              If you already opened the Dashboard, Expenses, or Insights while online,
              those pages should keep working offline from cache together with your
              locally stored expense history.
            </p>
            <p>
              When your connection returns, you can continue as usual or go back to the{" "}
              <Link
                href="/"
                className="font-medium text-[var(--color-primary)] underline decoration-[rgba(63,143,104,0.28)] underline-offset-4"
              >
                dashboard
              </Link>
              .
            </p>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
