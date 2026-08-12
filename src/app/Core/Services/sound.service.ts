import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export type SoundName = 'notification' | 'roulette-spin' | 'slot-spin' | 'splash';

const PREF_KEY = 'biozin_sound_enabled';

/**
 * Servicio central de sonidos de la app. El interruptor único ("Sonido de
 * alerta" / "Sonidos" en los ajustes de cada rol) controla los 4 efectos.
 *
 * Cada sonido intenta reproducir primero un archivo real en
 * `assets/sounds/<nombre>.mp3`. Hoy esos archivos NO existen, así que cae
 * automáticamente a una versión sintetizada con Web Audio API (placeholder).
 * El día que se agreguen los .mp3 reales a esa carpeta, el servicio los
 * detecta y los usa solos — no hace falta tocar código en ningún lado.
 */
@Injectable({ providedIn: 'root' })
export class SoundService {
  readonly enabled = signal(true);

  private ctx: AudioContext | null = null;
  private assetCache = new Map<SoundName, HTMLAudioElement | 'unavailable'>();

  constructor() {
    this.loadPreference();
  }

  private async loadPreference(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: PREF_KEY });
      if (value !== null) this.enabled.set(value === 'true');
    } catch {
      // Preferences no disponible (SSR/tests): se queda en el default (true)
    }
  }

  async setEnabled(on: boolean): Promise<void> {
    this.enabled.set(on);
    try {
      await Preferences.set({ key: PREF_KEY, value: String(on) });
    } catch { /* no persiste, pero sigue funcionando en esta sesión */ }
  }

  toggle(): void {
    this.setEnabled(!this.enabled());
  }

  /** Dispara un efecto; no-op si el usuario tiene el sonido desactivado. */
  play(name: SoundName): void {
    if (!this.enabled()) return;

    const cached = this.assetCache.get(name);
    if (cached === 'unavailable') { this.synthesize(name); return; }
    if (cached) { this.playClone(cached); return; }

    // Primer uso de este sonido: probar si hay un archivo real en assets/sounds/.
    // Si no existe (404 → 'error'), se cachea 'unavailable' y de ahí en más
    // este sonido siempre usa la síntesis, sin reintentar la carga cada vez.
    const audio = new Audio(`assets/sounds/${name}.mp3`);
    audio.preload = 'auto';
    audio.addEventListener('canplaythrough', () => this.assetCache.set(name, audio), { once: true });
    audio.addEventListener('error', () => {
      this.assetCache.set(name, 'unavailable');
      this.synthesize(name);
    }, { once: true });
    audio.play().catch(() => { /* bloqueado hasta interacción del usuario; no es un error real */ });
  }

  private playClone(audio: HTMLAudioElement): void {
    // clonar permite superponer el mismo sonido si se dispara dos veces seguidas
    const instance = audio.cloneNode(true) as HTMLAudioElement;
    instance.play().catch(() => {});
  }

  // ── Síntesis (Web Audio API) ────────────────────────────────────────────
  // Placeholders hasta que existan archivos reales en assets/sounds/.

  private getCtx(): AudioContext {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  private synthesize(name: SoundName): void {
    const ctx = this.getCtx();
    switch (name) {
      case 'notification':  this.synthNotification(ctx); break;
      case 'roulette-spin': this.synthRouletteSpin(ctx); break;
      case 'slot-spin':     this.synthSlotSpin(ctx); break;
      case 'splash':        this.synthSplash(ctx); break;
    }
  }

  private tone(
    ctx: AudioContext, freq: number, start: number, dur: number,
    opts: { type?: OscillatorType; gain?: number } = {},
  ): void {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type ?? 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

    const peak = opts.gain ?? 0.25;
    gain.gain.setValueAtTime(0, ctx.currentTime + start);
    gain.gain.linearRampToValueAtTime(peak, ctx.currentTime + start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);

    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + dur + 0.05);
  }

  /** Campanilla de dos notas ascendente */
  private synthNotification(ctx: AudioContext): void {
    this.tone(ctx, 1046.5, 0,    0.16, { gain: 0.22 }); // C6
    this.tone(ctx, 1568,   0.08, 0.26, { gain: 0.22 }); // G6
  }

  /** Bolita rebotando en la rueda: tics que se espacian al desacelerar */
  private synthRouletteSpin(ctx: AudioContext): void {
    const ticks = 16;
    let t = 0;
    for (let i = 0; i < ticks; i++) {
      this.tone(ctx, 950 - i * 22, t, 0.03, { type: 'square', gain: 0.09 });
      t += 0.045 + i * 0.0035; // intervalo creciente = la bola frena
    }
  }

  /** Zumbido mecánico de los rodillos + clacks de parada */
  private synthSlotSpin(ctx: AudioContext): void {
    const dur  = 0.9;
    const buf  = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.18;

    const noise  = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 850;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start();

    [0.5, 0.65, 0.8].forEach((t, i) =>
      this.tone(ctx, 220 - i * 12, t, 0.08, { type: 'square', gain: 0.2 }));
  }

  /** Fanfarria de casino: arpegio mayor ascendente + brillo de campana al final */
  private synthSplash(ctx: AudioContext): void {
    const arpeggio = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    arpeggio.forEach((f, i) => this.tone(ctx, f, i * 0.11, 0.5, { type: 'triangle', gain: 0.22 }));

    // shimmer final tipo campana dorada
    [1046.5, 1318.5, 1568].forEach(f => this.tone(ctx, f, 0.42, 0.85, { gain: 0.1 }));
  }
}
