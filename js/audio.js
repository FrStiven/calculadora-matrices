/**
 * audio.js - Sintetizador de efectos de sonido de BOXEO con Web Audio API
 * No requiere archivos externos, funciona 100% offline.
 * Incluye: Campana de Ring (Ding-Ding-Ding), Impacto de Guante (Punch), Clic de Round.
 */

class BoxingAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /* Campana Oficial de Ring de Boxeo (Boxing Ring Bell: Ding! Ding! Ding!) */
  playBoxingBell(strikes = 3) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const startTime = this.ctx.currentTime;
      for (let i = 0; i < strikes; i++) {
        const ringTime = startTime + (i * 0.22);
        
        // Frecuencias metálicas de campana de ring de boxeo (armónicos de bronce)
        const freqs = [1200, 2400, 3100];
        freqs.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, ringTime);

          const volume = idx === 0 ? 0.22 : 0.08;
          gain.gain.setValueAtTime(0.001, ringTime);
          gain.gain.linearRampToValueAtTime(volume, ringTime + 0.006);
          gain.gain.exponentialRampToValueAtTime(0.0001, ringTime + 0.65);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(ringTime);
          osc.stop(ringTime + 0.7);
        });
      }
    } catch (e) {
      console.warn("Audio de campana no disponible:", e);
    }
  }

  /* Impacto de Guante de Boxeo / Punch seco */
  playPunch() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Golpe grave rápido
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn("Audio de golpe no disponible:", e);
    }
  }

  /* Clic de conteo o cambio de dimensión */
  playTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.setValueAtTime(1400, now + 0.02);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      console.warn("Audio no disponible:", e);
    }
  }

  /* Fanfarria de Knockout Técnico / Cinturón de Campeón */
  playKnockoutVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // Primero la campana de KO
    this.playBoxingBell(2);

    try {
      const now = this.ctx.currentTime + 0.45;
      // Acorde triunfal de ring
      const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + (idx * 0.08);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.55);
      });
    } catch (e) {
      console.warn("Audio de victoria no disponible:", e);
    }
  }
}

window.sportsAudio = new BoxingAudio();
