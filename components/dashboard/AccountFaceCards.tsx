import Link from 'next/link';
import { fmtCurrency } from '@/lib/money';

export interface AccountFaceData {
  id: string;
  name: string;
  currency: string;
  native: number;
}

// Four card stocks from the app's own palette: coral, pearl, navy, teal.
const FACE_PRESETS = [
  { gradient: 'linear-gradient(135deg,#f9a8bd,#f2708f 55%,#e0517a)', ink: '#ffffff', inkMute: 'rgba(255,255,255,.88)' },
  { gradient: 'linear-gradient(135deg,#e6eaf6,#c3cbe2 55%,#a4afcf)', ink: '#1f2742', inkMute: 'rgba(31,39,66,.7)' },
  { gradient: 'linear-gradient(135deg,#2c3757,#1f2742 60%,#151a2d)', ink: '#ffffff', inkMute: 'rgba(255,255,255,.72)' },
  { gradient: 'linear-gradient(135deg,#7fe3d4,#1fb9a4 55%,#0f8f7d)', ink: '#ffffff', inkMute: 'rgba(255,255,255,.88)' },
] as const;

function faceFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return FACE_PRESETS[Math.abs(h) % FACE_PRESETS.length]!;
}

/** Contactless mark: three arcs. Drawn, not an emoji or a stock icon. */
function Contactless({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M8.5 8.5a5 5 0 0 1 0 7" />
      <path d="M12 6a8.5 8.5 0 0 1 0 12" />
      <path d="M15.5 3.5a12 12 0 0 1 0 17" />
    </svg>
  );
}

/**
 * Account cards — the third block of the Overview, and its one physical
 * object. Card faces are sized to real plastic (ISO/IEC 7810 ID-1 ratio)
 * with the details that make plastic read as plastic: a chip, a contactless
 * mark, a soft diagonal sheen and a lit top edge. The masked-number line is
 * the account's real currency (this app has no card numbers). Shows the 4
 * biggest accounts by EUR balance; each links through to /accounts.
 *
 * Nesting: 32px panel, 16px padding, 16px card face.
 */
export function AccountFaceCards({ accounts }: { accounts: AccountFaceData[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(192px,1fr))] gap-6">
      {accounts.map((a) => {
        const face = faceFor(a.id);
        return (
          <Link href="/accounts" key={a.id} className="glass flex flex-col p-4 pb-5">
            <div
              className="relative flex flex-col justify-between overflow-hidden p-4"
              style={{
                boxSizing: 'border-box',
                aspectRatio: '1.586',
                borderRadius: 16,
                background: face.gradient,
                boxShadow: '0 14px 28px -10px rgba(31,39,66,.35), inset 0 1px 0 rgba(255,255,255,.55)',
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: 'linear-gradient(115deg, rgba(255,255,255,.34) 0%, rgba(255,255,255,0) 42%)' }}
              />
              <div className="relative flex items-start justify-between">
                <span
                  aria-hidden
                  className="block h-[20px] w-[28px] rounded-[5px]"
                  style={{
                    background: 'linear-gradient(135deg,#f6e3a8,#d9b868 55%,#b8923f)',
                    boxShadow: 'inset 0 0 0 1px rgba(80,55,10,.25), inset 0 1px 0 rgba(255,255,255,.5)',
                  }}
                />
                <span className="text-[12px] font-bold tabular-nums" style={{ color: face.inkMute }}>
                  {a.currency}
                </span>
              </div>
              <div className="relative flex items-end justify-between gap-2">
                <span className="min-w-0 flex-1 truncate text-[15px] font-bold" style={{ color: face.ink }}>
                  {a.name}
                </span>
                <Contactless color={face.inkMute} />
              </div>
            </div>

            <div className="px-2 pt-4">
              <div className="t-label">Balance</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[26px] font-extrabold -tracking-[0.02em] tabular-nums text-ink">
                  {fmtCurrency(a.native, a.currency, { noSymbol: true, decimals: 0 })}
                </span>
                <span className="text-[14px] font-bold text-ink-mute">{a.currency}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
