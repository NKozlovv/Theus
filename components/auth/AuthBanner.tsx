const TONE_CLASS = {
  ok: 'bg-teal/[0.18] text-in',
  info: 'bg-indigo/[0.14] text-indigo-dark',
  err: 'bg-coral/[0.18] text-out',
} as const;

/** Single status banner shared by the auth forms — success, neutral info, or error. */
export function AuthBanner({
  tone,
  children,
}: {
  tone: keyof typeof TONE_CLASS;
  children: React.ReactNode;
}) {
  return (
    <div className={`mb-5 flex items-start gap-3 rounded-[16px] px-4 py-3 text-[14px] font-semibold leading-relaxed ${TONE_CLASS[tone]}`}>
      <span className="mt-0.5 shrink-0" aria-hidden>
        {tone === 'err' ? '!' : '✓'}
      </span>
      <span>{children}</span>
    </div>
  );
}
