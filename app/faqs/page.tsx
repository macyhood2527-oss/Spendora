import { FadeIn } from "@/components/ui/fade-in";

const faqs = [
  {
    question: "How do I start using Spendora?",
    answer:
      "A simple flow is: add an expense first, choose a category, include the merchant if you want cleaner tracking, then return to the Dashboard to see the month take shape. After that, you can use Expenses to review your entries, Insights to read patterns and reports, and Settings to adjust your budget, currency, and categories.",
  },
  {
    question: "What should I expect in the Dashboard?",
    answer:
      "The Dashboard is your quick monthly snapshot. It shows your greeting based on local time, monthly budget progress, summary cards, category breakdown, budget watch, recent expenses, and small wins when the app notices something positive like staying under budget or logging consistently.",
  },
  {
    question: "What is the Insights page for?",
    answer:
      "Insights is where the app becomes more reflective. It explains spending trends in plain language, shows rhythm and momentum across your entries, and gives you a monthly report that you can copy, print, or save as PDF. Think of Dashboard as the snapshot, and Insights as the interpretation.",
  },
  {
    question: "What can I do in the Expenses page?",
    answer:
      "Expenses is your full timeline. You can search by merchant, note, or category, filter by date, sort the list, edit existing entries, and delete entries you no longer want. It is the place to clean up or review the details behind what you see on Dashboard and Insights.",
  },
  {
    question: "What can I change in Settings?",
    answer:
      "Settings lets you adjust the monthly budget, category budgets, currency, and category list. If the Dashboard or Insights feel incomplete, this is usually where you set the structure that helps the rest of the app become more meaningful.",
  },
  {
    question: "Does Spendora store my data online?",
    answer:
      "No. Spendora is currently offline-first, so your expenses, categories, and settings stay on your device.",
  },
  {
    question: "Can I export my reports?",
    answer:
      "Yes. The Insights page includes a monthly report that you can copy, print, or save as PDF.",
  },
  {
    question: "Can I edit categories and budgets?",
    answer:
      "Yes. Category management, currency, and budget settings are available in the Settings page, and changes there will immediately affect how the rest of the app calculates summaries and reports.",
  },
  {
    question: "Does it support accounts or sync?",
    answer:
      "Not right now. The app is intentionally lightweight and local-first, which keeps it simple and fast.",
  },
] as const;

export default function FaqsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <FadeIn className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--color-primary)]">
          FAQs
        </p>
        <h1 className="font-display text-[3rem] leading-none text-[var(--color-text)] sm:text-[3.75rem] md:text-6xl">
          A few quick answers
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-[color:rgba(43,43,43,0.68)] md:text-base">
          The basics, without turning this into a heavy support page.
        </p>
      </FadeIn>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <FadeIn key={faq.question} delay={0.05 * (index + 1)}>
            <section className="rounded-[26px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_45px_rgba(139,94,60,0.08)] backdrop-blur md:p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                {faq.question}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[color:rgba(43,43,43,0.66)] md:text-base">
                {faq.answer}
              </p>
            </section>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
