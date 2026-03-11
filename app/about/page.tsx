import { FadeIn } from "@/components/ui/fade-in";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <FadeIn className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--color-primary)]">
          About
        </p>
        <h1 className="font-display text-[3rem] leading-none text-[var(--color-text)] sm:text-[3.75rem] md:text-6xl">
          Spendora
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-[color:rgba(43,43,43,0.68)] md:text-base">
          A simple note about the app, the idea behind it, and the person building it.
        </p>
      </FadeIn>

      <FadeIn delay={0.08}>
        <section className="rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(139,94,60,0.08)] backdrop-blur md:p-8">
          <div className="space-y-5 text-sm leading-7 text-[color:rgba(43,43,43,0.68)] md:text-base">
            <p>
              Spendora is an offline-first expense tracker designed around clarity,
              rhythm, and low-friction daily use. The goal is not to overwhelm you with
              finance jargon, but to help you understand spending patterns in a softer,
              more usable way.
            </p>
            <p>
              Your entries stay on your device, reports can be printed or saved, and the
              overall experience is intentionally simple enough to feel calm instead of
              demanding.
            </p>
            <p>
              Spendora is created by Melissa Marcelo, with the idea that an expense
              tracker can feel practical, calm, and personal at the same time.
            </p>
            <p>
              If you have suggestions, recommendations, or ideas that could make the
              app better, feel free to reach out. And if you are interested in working
              with me, you can email me at{" "}
              <a
                href="mailto:mmarcelo.maxwell@gmail.com"
                className="font-medium text-[var(--color-primary)] underline decoration-[rgba(63,143,104,0.28)] underline-offset-4"
              >
                mmarcelo.maxwell@gmail.com
              </a>
              .
            </p>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
