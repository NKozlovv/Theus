'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { acceptInviteAction } from '@/app/actions/invites';
import { AuthBanner } from '@/components/auth/AuthBanner';

export function AcceptInvite({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setError(null);
    setPending(true);
    const res = await acceptInviteAction(token);
    if (res.ok) {
      router.push('/dashboard');
      router.refresh();
      return;
    }
    setPending(false);
    setError(res.error);
  }

  return (
    <div>
      {error ? <AuthBanner tone="err">{error}</AuthBanner> : null}
      <button
        type="button"
        onClick={accept}
        disabled={pending}
        className="flex w-full items-center justify-center gap-[9px] rounded-full bg-indigo py-[14px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(74,92,224,.34),inset_0_1px_0_rgba(255,255,255,.35)] transition-transform duration-200 ease-theus disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {pending ? 'Joining…' : 'Join budget'}
      </button>
    </div>
  );
}
