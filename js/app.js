/**
 * app.js - Controlador oficial de CombatMatrix Pro (Artes Marciales & Álgebra Exacta)
 * Conecta los requerimientos del cuadrilátero con soporte completo de:
 * - Esquina Roja [A] y Esquina Azul [B] (hasta 30x30 totalmente responsivo)
 * - Cabeceras de fila y columna adhesivas (Sticky headers) y HUD de coordenadas
 * - Selector de densidad visual (Normal, Compacto, Mini, Micro 30x30)
 * - Conversor Táctico Decimal ⇄ Fracción con demostración matemática paso a paso
 * - Transformación directa de celdas entre formato decimal y fraccionario
 * - Alternador de vista en resultados: [½ Fracción] ⇄ [0.00 Decimal]
 * - Paginación y búsqueda de pasos para operaciones masivas (30x30 sin lag)
 * - Transpuesta, Diagonales, Traza, Suma, Resta y Producto A×B
 * - Efectos de audio de dojo/ring, modo oscuro/claro y confetti de victoria
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado general de la arena
  const state = {
    rowsA: 4,
    colsA: 4,
    rowsB: 4,
    colsB: 4,
    densityA: 'auto',
    densityB: 'auto',
    resultDisplayMode: 'fraction', // 'fraction' | 'decimal'
    currentResultMatrix: null,
    currentResultOperation: null,
    currentHighlightType: null,
    currentSteps: [],
    currentStepOffset: 0,
    stepPageSize: 20,
    lastConvertedFraction: new Fraction(3n, 4n),
    lastConvertedDecimal: '0.75',
    isSoundMuted: false,
    theme: localStorage.getItem('boxmatrix_theme') || 'light'
  };

  /* ============================================================
     APLICAR TEMA (MODO OSCURO / CLARO)
     ============================================================ */
  document.documentElement.setAttribute('data-theme', state.theme);

  const themeToggle = document.getElementById('theme-mode-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', state.theme);
      localStorage.setItem('boxmatrix_theme', state.theme);
      if (window.sportsAudio) window.sportsAudio.playTick();
      showToast(state.theme === 'dark' ? "Modo Oscuro activado" : "Modo Claro activado", "info");
    });
  }

  /* ============================================================
     REFERENCIAS DEL DOM
     ============================================================ */
  const rowsAInput = document.getElementById('rows-a');
  const colsAInput = document.getElementById('cols-a');
  const rowsBInput = document.getElementById('rows-b');
  const colsBInput = document.getElementById('cols-b');

  const gridA = document.getElementById('grid-matrix-a');
  const gridB = document.getElementById('grid-matrix-b');

  const lblDimA = document.getElementById('lbl-dim-a');
  const lblDimB = document.getElementById('lbl-dim-b');
  const badgeCompatText = document.getElementById('badge-compat-text');
  const hintSumDesc = document.getElementById('hint-sum-desc');
  const hintMulDesc = document.getElementById('hint-mul-desc');

  const resultsArena = document.getElementById('results-arena');
  const matrixRenderStage = document.getElementById('matrix-render-stage');
  const resultOpName = document.getElementById('result-operation-name');
  const resultOpSummary = document.getElementById('result-operation-summary');
  const diagonalStatsContainer = document.getElementById('diagonal-stats-container');
  const breakdownContent = document.getElementById('breakdown-content');
  const breakdownToggleBtn = document.getElementById('breakdown-toggle-btn');
  const breakdownHeader = document.getElementById('breakdown-header');

  const toastContainer = document.getElementById('toast-container');
  const btnToggleSound = document.getElementById('btn-toggle-sound');
  const soundIcon = document.getElementById('sound-icon');
  const btnBrandSound = document.getElementById('btn-brand-sound');

  // Conversor Táctico
  const btnNavConverter = document.getElementById('btn-nav-converter');
  const converterSection = document.getElementById('tactical-converter-section');
  const tabDecToFrac = document.getElementById('tab-dec-to-frac');
  const tabFracToDec = document.getElementById('tab-frac-to-dec');
  const panelDecToFrac = document.getElementById('panel-dec-to-frac');
  const panelFracToDec = document.getElementById('panel-frac-to-dec');

  const inputDecVal = document.getElementById('input-dec-val');
  const btnExecuteDecToFrac = document.getElementById('btn-execute-dec-to-frac');
  const convOutputFracVal = document.getElementById('conv-output-frac-val');
  const badgeDecType = document.getElementById('badge-dec-type');
  const badgeDecMixed = document.getElementById('badge-dec-mixed');
  const convStepsDecList = document.getElementById('conv-steps-dec-list');
  const btnCopyConvFrac = document.getElementById('btn-copy-conv-frac');
  const btnSendConvToA = document.getElementById('btn-send-conv-to-a');
  const btnSendConvToB = document.getElementById('btn-send-conv-to-b');

  const inputFracVal = document.getElementById('input-frac-val');
  const btnExecuteFracToDec = document.getElementById('btn-execute-frac-to-dec');
  const convOutputDecVal = document.getElementById('conv-output-dec-val');
  const badgeFracType = document.getElementById('badge-frac-type');
  const badgeFracPeriod = document.getElementById('badge-frac-period');
  const convStepsFracList = document.getElementById('conv-steps-frac-list');
  const btnCopyConvDec = document.getElementById('btn-copy-conv-dec');
  const btnSendDecToA = document.getElementById('btn-send-dec-to-a');
  const btnSendDecToB = document.getElementById('btn-send-dec-to-b');

  // Transformación y utilidades de matrices
  const btnConvertCellsA = document.getElementById('btn-convert-cells-a');
  const btnConvertCellsB = document.getElementById('btn-convert-cells-b');
  const btnZerosA = document.getElementById('btn-zeros-a');
  const btnZerosB = document.getElementById('btn-zeros-b');
  const btnOnesA = document.getElementById('btn-ones-a');
  const btnOnesB = document.getElementById('btn-ones-b');

  // Alternador de formato en resultados y paginación
  const btnResultFormatFrac = document.getElementById('btn-result-format-frac');
  const btnResultFormatDec = document.getElementById('btn-result-format-dec');
  const breakdownFilterBar = document.getElementById('breakdown-filter-bar');
  const inputStepFilterR = document.getElementById('input-step-filter-r');
  const inputStepFilterC = document.getElementById('input-step-filter-c');
  const btnFilterStep = document.getElementById('btn-filter-step');
  const btnResetStepFilter = document.getElementById('btn-reset-step-filter');
  const stepCountBadge = document.getElementById('step-count-badge');
  const breakdownLoadMoreWrap = document.getElementById('breakdown-load-more-wrap');
  const btnLoadMoreSteps = document.getElementById('btn-load-more-steps');

  /* ============================================================
     INICIALIZACIÓN DEL CUADRILÁTERO (REQUERIMIENTO 1)
     ============================================================ */
  function initGrids() {
    renderMatrixInputs('a', state.rowsA, state.colsA, [
      ['2.30', '5.6', '8.4', '3.4'],
      ['4.5', '3', '25.3', '12.3'],
      ['5.4', '52.0', '2.1', '5.0'],
      ['9.5', '6.4', '1.0', '4.5']
    ]);

    renderMatrixInputs('b', state.rowsB, state.colsB, [
      ['86', '222', '94', '20'],
      ['2.04', '48', '68/8', '8'],
      ['2^1/3', '(81)^1/2', '33', '7'],
      ['7225', '9', '12', '5']
    ]);

    updateScoreboardAndCompatibility();
    initTacticalConverter();
  }

  /**
   * Aplica la clase de densidad visual a la cuadrícula.
   */
  function applyGridDensity(target, rows, cols) {
    const isA = target === 'a';
    const container = isA ? gridA : gridB;
    const densityMode = isA ? state.densityA : state.densityB;

    container.classList.remove('grid-dense', 'grid-ultra-dense', 'grid-compact', 'grid-mini', 'grid-micro');

    let effectiveDensity = densityMode;
    if (densityMode === 'auto') {
      if (cols > 20 || rows > 20) effectiveDensity = 'micro';
      else if (cols > 12 || rows > 12) effectiveDensity = 'mini';
      else if (cols > 6 || rows > 6) effectiveDensity = 'compact';
      else effectiveDensity = 'normal';
    }

    if (effectiveDensity === 'micro') {
      container.classList.add('grid-micro');
    } else if (effectiveDensity === 'mini') {
      container.classList.add('grid-mini');
    } else if (effectiveDensity === 'compact') {
      container.classList.add('grid-compact');
    } else if (effectiveDensity === 'ultra-dense') {
      container.classList.add('grid-ultra-dense');
    }

    // Actualizar botones de densidad activos
    const toolbar = document.getElementById(`density-toolbar-${target}`);
    if (toolbar) {
      toolbar.querySelectorAll('.btn-density').forEach(btn => {
        if (btn.dataset.density === densityMode) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }

  /**
   * Genera dinámicamente las celdas de la esquina con cabeceras adhesivas y alto rendimiento para 30x30.
   */
  function renderMatrixInputs(target, rows, cols, defaultValues = null) {
    const isA = target === 'a';
    const gridContainer = isA ? gridA : gridB;
    
    // Guardar valores previos si el usuario ajustó dimensiones
    const previousValues = {};
    const existingInputs = gridContainer.querySelectorAll('.matrix-cell-input');
    existingInputs.forEach(input => {
      const r = input.dataset.r;
      const c = input.dataset.c;
      previousValues[`${r},${c}`] = input.value;
    });

    gridContainer.innerHTML = '';

    // Aplicar densidad visual (auto, normal, compact, mini, micro)
    applyGridDensity(target, rows, cols);

    // Configurar columnas de CSS Grid:
    // Para matrices de tamaño estándar (hasta 6 columnas), ocupa el 100% del ancho
    // para que la matriz se muestre ENTERA sin recortes ni barras de desplazamiento.
    if (cols <= 6) {
      gridContainer.style.gridTemplateColumns = `24px repeat(${cols}, minmax(0, 1fr))`;
      gridContainer.style.width = '100%';
      if (gridContainer.parentElement) {
        gridContainer.parentElement.style.overflowX = 'hidden';
      }
    } else if (cols <= 10) {
      gridContainer.style.gridTemplateColumns = `22px repeat(${cols}, minmax(46px, 1fr))`;
      gridContainer.style.width = 'max-content';
      if (gridContainer.parentElement) {
        gridContainer.parentElement.style.overflowX = 'auto';
      }
    } else {
      gridContainer.style.gridTemplateColumns = `20px repeat(${cols}, minmax(30px, 1fr))`;
      gridContainer.style.width = 'max-content';
      if (gridContainer.parentElement) {
        gridContainer.parentElement.style.overflowX = 'auto';
      }
    }

    const fragment = document.createDocumentFragment();

    // Celda de esquina adhesiva (0, 0)
    const cornerHeader = document.createElement('div');
    cornerHeader.className = 'matrix-header-cell matrix-header-corner';
    cornerHeader.textContent = isA ? 'A' : 'B';
    cornerHeader.title = `Esquina ${isA ? 'Roja [A]' : 'Azul [B]'}`;
    fragment.appendChild(cornerHeader);

    // Cabeceras de columna adhesivas superiores (1..cols)
    for (let c = 0; c < cols; c++) {
      const colHeader = document.createElement('div');
      colHeader.className = 'matrix-header-cell matrix-header-col';
      colHeader.dataset.col = c;
      colHeader.dataset.target = target;
      colHeader.textContent = `${c + 1}`;
      colHeader.title = `Columna ${c + 1}`;
      fragment.appendChild(colHeader);
    }

    // Filas con cabecera de fila adhesiva izquierda y celdas de entrada
    for (let r = 0; r < rows; r++) {
      const rowHeader = document.createElement('div');
      rowHeader.className = 'matrix-header-cell matrix-header-row';
      rowHeader.dataset.row = r;
      rowHeader.dataset.target = target;
      rowHeader.textContent = `${r + 1}`;
      rowHeader.title = `Fila ${r + 1}`;
      fragment.appendChild(rowHeader);

      for (let c = 0; c < cols; c++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'cell-input-wrapper';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'matrix-cell-input';
        input.dataset.r = r;
        input.dataset.c = c;
        input.dataset.target = target;
        input.title = `[Fila ${r + 1}, Col ${c + 1}]`;
        input.placeholder = '0';

        // Determinar valor inicial
        if (defaultValues && defaultValues[r] && defaultValues[r][c] !== undefined) {
          input.value = defaultValues[r][c];
        } else if (previousValues[`${r},${c}`] !== undefined) {
          input.value = previousValues[`${r},${c}`];
        } else {
          input.value = (r === c) ? '1' : '0';
        }

        // Navegación con teclado, HUD y foco interactivo
        input.addEventListener('focus', () => handleCellFocus(target, r, c));
        input.addEventListener('blur', () => handleCellBlur(target));
        input.addEventListener('keydown', (e) => handleKeyNavigation(e, target, r, c, rows, cols));
        input.addEventListener('input', () => {
          input.classList.remove('input-error');
        });

        wrapper.appendChild(input);
        fragment.appendChild(wrapper);
      }
    }

    gridContainer.appendChild(fragment);
    if (gridContainer.parentElement) {
      gridContainer.parentElement.scrollLeft = 0;
      gridContainer.parentElement.scrollTop = 0;
    }
  }

  const lastActiveCell = { a: { r: 0, c: 0 }, b: { r: 0, c: 0 } };

  function handleCellFocus(target, r, c) {
    lastActiveCell[target] = { r, c };
    const coordsEl = document.getElementById(`coords-text-${target}`);
    if (coordsEl) coordsEl.textContent = `[Fila ${r + 1}, Col ${c + 1}]`;

    const container = target === 'a' ? gridA : gridB;
    container.querySelectorAll('.header-active-col, .header-active-row').forEach(el => {
      el.classList.remove('header-active-col', 'header-active-row');
    });

    const colH = container.querySelector(`.matrix-header-col[data-col="${c}"]`);
    const rowH = container.querySelector(`.matrix-header-row[data-row="${r}"]`);
    if (colH) colH.classList.add('header-active-col');
    if (rowH) rowH.classList.add('header-active-row');
  }

  function handleCellBlur(target) {
    const container = target === 'a' ? gridA : gridB;
    container.querySelectorAll('.header-active-col, .header-active-row').forEach(el => {
      el.classList.remove('header-active-col', 'header-active-row');
    });
  }

  function handleKeyNavigation(e, target, r, c, maxR, maxC) {
    let nextR = r;
    let nextC = c;

    if (e.key === 'ArrowRight' || e.key === 'Enter') {
      nextC++;
      if (nextC >= maxC) {
        nextC = 0;
        nextR++;
      }
    } else if (e.key === 'ArrowLeft') {
      nextC--;
      if (nextC < 0) {
        nextC = maxC - 1;
        nextR--;
      }
    } else if (e.key === 'ArrowDown') {
      nextR++;
    } else if (e.key === 'ArrowUp') {
      nextR--;
    } else {
      return;
    }

    if (nextR >= 0 && nextR < maxR && nextC >= 0 && nextC < maxC) {
      e.preventDefault();
      const container = target === 'a' ? gridA : gridB;
      const nextInput = container.querySelector(`input[data-r="${nextR}"][data-c="${nextC}"]`);
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  }

  /* ============================================================
     LECTURA Y VALIDACIÓN CON FRACCIONES Y DECIMALES
     ============================================================ */
  function readMatrix(target) {
    const isA = target.toLowerCase() === 'a';
    const rows = isA ? state.rowsA : state.rowsB;
    const cols = isA ? state.colsA : state.colsB;
    const container = isA ? gridA : gridB;
    const mat = new Matrix(rows, cols);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const input = container.querySelector(`input[data-r="${r}"][data-c="${c}"]`);
        const valStr = input ? input.value.trim() : '0';

        try {
          const frac = Fraction.fromString(valStr);
          mat.set(r, c, frac);
        } catch (err) {
          if (input) {
            input.classList.add('input-error');
            input.focus();
          }
          throw new Error(`¡Golpe antirreglamentario! En Esquina ${target.toUpperCase()}, celda [${r + 1}, ${c + 1}]: "${valStr}" no es válido (${err.message}). Ejemplos válidos: (81)^1/2, 2^1/3, (-2)^3, (3/4)^2, 68/8, 2.04.`);
        }
      }
    }

    return mat;
  }

  /* ============================================================
     ACTUALIZACIÓN DE TAMAÑOS Y VEREDICTO ARBITRAL
     ============================================================ */
  function updateScoreboardAndCompatibility() {
    if (lblDimA) lblDimA.textContent = `${state.rowsA} × ${state.colsA}`;
    if (lblDimB) lblDimB.textContent = `${state.rowsB} × ${state.colsB}`;

    const canAdd = state.rowsA === state.rowsB && state.colsA === state.colsB;
    const canMul = state.colsA === state.rowsB;

    if (badgeCompatText) {
      if (canAdd && canMul) {
        badgeCompatText.textContent = `Aptas para Suma [A + B] y Producto [A × B]`;
      } else if (canMul) {
        badgeCompatText.textContent = `Aptas para Producto [A × B] (genera ${state.rowsA}×${state.colsB})`;
      } else if (canAdd) {
        badgeCompatText.textContent = `Aptas para Suma [A + B] (${state.rowsA}×${state.colsA})`;
      } else {
        badgeCompatText.textContent = `Aptas para Transpuestas y Diagonales`;
      }
    }

    updatePresetChipsHighlight('a');
    updatePresetChipsHighlight('b');
  }

  function updatePresetChipsHighlight(target) {
    const isA = target === 'a';
    const r = isA ? state.rowsA : state.rowsB;
    const c = isA ? state.colsA : state.colsB;

    const selector = `.presets-list button[data-target="${target}"], .presets-list button[data-target="both"]`;
    document.querySelectorAll(selector).forEach(btn => {
      const btnR = parseInt(btn.dataset.r, 10);
      const btnC = parseInt(btn.dataset.c, 10);
      if (btnR === r && btnC === c) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Steppers para aumentar o disminuir dimensiones con botones + / - (hasta 30x30)
  document.querySelectorAll('.btn-step').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetInputId = btn.dataset.target;
      const delta = parseInt(btn.dataset.delta, 10);
      const input = document.getElementById(targetInputId);
      if (!input) return;

      let val = (parseInt(input.value, 10) || 2) + delta;
      val = Math.max(1, Math.min(30, val));
      input.value = val;

      if (targetInputId === 'rows-a') state.rowsA = val;
      if (targetInputId === 'cols-a') state.colsA = val;
      if (targetInputId === 'rows-b') state.rowsB = val;
      if (targetInputId === 'cols-b') state.colsB = val;

      const isA = targetInputId.endsWith('-a');
      if (isA) {
        renderMatrixInputs('a', state.rowsA, state.colsA);
      } else {
        renderMatrixInputs('b', state.rowsB, state.colsB);
      }

      updateScoreboardAndCompatibility();
      if (window.sportsAudio) window.sportsAudio.playTick();
    });
  });

  // Entrada directa de dimensiones por teclado
  function handleDimensionDirectChange(target, dimension, inputEl) {
    let val = parseInt(inputEl.value, 10);
    if (isNaN(val) || val < 1) return;
    if (val > 30) {
      val = 30;
      inputEl.value = val;
      showToast("Dimensión fijada en 30 (límite máximo optimizado).", "warning");
    }

    if (target === 'a') {
      if (dimension === 'rows') state.rowsA = val;
      if (dimension === 'cols') state.colsA = val;
      renderMatrixInputs('a', state.rowsA, state.colsA);
    } else {
      if (dimension === 'rows') state.rowsB = val;
      if (dimension === 'cols') state.colsB = val;
      renderMatrixInputs('b', state.rowsB, state.colsB);
    }

    updateScoreboardAndCompatibility();
  }

  function handleDimensionBlur(target, dimension, inputEl) {
    let val = parseInt(inputEl.value, 10);
    if (isNaN(val) || val < 1) {
      val = 1;
      inputEl.value = val;
    }
    handleDimensionDirectChange(target, dimension, inputEl);
  }

  if (rowsAInput) {
    rowsAInput.addEventListener('input', () => handleDimensionDirectChange('a', 'rows', rowsAInput));
    rowsAInput.addEventListener('blur', () => handleDimensionBlur('a', 'rows', rowsAInput));
  }
  if (colsAInput) {
    colsAInput.addEventListener('input', () => handleDimensionDirectChange('a', 'cols', colsAInput));
    colsAInput.addEventListener('blur', () => handleDimensionBlur('a', 'cols', colsAInput));
  }
  if (rowsBInput) {
    rowsBInput.addEventListener('input', () => handleDimensionDirectChange('b', 'rows', rowsBInput));
    rowsBInput.addEventListener('blur', () => handleDimensionBlur('b', 'rows', rowsBInput));
  }
  if (colsBInput) {
    colsBInput.addEventListener('input', () => handleDimensionDirectChange('b', 'cols', colsBInput));
    colsBInput.addEventListener('blur', () => handleDimensionBlur('b', 'cols', colsBInput));
  }

  // Diálogo para establecer cualquier tamaño libre personalizado (ej: 10x10, 15x15, 30x30)
  function askCustomDimensions(target) {
    const isA = target === 'a';
    const currentR = isA ? state.rowsA : state.rowsB;
    const currentC = isA ? state.colsA : state.colsB;
    const userInput = prompt(
      `Establecer tamaño para Esquina ${isA ? 'Roja [A]' : 'Azul [B]'}.\nIntroduce Filas x Columnas (ejemplo: 5x5, 10x10, 30x30):`,
      `${currentR}x${currentC}`
    );
    if (!userInput) return;

    const match = userInput.match(/(\d+)\s*[\*xX×,]\s*(\d+)/);
    if (match) {
      let r = parseInt(match[1], 10);
      let c = parseInt(match[2], 10);
      if (isNaN(r) || r < 1) r = 1;
      if (isNaN(c) || c < 1) c = 1;
      if (r > 30) { r = 30; showToast("Filas limitadas a 30 por optimización.", "warning"); }
      if (c > 30) { c = 30; showToast("Columnas limitadas a 30 por optimización.", "warning"); }

      if (isA) {
        state.rowsA = r;
        state.colsA = c;
        if (rowsAInput) rowsAInput.value = r;
        if (colsAInput) colsAInput.value = c;
        renderMatrixInputs('a', r, c);
      } else {
        state.rowsB = r;
        state.colsB = c;
        if (rowsBInput) rowsBInput.value = r;
        if (colsBInput) colsBInput.value = c;
        renderMatrixInputs('b', r, c);
      }
      updateScoreboardAndCompatibility();
      if (window.sportsAudio) window.sportsAudio.playPunch();
      showToast(`Esquina ${isA ? 'Roja [A]' : 'Azul [B]'} configurada a ${r}×${c}`, 'success');
    } else {
      showToast("Formato no reconocido. Usa por ejemplo 5x5 o 30x30.", "error");
    }
  }

  const btnCustomA = document.getElementById('btn-custom-a');
  if (btnCustomA) btnCustomA.addEventListener('click', () => askCustomDimensions('a'));

  const btnCustomB = document.getElementById('btn-custom-b');
  if (btnCustomB) btnCustomB.addEventListener('click', () => askCustomDimensions('b'));

  // Presets de chips rápidos de tamaño (2x2, 3x3, 4x4, 10x10, 30x30, etc.)
  document.querySelectorAll('.btn-chip[data-r]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const r = parseInt(btn.dataset.r, 10);
      const c = parseInt(btn.dataset.c, 10);

      if (target === 'both') {
        state.rowsA = r;
        state.colsA = c;
        state.rowsB = r;
        state.colsB = c;
        if (rowsAInput) rowsAInput.value = r;
        if (colsAInput) colsAInput.value = c;
        if (rowsBInput) rowsBInput.value = r;
        if (colsBInput) colsBInput.value = c;
        renderMatrixInputs('a', r, c);
        renderMatrixInputs('b', r, c);
      } else if (target === 'a') {
        state.rowsA = r;
        state.colsA = c;
        if (rowsAInput) rowsAInput.value = r;
        if (colsAInput) colsAInput.value = c;
        renderMatrixInputs('a', r, c);
      } else {
        state.rowsB = r;
        state.colsB = c;
        if (rowsBInput) rowsBInput.value = r;
        if (colsBInput) colsBInput.value = c;
        renderMatrixInputs('b', r, c);
      }

      updateScoreboardAndCompatibility();
      if (window.sportsAudio) window.sportsAudio.playPunch();

      if (r === 30 && c === 30) {
        showToast(`Matriz 30×30 lista. Desplázate horizontal y verticalmente con fluidez.`, 'info');
      }
    });
  });

  // Botón "Crear matrices" de la Sección 1
  const btnCreateMatrices = document.getElementById('btn-create-matrices');
  if (btnCreateMatrices) {
    btnCreateMatrices.addEventListener('click', () => {
      const rA = parseInt(rowsAInput.value, 10) || 4;
      const cA = parseInt(colsAInput.value, 10) || 4;
      const rB = parseInt(rowsBInput.value, 10) || 4;
      const cB = parseInt(colsBInput.value, 10) || 4;

      state.rowsA = Math.min(30, Math.max(1, rA));
      state.colsA = Math.min(30, Math.max(1, cA));
      state.rowsB = Math.min(30, Math.max(1, rB));
      state.colsB = Math.min(30, Math.max(1, cB));

      renderMatrixInputs('a', state.rowsA, state.colsA);
      renderMatrixInputs('b', state.rowsB, state.colsB);
      updateScoreboardAndCompatibility();

      if (window.sportsAudio) window.sportsAudio.playGong();
      showToast(`¡Matrices listas! Matriz A (${state.rowsA}×${state.colsA}) y Matriz B (${state.rowsB}×${state.colsB})`, 'success');

      const secInput = document.getElementById('step-matrices-input');
      if (secInput) secInput.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Botón "Limpiar resultado" de la Sección 3
  const btnClearResult = document.getElementById('btn-clear-result');
  if (btnClearResult) {
    btnClearResult.addEventListener('click', () => {
      state.currentResultMatrix = null;
      state.currentResultOperation = null;
      state.currentSteps = [];
      state.currentStepOffset = 0;

      if (matrixRenderStage) {
        matrixRenderStage.innerHTML = `
          <div class="empty-state-card">
            <span class="empty-icon">📊</span>
            <p>La matriz resultante aparecerá aquí en cuanto presiones una operación arriba.</p>
          </div>
        `;
      }
      if (resultOpName) resultOpName.textContent = "Resultado de la Operación";
      if (resultOpSummary) resultOpSummary.textContent = "Selecciona una operación arriba para ver el resultado exacto.";
      if (diagonalStatsContainer) {
        diagonalStatsContainer.style.display = 'none';
        diagonalStatsContainer.innerHTML = '';
      }
      if (breakdownContent) breakdownContent.innerHTML = '';
      const loadMoreWrap = document.getElementById('breakdown-load-more-wrap');
      if (loadMoreWrap) loadMoreWrap.style.display = 'none';

      if (window.sportsAudio) window.sportsAudio.playPunch();
      showToast("Área de resultados limpiada.", "info");
    });
  }

  // Selectores de densidad visual (Auto, Normal, Compacto, Mini, Micro)
  document.querySelectorAll('.btn-density').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const density = btn.dataset.density;
      if (target === 'a') state.densityA = density;
      else state.densityB = density;

      const r = target === 'a' ? state.rowsA : state.rowsB;
      const c = target === 'a' ? state.colsA : state.colsB;
      applyGridDensity(target, r, c);
      if (window.sportsAudio) window.sportsAudio.playTick();
    });
  });

  /* ============================================================
     ACCIONES DE ESQUINA (GOLPE ALEATORIO, FRACCIONES, CEROS, UNOS, IDENTIDAD)
     ============================================================ */
  const fractionSamples = [
    '1/2', '3/4', '-1/3', '2/5', '-3/2', '5/3', '1/4', '7/2', '-2/3', '4/5',
    '0.75', '0.5', '2.04', '68/8', '(81)^1/2', '2^1/3', '(-2)^3', '(3/4)^2', '(-6)^2', '2 1/2'
  ];

  function fillRandom(target) {
    const isA = target === 'a';
    const container = isA ? gridA : gridB;

    container.querySelectorAll('.matrix-cell-input').forEach(input => {
      if (Math.random() < 0.45) {
        input.value = fractionSamples[Math.floor(Math.random() * fractionSamples.length)];
      } else {
        const intVal = Math.floor(Math.random() * 19) - 9;
        input.value = intVal.toString();
      }
    });

    if (window.sportsAudio) window.sportsAudio.playPunch();
    showToast(`Esquina ${isA ? 'Roja [A]' : 'Azul [B]'} armada con valores aleatorios`, 'info');
  }

  function fillFractionsDemo(target) {
    const isA = target === 'a';
    const container = isA ? gridA : gridB;

    container.querySelectorAll('.matrix-cell-input').forEach(input => {
      input.value = fractionSamples[Math.floor(Math.random() * fractionSamples.length)];
    });

    if (window.sportsAudio) window.sportsAudio.playPunch();
    showToast(`Fracciones exactas cargadas en Esquina ${isA ? 'Roja [A]' : 'Azul [B]'}`, 'info');
  }

  function fillIdentity(target) {
    const isA = target === 'a';
    const rows = isA ? state.rowsA : state.rowsB;
    const cols = isA ? state.colsA : state.colsB;
    const container = isA ? gridA : gridB;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const input = container.querySelector(`input[data-r="${r}"][data-c="${c}"]`);
        if (input) input.value = (r === c) ? '1' : '0';
      }
    }

    if (window.sportsAudio) window.sportsAudio.playPunch();
    showToast(`Matriz Identidad establecida en Esquina ${isA ? 'Roja [A]' : 'Azul [B]'}`, 'info');
  }

  function fillZeros(target) {
    const isA = target === 'a';
    const container = isA ? gridA : gridB;
    container.querySelectorAll('.matrix-cell-input').forEach(inp => inp.value = '0');
    if (window.sportsAudio) window.sportsAudio.playPunch();
    showToast(`Esquina ${isA ? 'Roja [A]' : 'Azul [B]'} llenada con ceros`, 'info');
  }

  function fillOnes(target) {
    const isA = target === 'a';
    const container = isA ? gridA : gridB;
    container.querySelectorAll('.matrix-cell-input').forEach(inp => inp.value = '1');
    if (window.sportsAudio) window.sportsAudio.playPunch();
    showToast(`Esquina ${isA ? 'Roja [A]' : 'Azul [B]'} llenada con unos`, 'info');
  }

  function clearGrid(target) {
    fillZeros(target);
  }

  /**
   * Transforma las celdas de la matriz activa:
   * Si tienen decimales -> los transforma a fracciones exactas irreducibles.
   * Si tienen fracciones -> las transforma a expresión decimal.
   */
  function convertMatrixCellsFormat(target) {
    const isA = target === 'a';
    const container = isA ? gridA : gridB;
    const inputs = container.querySelectorAll('.matrix-cell-input');
    if (!inputs.length) return;

    let hasDecimals = false;
    inputs.forEach(inp => {
      const v = inp.value.trim().replace(',', '.');
      if (v.includes('.') && !v.includes('/')) hasDecimals = true;
    });

    let convertedCount = 0;
    if (hasDecimals) {
      // Transformar decimales a fracciones exactas
      inputs.forEach(inp => {
        const v = inp.value.trim().replace(',', '.');
        if (v.includes('.') && !v.includes('/')) {
          try {
            const frac = Fraction.fromString(v);
            inp.value = frac.toString();
            convertedCount++;
          } catch (e) {}
        }
      });
      if (window.sportsAudio) window.sportsAudio.playPunch();
      showToast(`¡Se transformaron ${convertedCount} celdas decimales a fracciones exactas en Esquina ${isA ? 'Roja [A]' : 'Azul [B]'}!`, 'success');
    } else {
      // Transformar fracciones a formato decimal
      inputs.forEach(inp => {
        const v = inp.value.trim();
        if (v.includes('/')) {
          try {
            const frac = Fraction.fromString(v);
            inp.value = frac.toDecimalString(4);
            convertedCount++;
          } catch (e) {}
        }
      });
      if (window.sportsAudio) window.sportsAudio.playPunch();
      showToast(`¡Se transformaron ${convertedCount} fracciones a formato decimal en Esquina ${isA ? 'Roja [A]' : 'Azul [B]'}!`, 'info');
    }
  }

  // Asignar listeners de toolbar
  const btnRandomA = document.getElementById('btn-random-a');
  if (btnRandomA) btnRandomA.addEventListener('click', () => fillRandom('a'));

  const btnRandomB = document.getElementById('btn-random-b');
  if (btnRandomB) btnRandomB.addEventListener('click', () => fillRandom('b'));

  const btnIdentityA = document.getElementById('btn-identity-a');
  if (btnIdentityA) btnIdentityA.addEventListener('click', () => fillIdentity('a'));

  const btnIdentityB = document.getElementById('btn-identity-b');
  if (btnIdentityB) btnIdentityB.addEventListener('click', () => fillIdentity('b'));

  const btnFractionsA = document.getElementById('btn-fractions-demo-a');
  if (btnFractionsA) btnFractionsA.addEventListener('click', () => fillFractionsDemo('a'));

  const btnFractionsB = document.getElementById('btn-fractions-demo-b');
  if (btnFractionsB) btnFractionsB.addEventListener('click', () => fillFractionsDemo('b'));

  const btnClearA = document.getElementById('btn-clear-a');
  if (btnClearA) btnClearA.addEventListener('click', () => clearGrid('a'));

  const btnClearB = document.getElementById('btn-clear-b');
  if (btnClearB) btnClearB.addEventListener('click', () => clearGrid('b'));

  if (btnZerosA) btnZerosA.addEventListener('click', () => fillZeros('a'));
  if (btnZerosB) btnZerosB.addEventListener('click', () => fillZeros('b'));
  if (btnOnesA) btnOnesA.addEventListener('click', () => fillOnes('a'));
  if (btnOnesB) btnOnesB.addEventListener('click', () => fillOnes('b'));

  if (btnConvertCellsA) btnConvertCellsA.addEventListener('click', () => convertMatrixCellsFormat('a'));
  if (btnConvertCellsB) btnConvertCellsB.addEventListener('click', () => convertMatrixCellsFormat('b'));

  // Clic en chips de expresiones y potencias (insertar en celda activa o primera)
  document.querySelectorAll('.btn-math-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const target = chip.dataset.target || 'a';
      const expr = chip.dataset.expr || '';
      const container = target === 'a' ? gridA : gridB;
      const { r, c } = lastActiveCell[target] || { r: 0, c: 0 };
      const input = container.querySelector(`input[data-r="${r}"][data-c="${c}"]`) || container.querySelector('input');
      if (input) {
        input.value = expr;
        input.focus();
        input.select();
        input.classList.remove('input-error');
        if (window.sportsAudio) window.sportsAudio.playPunch();
        showToast(`Se insertó "${expr}" en celda [${r + 1}, ${c + 1}] de Esquina ${target.toUpperCase()}`, 'info');
      }
    });
  });

  // Cargar ejercicios de las fotos del usuario (4x4 con potencias, fracciones y decimales)
  const btnPhotoPresetA = document.getElementById('btn-photo-preset-a');
  if (btnPhotoPresetA) {
    btnPhotoPresetA.addEventListener('click', () => {
      state.rowsA = 4;
      state.colsA = 4;
      if (rowsAInput) rowsAInput.value = 4;
      if (colsAInput) colsAInput.value = 4;
      const photoValuesA = [
        ['2.30', '5.6', '8.4', '3.4'],
        ['4.5', '3', '25.3', '12.3'],
        ['5.4', '52.0', '2.1', '5.0'],
        ['9.5', '6.4', '1.0', '4.5']
      ];
      renderMatrixInputs('a', 4, 4, photoValuesA);
      updateScoreboardAndCompatibility();
      if (window.sportsAudio) window.sportsAudio.playGong();
      showToast('¡Matriz A armada con datos de la foto (4×4 con decimales)!', 'success');
    });
  }

  const btnPhotoPresetB = document.getElementById('btn-photo-preset-b');
  if (btnPhotoPresetB) {
    btnPhotoPresetB.addEventListener('click', () => {
      state.rowsB = 4;
      state.colsB = 4;
      if (rowsBInput) rowsBInput.value = 4;
      if (colsBInput) colsBInput.value = 4;
      const photoValuesB = [
        ['86', '222', '94', '20'],
        ['2.04', '48', '68/8', '8'],
        ['2^1/3', '(81)^1/2', '33', '7'],
        ['7225', '9', '12', '5']
      ];
      renderMatrixInputs('b', 4, 4, photoValuesB);
      updateScoreboardAndCompatibility();
      if (window.sportsAudio) window.sportsAudio.playGong();
      showToast('¡Matriz B armada con ejercicios de la foto: (81)^1/2, 2^1/3, 68/8, 2.04!', 'success');
    });
  }

  /* ============================================================
     CONVERSOR TÁCTICO: DECIMAL ⇄ FRACCIÓN (REQUERIMIENTO CONVERSOR)
     ============================================================ */
  function initTacticalConverter() {
    // Alternancia de Pestañas
    if (tabDecToFrac && tabFracToDec) {
      tabDecToFrac.addEventListener('click', () => {
        tabDecToFrac.classList.add('active');
        tabFracToDec.classList.remove('active');
        panelDecToFrac.style.display = 'block';
        panelFracToDec.style.display = 'none';
        if (window.sportsAudio) window.sportsAudio.playTick();
      });

      tabFracToDec.addEventListener('click', () => {
        tabFracToDec.classList.add('active');
        tabDecToFrac.classList.remove('active');
        panelFracToDec.style.display = 'block';
        panelDecToFrac.style.display = 'none';
        if (window.sportsAudio) window.sportsAudio.playTick();
      });
    }

    // Botón de salto rápido en cabecera
    if (btnNavConverter) {
      btnNavConverter.addEventListener('click', () => {
        if (converterSection) {
          converterSection.scrollIntoView({ behavior: 'smooth' });
          if (window.sportsAudio) window.sportsAudio.playBoxingBell(1);
          showToast("Conversor Táctico: Decimal ⟷ Fracción", "info");
        }
      });
    }

    // 1. DECIMAL A FRACCIÓN
    function runDecToFrac() {
      if (!inputDecVal) return;
      const rawVal = inputDecVal.value.trim();
      if (!rawVal) {
        showToast("Ingresa un número decimal para convertir.", "warning");
        return;
      }

      try {
        const res = Fraction.decimalToFractionDetailed(rawVal);
        state.lastConvertedFraction = res.fraction;

        if (convOutputFracVal) convOutputFracVal.innerHTML = res.fraction.toHTML();
        if (badgeDecType) badgeDecType.textContent = res.type;

        if (badgeDecMixed) {
          if (res.mixed) {
            badgeDecMixed.textContent = `Número Mixto: ${res.mixed}`;
            badgeDecMixed.style.display = 'inline-block';
          } else {
            badgeDecMixed.style.display = 'none';
          }
        }

        if (convStepsDecList) {
          convStepsDecList.innerHTML = res.steps
            .map(step => `<div class="conv-step-item">${step}</div>`)
            .join('');
        }

        if (window.sportsAudio) window.sportsAudio.playPunch();
        showToast(`¡Decimal transformado a fracción exacta: ${res.fraction.toString()}!`, 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }

    if (btnExecuteDecToFrac) btnExecuteDecToFrac.addEventListener('click', runDecToFrac);
    if (inputDecVal) {
      inputDecVal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') runDecToFrac();
      });
    }

    // Chips de ejemplo decimal
    document.querySelectorAll('.btn-quick-dec').forEach(chip => {
      chip.addEventListener('click', () => {
        if (inputDecVal) {
          inputDecVal.value = chip.dataset.dec;
          runDecToFrac();
        }
      });
    });

    // Copiar fracción resultante
    if (btnCopyConvFrac) {
      btnCopyConvFrac.addEventListener('click', () => {
        const text = state.lastConvertedFraction ? state.lastConvertedFraction.toString() : '3/4';
        navigator.clipboard.writeText(text).then(() => {
          showToast(`Fracción "${text}" copiada al portapapeles.`, 'success');
        }).catch(() => {
          showToast(`Fracción: ${text}`, 'info');
        });
      });
    }

    // Enviar fracción a Matriz A o B
    function sendFractionToMatrix(target) {
      const isA = target === 'a';
      const container = isA ? gridA : gridB;
      const text = state.lastConvertedFraction ? state.lastConvertedFraction.toString() : '3/4';
      
      const activeInput = container.querySelector('.matrix-cell-input:focus') || container.querySelector('.matrix-cell-input');
      if (activeInput) {
        activeInput.value = text;
        showToast(`Fracción ${text} asignada en Esquina ${isA ? 'Roja [A]' : 'Azul [B]'} [Fila ${parseInt(activeInput.dataset.r, 10) + 1}, Col ${parseInt(activeInput.dataset.c, 10) + 1}]`, 'success');
      }
      const card = document.getElementById(isA ? 'panel-matrix-a' : 'panel-matrix-b');
      if (card) card.scrollIntoView({ behavior: 'smooth' });
      if (window.sportsAudio) window.sportsAudio.playPunch();
    }

    if (btnSendConvToA) btnSendConvToA.addEventListener('click', () => sendFractionToMatrix('a'));
    if (btnSendConvToB) btnSendConvToB.addEventListener('click', () => sendFractionToMatrix('b'));

    // 2. FRACCIÓN A DECIMAL
    function runFracToDec() {
      if (!inputFracVal) return;
      const rawVal = inputFracVal.value.trim();
      if (!rawVal) {
        showToast("Ingresa una fracción para convertir.", "warning");
        return;
      }

      try {
        const res = Fraction.fractionToDecimalDetailed(rawVal);
        state.lastConvertedDecimal = res.displayDecimal;

        if (convOutputDecVal) convOutputDecVal.textContent = res.displayDecimal;
        if (badgeFracType) badgeFracType.textContent = res.analysis.type;

        if (badgeFracPeriod) {
          if (res.analysis.isPeriodic && res.analysis.period) {
            badgeFracPeriod.textContent = `Período: ${res.analysis.period}`;
            badgeFracPeriod.style.display = 'inline-block';
          } else {
            badgeFracPeriod.style.display = 'none';
          }
        }

        if (convStepsFracList) {
          convStepsFracList.innerHTML = res.steps
            .map(step => `<div class="conv-step-item">${step}</div>`)
            .join('');
        }

        if (window.sportsAudio) window.sportsAudio.playPunch();
        showToast(`¡Fracción transformada a decimal: ${res.displayDecimal}!`, 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }

    if (btnExecuteFracToDec) btnExecuteFracToDec.addEventListener('click', runFracToDec);
    if (inputFracVal) {
      inputFracVal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') runFracToDec();
      });
    }

    // Chips de ejemplo fracción
    document.querySelectorAll('.btn-quick-frac').forEach(chip => {
      chip.addEventListener('click', () => {
        if (inputFracVal) {
          inputFracVal.value = chip.dataset.frac;
          runFracToDec();
        }
      });
    });

    // Copiar decimal resultante
    if (btnCopyConvDec) {
      btnCopyConvDec.addEventListener('click', () => {
        const text = state.lastConvertedDecimal || '0.75';
        navigator.clipboard.writeText(text).then(() => {
          showToast(`Decimal "${text}" copiado al portapapeles.`, 'success');
        }).catch(() => {
          showToast(`Decimal: ${text}`, 'info');
        });
      });
    }

    // Enviar decimal a Matriz A o B
    function sendDecimalToMatrix(target) {
      const isA = target === 'a';
      const container = isA ? gridA : gridB;
      const text = state.lastConvertedDecimal || '0.75';
      
      const activeInput = container.querySelector('.matrix-cell-input:focus') || container.querySelector('.matrix-cell-input');
      if (activeInput) {
        activeInput.value = text;
        showToast(`Decimal ${text} asignado en Esquina ${isA ? 'Roja [A]' : 'Azul [B]'} [Fila ${parseInt(activeInput.dataset.r, 10) + 1}, Col ${parseInt(activeInput.dataset.c, 10) + 1}]`, 'success');
      }
      const card = document.getElementById(isA ? 'panel-matrix-a' : 'panel-matrix-b');
      if (card) card.scrollIntoView({ behavior: 'smooth' });
      if (window.sportsAudio) window.sportsAudio.playPunch();
    }

    if (btnSendDecToA) btnSendDecToA.addEventListener('click', () => sendDecimalToMatrix('a'));
    if (btnSendDecToB) btnSendDecToB.addEventListener('click', () => sendDecimalToMatrix('b'));

    // Ejecución inicial de demostración
    try {
      runDecToFrac();
      runFracToDec();
    } catch (e) {}
  }

  /* ============================================================
     REQUERIMIENTO 2: TRANSPUESTA (CAMBIO DE GUARDIA Aᵀ / Bᵀ)
     ============================================================ */
  function executeTranspose(target) {
    try {
      const mat = readMatrix(target);
      const isRed = target === 'a';
      const name = isRed ? 'Esquina Roja [A]' : 'Esquina Azul [B]';
      const transposeData = mat.transpose();

      displayResult({
        title: `Cambio de Guardia: Transpuesta ${isRed ? '[A]ᵀ' : '[B]ᵀ'}`,
        summary: `Se intercambiaron filas por columnas: la matriz de ${mat.rows}×${mat.cols} cambió a guardia ${transposeData.result.rows}×${transposeData.result.cols}.`,
        matrix: transposeData.result,
        icon: '[T]',
        steps: transposeData.steps.map(s => ({
          row: s.to[0] + 1,
          col: s.to[1] + 1,
          htmlFormula: `Posición original [${s.from[0] + 1}, ${s.from[1] + 1}] pasa a guardia [${s.to[0] + 1}, ${s.to[1] + 1}] con valor <strong>${s.htmlVal}</strong>`
        }))
      });

      if (window.sportsAudio) window.sportsAudio.playBoxingBell(1);
      showToast(`¡Transpuesta de ${name} ejecutada en el cuadrilátero!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
      if (window.sportsAudio) window.sportsAudio.playPunch();
    }
  }

  const btnTransA = document.getElementById('btn-transpose-a');
  if (btnTransA) btnTransA.addEventListener('click', () => executeTranspose('a'));

  const btnTransB = document.getElementById('btn-transpose-b');
  if (btnTransB) btnTransB.addEventListener('click', () => executeTranspose('b'));

  /* ============================================================
     REQUERIMIENTO 3: DIAGONAL PRINCIPAL (GOLPE DIRECTO Y TRAZA)
     ============================================================ */
  function executeMainDiagonal(target) {
    try {
      const mat = readMatrix(target);
      const isRed = target === 'a';
      const name = isRed ? 'Esquina Roja [A]' : 'Esquina Azul [B]';
      const diagData = mat.getMainDiagonal();

      const statsHtml = `
        <div class="diagonal-stats-badge">
          <div class="diagonal-stat-card ${isRed ? '' : 'sec-stat'}">
            <div class="stat-header">[DP] Golpe Directo: Diagonal Principal ${isRed ? '[A]' : '[B]'} (i = j)</div>
            <div class="stat-elements-list">
              Impactos: { ${diagData.elements.map(e => e.toHTML()).join(', ')} }
            </div>
            <div class="stat-trace-sum">
              Traza del Asalto tr(${isRed ? '[A]' : '[B]'}) = Suma de Impactos: <strong>${diagData.traceHTML}</strong>
            </div>
          </div>
        </div>
      `;

      displayResult({
        title: `Línea de Golpe Directo: Diagonal Principal de ${isRed ? '[A]' : '[B]'}`,
        summary: diagData.isSquare 
          ? `Impactos directos a lo largo de la diagonal principal (i = j). Resaltados en el cuadrilátero.` 
          : `Matriz rectangular (${mat.rows}×${mat.cols}): calculada para los elementos diagonales del cuadrilátero.`,
        matrix: mat,
        highlightType: 'main-diag',
        icon: '[DP]',
        specialStatsHtml: statsHtml,
        steps: diagData.positions.map((pos, idx) => ({
          row: pos[0] + 1,
          col: pos[1] + 1,
          htmlFormula: `Elemento diagonal en [${pos[0] + 1}, ${pos[1] + 1}]: <strong>${diagData.elements[idx].toHTML()}</strong>`
        }))
      });

      if (window.sportsAudio) window.sportsAudio.playBoxingBell(1);
      showToast(`Diagonal Principal y Traza de ${name} calculadas`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
      if (window.sportsAudio) window.sportsAudio.playPunch();
    }
  }

  const btnDiagMainA = document.getElementById('btn-diag-main-a');
  if (btnDiagMainA) btnDiagMainA.addEventListener('click', () => executeMainDiagonal('a'));

  const btnDiagMainB = document.getElementById('btn-diag-main-b');
  if (btnDiagMainB) btnDiagMainB.addEventListener('click', () => executeMainDiagonal('b'));

  /* ============================================================
     REQUERIMIENTO 4: DIAGONAL SECUNDARIA (GANCHO CRUZADO Y SUMA)
     ============================================================ */
  function executeSecondaryDiagonal(target) {
    try {
      const mat = readMatrix(target);
      const isRed = target === 'a';
      const name = isRed ? 'Esquina Roja [A]' : 'Esquina Azul [B]';
      const diagData = mat.getSecondaryDiagonal();

      const statsHtml = `
        <div class="diagonal-stats-badge">
          <div class="diagonal-stat-card sec-stat">
            <div class="stat-header">[DS] Gancho Cruzado: Diagonal Secundaria ${isRed ? '[A]' : '[B]'}</div>
            <div class="stat-elements-list">
              Impactos: { ${diagData.elements.map(e => e.toHTML()).join(', ')} }
            </div>
            <div class="stat-trace-sum">
              Suma del Gancho = <strong>${diagData.sumHTML}</strong>
            </div>
          </div>
        </div>
      `;

      displayResult({
        title: `Gancho Cruzado: Diagonal Secundaria de ${isRed ? '[A]' : '[B]'}`,
        summary: diagData.isSquare 
          ? `Trayectoria cruzada desde la esquina superior derecha hasta la inferior izquierda.` 
          : diagData.note,
        matrix: mat,
        highlightType: 'sec-diag',
        icon: '[DS]',
        specialStatsHtml: statsHtml,
        steps: diagData.positions.map((pos, idx) => ({
          row: pos[0] + 1,
          col: pos[1] + 1,
          htmlFormula: `Elemento diagonal cruzado en [${pos[0] + 1}, ${pos[1] + 1}]: <strong>${diagData.elements[idx].toHTML()}</strong>`
        }))
      });

      if (window.sportsAudio) window.sportsAudio.playBoxingBell(1);
      showToast(`Diagonal Secundaria de ${name} conectada con éxito`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
      if (window.sportsAudio) window.sportsAudio.playPunch();
    }
  }

  const btnDiagSecA = document.getElementById('btn-diag-sec-a');
  if (btnDiagSecA) btnDiagSecA.addEventListener('click', () => executeSecondaryDiagonal('a'));

  const btnDiagSecB = document.getElementById('btn-diag-sec-b');
  if (btnDiagSecB) btnDiagSecB.addEventListener('click', () => executeSecondaryDiagonal('b'));

  /* ============================================================
     REQUERIMIENTO 5: SUMA Y RESTA DE MATRICES (GOLPE COMBINADO)
     ============================================================ */
  const btnOpAdd = document.getElementById('btn-op-add');
  if (btnOpAdd) {
    btnOpAdd.addEventListener('click', () => {
      try {
        const matA = readMatrix('a');
        const matB = readMatrix('b');
        const res = Matrix.add(matA, matB);

        displayResult({
          title: 'Golpe Combinado: Suma [A + B]',
          summary: `Suma reglamentaria elemento a elemento para matrices de ${matA.rows}×${matA.cols}.`,
          matrix: res.result,
          icon: '[+]',
          steps: res.steps
        });

        if (window.sportsAudio) window.sportsAudio.playKnockoutVictory();
        triggerConfetti();
        showToast('¡Ding! ¡Ding! ¡Ding! ¡Golpe combinado conectado con éxito!', 'success');
      } catch (err) {
        showToast(err.message, 'error');
        if (window.sportsAudio) window.sportsAudio.playPunch();
      }
    });
  }

  const btnOpSub = document.getElementById('btn-op-sub');
  if (btnOpSub) {
    btnOpSub.addEventListener('click', () => {
      try {
        const matA = readMatrix('a');
        const matB = readMatrix('b');
        const res = Matrix.subtract(matA, matB);

        displayResult({
          title: 'Contragolpe: Resta [A − B]',
          summary: `Diferencia término a término para matrices de ${matA.rows}×${matA.cols}.`,
          matrix: res.result,
          icon: '[-]',
          steps: res.steps
        });

        if (window.sportsAudio) window.sportsAudio.playKnockoutVictory();
        triggerConfetti();
        showToast('¡Contragolpe ejecutado con precisión en las tarjetas!', 'success');
      } catch (err) {
        showToast(err.message, 'error');
        if (window.sportsAudio) window.sportsAudio.playPunch();
      }
    });
  }

  /* ============================================================
     REQUERIMIENTO 6: PRODUCTO DE MATRICES (KNOCKOUT TÉCNICO A × B)
     ============================================================ */
  const btnOpMul = document.getElementById('btn-op-mul');
  if (btnOpMul) {
    btnOpMul.addEventListener('click', () => {
      try {
        const matA = readMatrix('a');
        const matB = readMatrix('b');
        const res = Matrix.multiply(matA, matB);

        displayResult({
          title: 'Ippon / Sumisión KO: Producto [A × B]',
          summary: `¡Finalización perfecta! ${res.dimInfo}.`,
          matrix: res.result,
          icon: '[×]',
          steps: res.steps
        });

        if (window.sportsAudio) window.sportsAudio.playKnockoutVictory();
        triggerConfetti();
        showToast('¡IPPON! ¡Sumisión y Knockout Técnico en el cuadrilátero!', 'success');
      } catch (err) {
        showToast(err.message, 'error');
        if (window.sportsAudio) window.sportsAudio.playPunch();
      }
    });
  }

  const btnOpMulBA = document.getElementById('btn-op-mul-ba');
  if (btnOpMulBA) {
    btnOpMulBA.addEventListener('click', () => {
      try {
        const matA = readMatrix('a');
        const matB = readMatrix('b');
        const res = Matrix.multiply(matB, matA); // B x A

        displayResult({
          title: 'Pase de Guardia: Producto Inverso [B × A]',
          summary: `Técnica invertida: ${res.dimInfo}.`,
          matrix: res.result,
          icon: '[B×A]',
          steps: res.steps
        });

        if (window.sportsAudio) window.sportsAudio.playKnockoutVictory();
        triggerConfetti();
        showToast('¡Pase de guardia [B × A] resuelto!', 'success');
      } catch (err) {
        showToast(err.message, 'error');
        if (window.sportsAudio) window.sportsAudio.playPunch();
      }
    });
  }

  /* ============================================================
     REQUERIMIENTO 7: MOSTRAR RESULTADO EN FORMATO MATRIZ DE COMBATE
     ============================================================ */
  function displayResult({
    title,
    summary,
    matrix,
    highlightType = null,
    icon = '[RES]',
    specialStatsHtml = null,
    steps = []
  }) {
    state.currentResultMatrix = matrix;
    state.currentResultOperation = title;
    state.currentHighlightType = highlightType;

    if (resultOpName) resultOpName.textContent = title;
    if (resultOpSummary) resultOpSummary.textContent = summary;
    const resIconEl = document.getElementById('result-icon');
    if (resIconEl) resIconEl.textContent = icon;

    // Estadísticas de diagonales si aplican
    if (diagonalStatsContainer) {
      if (specialStatsHtml) {
        diagonalStatsContainer.innerHTML = specialStatsHtml;
        diagonalStatsContainer.style.display = 'block';
      } else {
        diagonalStatsContainer.style.display = 'none';
        diagonalStatsContainer.innerHTML = '';
      }
    }

    // Renderizar la matriz con el formato activo (Fracción o Decimal)
    renderResultMatrix();

    // Configurar pasos con paginación y búsqueda para matrices grandes (30x30)
    state.currentSteps = steps || [];
    state.currentStepOffset = 0;
    state.stepPageSize = 25;

    if (state.currentSteps.length > 0) {
      renderBreakdownPage(false);
    } else {
      if (breakdownContent) breakdownContent.innerHTML = '<div class="breakdown-item">Cálculo completado directamente.</div>';
      if (breakdownFilterBar) breakdownFilterBar.style.display = 'none';
      if (breakdownLoadMoreWrap) breakdownLoadMoreWrap.style.display = 'none';
    }

    // Mostrar sección con animación fluida
    if (resultsArena) {
      resultsArena.style.display = 'block';
      resultsArena.classList.add('active');
      resultsArena.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderResultMatrix() {
    if (!state.currentResultMatrix || !matrixRenderStage) return;
    matrixRenderStage.innerHTML = state.currentResultMatrix.toHTML({
      highlightCells: state.currentHighlightType,
      displayMode: state.resultDisplayMode,
      decimalPlaces: 4,
      density: 'auto'
    });
  }

  // Alternador de formato de resultado: [½ Fracción] ⇄ [0.00 Decimal]
  if (btnResultFormatFrac) {
    btnResultFormatFrac.addEventListener('click', () => {
      btnResultFormatFrac.classList.add('active');
      if (btnResultFormatDec) btnResultFormatDec.classList.remove('active');
      state.resultDisplayMode = 'fraction';
      renderResultMatrix();
      showToast("Resultado mostrado en Fracciones exactas.", "info");
    });
  }

  if (btnResultFormatDec) {
    btnResultFormatDec.addEventListener('click', () => {
      btnResultFormatDec.classList.add('active');
      if (btnResultFormatFrac) btnResultFormatFrac.classList.remove('active');
      state.resultDisplayMode = 'decimal';
      renderResultMatrix();
      showToast("Resultado mostrado en formato Decimal aproximado.", "info");
    });
  }

  // Renderizado paginado de pasos para evitar sobrecargar el DOM en matrices 30x30
  function renderBreakdownPage(append = false) {
    if (!breakdownContent) return;
    const total = state.currentSteps.length;
    const isLarge = total > 25;

    if (breakdownFilterBar) {
      breakdownFilterBar.style.display = isLarge ? 'flex' : 'none';
    }

    const start = state.currentStepOffset;
    const end = Math.min(total, start + state.stepPageSize);
    const slice = state.currentSteps.slice(start, end);

    let html = '';
    slice.forEach(s => {
      const formulaHtml = s.getHtmlFormula ? s.getHtmlFormula() : (s.htmlFormula || s.textFormula);
      html += `
        <div class="breakdown-item" data-step-row="${s.row}" data-step-col="${s.col}">
          <span>Celda [${s.row}, ${s.col}]</span>
          <div>${formulaHtml}</div>
        </div>
      `;
    });

    if (append) {
      breakdownContent.insertAdjacentHTML('beforeend', html);
    } else {
      breakdownContent.innerHTML = html;
    }

    state.currentStepOffset = end;

    if (stepCountBadge) {
      stepCountBadge.textContent = isLarge ? `Mostrando ${end} de ${total} pasos` : `${total} pasos detallados`;
    }

    if (breakdownLoadMoreWrap) {
      breakdownLoadMoreWrap.style.display = end < total ? 'block' : 'none';
    }
  }

  // Búsqueda y filtro de celda específica en el desglose
  if (btnFilterStep) {
    btnFilterStep.addEventListener('click', () => {
      const r = parseInt(inputStepFilterR.value, 10);
      const c = parseInt(inputStepFilterC.value, 10);
      if (isNaN(r) || isNaN(c)) {
        showToast("Ingresa Fila y Columna válidas para consultar.", "warning");
        return;
      }

      const match = state.currentSteps.find(s => s.row === r && s.col === c);
      if (match) {
        const formulaHtml = match.getHtmlFormula ? match.getHtmlFormula() : (match.htmlFormula || match.textFormula);
        breakdownContent.innerHTML = `
          <div class="breakdown-item item-gold">
            <span><strong>Cálculo de la Celda [${match.row}, ${match.col}]</strong></span>
            <div>${formulaHtml}</div>
          </div>
        `;
        if (stepCountBadge) stepCountBadge.textContent = `Consulta específica de celda [${r}, ${c}]`;
        if (breakdownLoadMoreWrap) breakdownLoadMoreWrap.style.display = 'none';
        showToast(`Mostrando cálculo de celda [${r}, ${c}]`, 'info');
      } else {
        showToast(`No se encontró la celda [${r}, ${c}] en este asalto.`, 'warning');
      }
    });
  }

  if (btnResetStepFilter) {
    btnResetStepFilter.addEventListener('click', () => {
      state.currentStepOffset = 0;
      renderBreakdownPage(false);
      showToast("Mostrando primeros pasos del asalto.", "info");
    });
  }

  if (btnLoadMoreSteps) {
    btnLoadMoreSteps.addEventListener('click', () => {
      renderBreakdownPage(true);
    });
  }

  // Toggle de la Tarjeta Oficial de los Jueces
  if (breakdownHeader) {
    breakdownHeader.addEventListener('click', () => {
      const isHidden = breakdownContent.style.display === 'none';
      breakdownContent.style.display = isHidden ? 'grid' : 'none';
      if (breakdownFilterBar && state.currentSteps.length > 25) {
        breakdownFilterBar.style.display = isHidden ? 'flex' : 'none';
      }
      if (breakdownLoadMoreWrap && state.currentStepOffset < state.currentSteps.length) {
        breakdownLoadMoreWrap.style.display = isHidden ? 'block' : 'none';
      }
      if (breakdownToggleBtn) breakdownToggleBtn.textContent = isHidden ? '-' : '+';
      breakdownHeader.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });
  }

  /* ============================================================
     ENVIAR RESULTADO A ESQUINA ROJA O AZUL
     ============================================================ */
  const btnCopyToA = document.getElementById('btn-copy-to-a');
  if (btnCopyToA) {
    btnCopyToA.addEventListener('click', () => {
      if (!state.currentResultMatrix) {
        showToast("No hay matriz resultado disponible para transferir.", "warning");
        return;
      }
      const mat = state.currentResultMatrix;
      state.rowsA = mat.rows;
      state.colsA = mat.cols;
      if (rowsAInput) rowsAInput.value = mat.rows;
      if (colsAInput) colsAInput.value = mat.cols;

      const dataVals = [];
      for (let r = 0; r < mat.rows; r++) {
        const row = [];
        for (let c = 0; c < mat.cols; c++) {
          row.push(mat.get(r, c).toString());
        }
        dataVals.push(row);
      }

      renderMatrixInputs('a', mat.rows, mat.cols, dataVals);
      updateScoreboardAndCompatibility();
      if (window.sportsAudio) window.sportsAudio.playPunch();
      showToast("Resultado transferido a la Esquina Roja [A]", "info");
      const pA = document.getElementById('panel-matrix-a');
      if (pA) pA.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const btnCopyToB = document.getElementById('btn-copy-to-b');
  if (btnCopyToB) {
    btnCopyToB.addEventListener('click', () => {
      if (!state.currentResultMatrix) {
        showToast("No hay matriz resultado disponible para transferir.", "warning");
        return;
      }
      const mat = state.currentResultMatrix;
      state.rowsB = mat.rows;
      state.colsB = mat.cols;
      if (rowsBInput) rowsBInput.value = mat.rows;
      if (colsBInput) colsBInput.value = mat.cols;

      const dataVals = [];
      for (let r = 0; r < mat.rows; r++) {
        const row = [];
        for (let c = 0; c < mat.cols; c++) {
          row.push(mat.get(r, c).toString());
        }
        dataVals.push(row);
      }

      renderMatrixInputs('b', mat.rows, mat.cols, dataVals);
      updateScoreboardAndCompatibility();
      if (window.sportsAudio) window.sportsAudio.playPunch();
      showToast("Resultado transferido a la Esquina Azul [B]", "info");
      const pB = document.getElementById('panel-matrix-b');
      if (pB) pB.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Toggle de Sonido del Ring
  if (btnToggleSound) {
    btnToggleSound.addEventListener('click', () => {
      const isEnabled = window.sportsAudio ? window.sportsAudio.toggleSound() : true;
      if (soundIcon) soundIcon.textContent = isEnabled ? 'AUDIO ON' : 'AUDIO OFF';
      showToast(isEnabled ? "Campana y efectos de ring activados" : "Efectos silenciados", "info");
      if (isEnabled && window.sportsAudio) {
        window.sportsAudio.playBoxingBell(1);
      }
    });
  }

  if (btnBrandSound) {
    btnBrandSound.addEventListener('click', () => {
      if (window.sportsAudio) window.sportsAudio.playBoxingBell(3);
      showToast("¡Ding! ¡Ding! ¡Ding! ¡Campana oficial del cuadrilátero!", "info");
    });
  }

  /* ============================================================
     SISTEMA DE NOTIFICACIONES TOAST DE ASALTO
     ============================================================ */
  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `sport-toast ${type === 'error' ? 'toast-error' : type === 'warning' ? 'toast-warning' : ''}`;
    
    let icon = '[INFO]';
    if (type === 'success') icon = '[OK]';
    if (type === 'error') icon = '[ERROR]';
    if (type === 'warning') icon = '[AVISO]';

    toast.innerHTML = `
      <span style="font-weight: 800; font-size: 0.85rem; font-family: var(--font-heading); color: var(--belt-gold);">${icon}</span>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 350);
    }, 3800);
  }

  /* ============================================================
     MOTOR DE CONFETTI DE CAMPEONATO MUNDIAL (CANVAS NATIVO)
     ============================================================ */
  const canvas = document.getElementById('confetti-canvas');
  let ctx = null;
  if (canvas) {
    ctx = canvas.getContext('2d');
  }
  let confettiParticles = [];
  let confettiAnimId = null;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function triggerConfetti() {
    if (!canvas || !ctx) return;
    cancelAnimationFrame(confettiAnimId);
    confettiParticles = [];

    const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#ffffff', '#fbbf24'];
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      confettiParticles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.45,
        w: Math.random() * 8 + 4,
        h: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.8) * 14,
        gravity: 0.32,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
        opacity: 1
      });
    }

    animateConfetti();
  }

  function animateConfetti() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeParticles = 0;

    for (let p of confettiParticles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotSpeed;
      p.opacity -= 0.01;

      if (p.opacity > 0 && p.y < canvas.height) {
        activeParticles++;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    }

    if (activeParticles > 0) {
      confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Inicializar cuadrículas de combate
  initGrids();
});
