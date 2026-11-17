import Link from 'next/link';
import { fmtCurrency } from '@/lib/money';

export interface AccountFaceData {
  id: string;
  name: string;
  currency: string;
  native: number;
}

// Four card stocks in ledger inks. Each is a single hue with a small tone
// shift (no hue-to-hue gradient), like printed card stock under light.
const FACE_PRESETS = [
  { face: 'linear-gradient(145deg,#3a50c8,#2a3d9e)', ink: '#ffffff', inkMute: 'rgba(255,255,255,.72)' },
  { face: 'linear-gradient(145deg,#34343a,#1f1f23)', ink: '#ffffff', inkMute: 'rgba(255,255,255,.68)' },
  { face: 'linear-gradient(145deg,#2f7a70,#225c54)', ink: '#ffffff', inkMute: 'rgba(255,255,255,.74)' },
  { face: 'linear-gradient(145deg,#ece8de,#dcd7c9)', ink: '#1f1f23', inkMute: 'rgba(31,31,35,.62)' },
] as const;

function faceFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return FACE_PRESETS[Math.abs(h) % FACE_PRESETS.length]!;
}

/**
 * Account cards — third block of the Overview. Card faces are sized to real
 * plastic (ISO/IEC 7810 ID-1 ratio) with a chip, a currency and the
 * account name: the one physical object on the screen, built in code. This
 * app has no card numbers, so the face shows the account's real currency
 * instead of a fabricated number. Shows the 4 biggest accounts by EUR
 * balance. Each card links through to /accounts.
 */
export function AccountFaceCards({ accounts }: { accounts: AccountFaceData[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(196px,1fr))] gap-4">
      {accounts.map((a) => {
        const face = faceFor(a.id);
        return (
          <Link
            href="/accounts"
            key={a.id}
            className="glass flex flex-col p-3 transition-colors duration-150 hover:bg-raised"
          >
            <div
              className="relative flex flex-col justify-between overflow-hidden p-4"
              style={{
                boxSizing: 'border-box',
                aspectRatio: '1.586',
                borderRadius: 12,
                background: face.face,
                boxShadow: '0 6px 14px -6px rgba(23,23,23,.4), inset 0 1px 0 rgba(255,255,255,.18)',
              }}
            >
              <div className="flex items-start justify-between">
                <span
                  aria-hidden
                  className="block h-[20px] w-[28px] rounded-[4px]"
                  style={{
                    background: 'linear-gradient(135deg,#dcc48f,#b99a5b)',
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)',
                  }}
                />
                <span className="text-[12px] font-medium tabular-nums" style={{ color: face.inkMute }}>
                  {a.currency}
                </span>
              </div>
              <span className="min-w-0 truncate text-[15px] font-medium" style={{ color: face.ink }}>
                {a.name}
              </span>
            </div>

            <div className="px-1 pb-1 pt-4">
              <div className="text-[12px] text-ink-mute">Balance</div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[24px] font-medium leading-none tabular-nums text-ink">
                  {fmtCurrency(a.native, a.currency, { noSymbol: true, decimals: 0 })}
                </span>
                <span className="text-[13px] text-ink-mute">{a.currency}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
