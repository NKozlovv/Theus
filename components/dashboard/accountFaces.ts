// Four card stocks from the app's own palette: coral, pearl, navy, teal.
// Shared by the account cards and the balance panel's holdings strip, so an
// account is the same color wherever it appears.
export const FACE_PRESETS = [
  { gradient: 'linear-gradient(135deg,#f9a8bd,#f2708f 55%,#e0517a)', ink: '#ffffff', inkMute: 'rgba(255,255,255,.88)' },
  { gradient: 'linear-gradient(135deg,#e6eaf6,#c3cbe2 55%,#a4afcf)', ink: '#1f2742', inkMute: 'rgba(31,39,66,.7)' },
  { gradient: 'linear-gradient(135deg,#2c3757,#1f2742 60%,#151a2d)', ink: '#ffffff', inkMute: 'rgba(255,255,255,.72)' },
  { gradient: 'linear-gradient(135deg,#7fe3d4,#1fb9a4 55%,#0f8f7d)', ink: '#ffffff', inkMute: 'rgba(255,255,255,.88)' },
] as const;

export function faceFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return FACE_PRESETS[Math.abs(h) % FACE_PRESETS.length]!;
}
