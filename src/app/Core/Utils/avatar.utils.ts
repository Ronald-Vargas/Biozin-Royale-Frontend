const AVATAR_PALETTE = ['#7a4c1a', '#1a5c42', '#1a3a6b', '#6b1a3a', '#4a1a6b', '#1a5c5c'];

export function nameInitial(name: string): string {
  return name ? name.charAt(0).toUpperCase() : '?';
}

export function nameColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}
