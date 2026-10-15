/**
 * fighters-motion.js - Galería Ordenada de Combate con Rotación Suave
 * - Muestra fotos 100% REALES de leyendas, combates en acción y post-pelea
 * - Distribuidas ordenadamente en los flancos (Esquina Roja y Esquina Azul)
 * - Sin subtítulos ni textos sobre las imágenes (visión pura y limpia)
 * - Rotación elegante con transición suave cada pocos segundos
 * - Pausa automática al pasar el mouse por encima
 */

class CombatGalleryEngine {
  constructor() {
    // Banco completo de 22 fotografías 100% reales en sus respectivos combates
    this.fightersPool = [
      { id: 'ali_ko', img: 'img/ali_ko.jpg', border: 'gold' },
      { id: 'tyson_punches_holmes', img: 'img/tyson_punches_holmes.jpg', border: 'red' },
      { id: 'poatan_fight', img: 'img/poatan_fight.jpg', border: 'gold' },
      { id: 'topuria', img: 'img/topuria.jpg', border: 'gold' },
      { id: 'oliveira_fight', img: 'img/oliveira_fight.jpg', border: 'blue' },
      { id: 'canelo_fight', img: 'img/canelo_fight.png', border: 'red' },
      { id: 'ali_frazier_fight', img: 'img/ali_frazier_fight.jpg', border: 'gold' },
      { id: 'tyson_ko_holmes', img: 'img/tyson_ko_holmes.jpg', border: 'red' },
      { id: 'usyk_fight', img: 'img/usyk_fight.jpg', border: 'gold' },
      { id: 'ggg_fight', img: 'img/ggg_fight.jpg', border: 'red' },
      { id: 'weidman_silva_ko', img: 'img/weidman_silva_ko.jpg', border: 'gold' },
      { id: 'judo_ippon', img: 'img/judo_ippon.jpg', border: 'blue' },
      { id: 'bjj_lepri_gracie', img: 'img/bjj_lepri_gracie.jpg', border: 'blue' },
      { id: 'bjj_fight', img: 'img/bjj_fight.jpg', border: 'blue' },
      { id: 'lumpinee_muaythai', img: 'img/lumpinee_muaythai.jpg', border: 'red' },
      { id: 'muaythai_fight', img: 'img/muaythai_fight.jpg', border: 'red' },
      { id: 'olympic_boxing_rio', img: 'img/olympic_boxing_rio.jpg', border: 'gold' },
      { id: 'olimpico_match', img: 'img/olimpico_match.jpg', border: 'red' },
      { id: 'mma_submission_choke', img: 'img/mma_submission_choke.jpg', border: 'blue' },
      { id: 'mma_championship_fight', img: 'img/mma_championship_fight.jpg', border: 'gold' },
      { id: 'boxing_knockout_real', img: 'img/boxing_knockout_real.jpg', border: 'red' },
      { id: 'mma_bout_cage', img: 'img/mma_bout_cage.jpg', border: 'blue' }
    ];

    this.slots = [];
    this.currentSlotIndex = 0;
    this.poolIndex = 6; // Los primeros 6 ya están precargados
    this.intervalId = null;
    this.isPaused = false;
  }

  init() {
    this.slots = Array.from(document.querySelectorAll('.fighter-photo-card'));
    if (!this.slots.length) return;

    // Inicializar las 6 tarjetas con fotos ordenadas del banco
    this.slots.forEach((card, idx) => {
      const data = this.fightersPool[idx % this.fightersPool.length];
      const img = card.querySelector('img');
      if (img) {
        img.src = data.img;
        img.alt = 'Combat Photo';
      }
      this.updateCardBorder(card, data.border);

      // Pausar rotación si el usuario pasa el mouse sobre la foto
      card.addEventListener('mouseenter', () => { this.isPaused = true; });
      card.addEventListener('mouseleave', () => { this.isPaused = false; });
    });

    // Iniciar ciclo de rotación suave cada 4.5 segundos
    this.startRotation(4500);
  }

  updateCardBorder(card, border) {
    card.classList.remove('card-border-gold', 'card-border-red', 'card-border-blue');
    card.classList.add(`card-border-${border}`);
  }

  startRotation(delayMs = 4500) {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      if (this.isPaused) return;

      // Obtener el siguiente slot a actualizar (rotación alternada entre flancos)
      const targetCard = this.slots[this.currentSlotIndex];
      const img = targetCard ? targetCard.querySelector('img') : null;

      if (img) {
        // Obtener la siguiente fotografía del pool que no esté actualmente visible
        const nextData = this.getNextPhotoData();

        // 1. Transición de salida (fade-out)
        img.classList.add('fading-out');

        // 2. Al completar desvanecimiento (350ms), cambiar imagen y borde
        setTimeout(() => {
          img.src = nextData.img;
          this.updateCardBorder(targetCard, nextData.border);

          // 3. Cuando la nueva imagen cargue, hacer fade-in suave
          if (img.complete) {
            img.classList.remove('fading-out');
          } else {
            img.onload = () => img.classList.remove('fading-out');
          }
        }, 360);
      }

      // Avanzar al siguiente slot
      this.currentSlotIndex = (this.currentSlotIndex + 1) % this.slots.length;
    }, delayMs);
  }

  getNextPhotoData() {
    // Obtener qué imágenes están actualmente visibles en pantalla
    const currentlyVisible = new Set();
    this.slots.forEach(slot => {
      const img = slot.querySelector('img');
      if (img) {
        const src = img.getAttribute('src');
        if (src) currentlyVisible.add(src);
      }
    });

    // Buscar la siguiente imagen del pool que no esté en pantalla
    let attempts = 0;
    while (attempts < this.fightersPool.length) {
      const candidate = this.fightersPool[this.poolIndex];
      this.poolIndex = (this.poolIndex + 1) % this.fightersPool.length;

      if (!currentlyVisible.has(candidate.img)) {
        return candidate;
      }
      attempts++;
    }

    // Por defecto, si todas están visibles, retornar el candidato actual
    return this.fightersPool[this.poolIndex];
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.combatGallery = new CombatGalleryEngine();
  window.combatGallery.init();
});
