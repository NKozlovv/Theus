/**
 * Standard page header inside the (app) shell: a title that names the page
 * or the period, an optional line of context, page actions at the right.
 */
export function PageHeader({
  title,
  meta,
  actions,
}: {
  title: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div className="min-w-0">
        <h1 className="text-[32px] font-medium leading-[1.15] tracking-[-0.02em] text-ink">{title}</h1>
        {meta ? <p className="mt-2 max-w-[60ch] text-[14px] leading-5 text-ink-soft">{meta}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
