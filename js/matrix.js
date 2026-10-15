/**
 * Matrix.js - Clase de álgebra lineal con soporte exacto de fracciones.
 * Implementa todas las operaciones del enunciado:
 * 1) Tamaño dinámico
 * 2) Transpuesta
 * 3) Diagonal Principal (+ Traza)
 * 4) Diagonal Secundaria (+ Suma)
 * 5) Suma y Resta
 * 6) Producto de matrices con desglose paso a paso
 * 7) Renderizado en formato matriz con corchetes
 * 8) Integración completa con Fraction.js
 */

class Matrix {
  constructor(rows, cols, initialValue = 0) {
    if (rows <= 0 || cols <= 0) {
      throw new Error("Las filas y columnas deben ser enteros positivos mayores que cero.");
    }
    this.rows = parseInt(rows, 10);
    this.cols = parseInt(cols, 10);
    this.data = [];

    const defaultFraction = initialValue instanceof Fraction ? initialValue : new Fraction(initialValue);

    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        row.push(new Fraction(defaultFraction));
      }
      this.data.push(row);
    }
  }

  get(r, c) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) {
      throw new Error(`Índice fuera de límites: [${r}, ${c}] para matriz ${this.rows}x${this.cols}`);
    }
    return this.data[r][c];
  }

  set(r, c, value) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) {
      throw new Error(`Índice fuera de límites: [${r}, ${c}] para matriz ${this.rows}x${this.cols}`);
    }
    this.data[r][c] = value instanceof Fraction ? value : new Fraction(value);
  }

  clone() {
    const copy = new Matrix(this.rows, this.cols);
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        copy.set(r, c, this.get(r, c));
      }
    }
    return copy;
  }

  isSquare() {
    return this.rows === this.cols;
  }

  /* ============================================================
     2) TRANSPUESTA (A^T)
     ============================================================ */
  transpose() {
    const result = new Matrix(this.cols, this.rows);
    const steps = [];

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const val = this.get(r, c);
        result.set(c, r, val);
        steps.push({
          from: [r, c],
          to: [c, r],
          value: val.toString(),
          htmlVal: val.toHTML()
        });
      }
    }

    return {
      result,
      steps,
      description: `Se intercambian las filas por columnas: el elemento en fila ${this.rows} y columna ${this.cols} pasa a posición inversa.`
    };
  }

  /* ============================================================
     3) DIAGONAL PRINCIPAL (i == j)
     ============================================================ */
  getMainDiagonal() {
    const length = Math.min(this.rows, this.cols);
    const elements = [];
    const positions = [];
    let trace = new Fraction(0n, 1n);

    for (let i = 0; i < length; i++) {
      const val = this.get(i, i);
      elements.push(val);
      positions.push([i, i]);
      trace = trace.add(val);
    }

    return {
      elements,
      positions,
      trace,
      isSquare: this.isSquare(),
      formulaText: elements.map(e => e.toString()).join(' + '),
      traceString: trace.toString(),
      traceHTML: trace.toHTML()
    };
  }

  /* ============================================================
     4) DIAGONAL SECUNDARIA (c == cols - 1 - r)
     ============================================================ */
  getSecondaryDiagonal() {
    if (!this.isSquare()) {
      // Para matrices no cuadradas, se toma con respecto al tamaño mínimo o cuadrado contenido
      const minDim = Math.min(this.rows, this.cols);
      const elements = [];
      const positions = [];
      let sum = new Fraction(0n, 1n);

      for (let r = 0; r < minDim; r++) {
        const c = minDim - 1 - r;
        const val = this.get(r, c);
        elements.push(val);
        positions.push([r, c]);
        sum = sum.add(val);
      }

      return {
        elements,
        positions,
        sum,
        isSquare: false,
        note: `Matriz rectangular (${this.rows}×${this.cols}): calculada sobre el subbloque cuadrado superior ${minDim}×${minDim}.`,
        formulaText: elements.map(e => e.toString()).join(' + '),
        sumString: sum.toString(),
        sumHTML: sum.toHTML()
      };
    }

    const elements = [];
    const positions = [];
    let sum = new Fraction(0n, 1n);

    for (let r = 0; r < this.rows; r++) {
      const c = this.cols - 1 - r;
      const val = this.get(r, c);
      elements.push(val);
      positions.push([r, c]);
      sum = sum.add(val);
    }

    return {
      elements,
      positions,
      sum,
      isSquare: true,
      formulaText: elements.map(e => e.toString()).join(' + '),
      sumString: sum.toString(),
      sumHTML: sum.toHTML()
    };
  }

  /* ============================================================
     5) SUMA Y RESTA DE MATRICES
     ============================================================ */
  static add(matrixA, matrixB) {
    if (matrixA.rows !== matrixB.rows || matrixA.cols !== matrixB.cols) {
      throw new Error(
        `¡Falta en el terreno de juego! Para sumar matrices deben tener idénticas dimensiones. ` +
        `Matriz A es de ${matrixA.rows}×${matrixA.cols} y Matriz B es de ${matrixB.rows}×${matrixB.cols}.`
      );
    }

    const result = new Matrix(matrixA.rows, matrixA.cols);
    const steps = [];

    for (let r = 0; r < matrixA.rows; r++) {
      for (let c = 0; c < matrixA.cols; c++) {
        const aVal = matrixA.get(r, c);
        const bVal = matrixB.get(r, c);
        const sumVal = aVal.add(bVal);
        result.set(r, c, sumVal);

        steps.push({
          row: r + 1,
          col: c + 1,
          rIndex: r,
          cIndex: c,
          aVal: aVal.toString(),
          bVal: bVal.toString(),
          sumVal: sumVal.toString(),
          textFormula: `${aVal.toString()} + (${bVal.toString()}) = ${sumVal.toString()}`,
          htmlFormula: `C<sub>${r + 1},${c + 1}</sub> = ${aVal.toHTML()} + ${bVal.toHTML()} = <strong>${sumVal.toHTML()}</strong>`
        });
      }
    }

    return { result, steps, operation: 'Suma (A + B)' };
  }

  static subtract(matrixA, matrixB) {
    if (matrixA.rows !== matrixB.rows || matrixA.cols !== matrixB.cols) {
      throw new Error(
        `Para restar matrices deben tener idénticas dimensiones. ` +
        `Matriz A es de ${matrixA.rows}×${matrixA.cols} y Matriz B es de ${matrixB.rows}×${matrixB.cols}.`
      );
    }

    const result = new Matrix(matrixA.rows, matrixA.cols);
    const steps = [];

    for (let r = 0; r < matrixA.rows; r++) {
      for (let c = 0; c < matrixA.cols; c++) {
        const aVal = matrixA.get(r, c);
        const bVal = matrixB.get(r, c);
        const subVal = aVal.sub(bVal);
        result.set(r, c, subVal);

        steps.push({
          row: r + 1,
          col: c + 1,
          rIndex: r,
          cIndex: c,
          aVal: aVal.toString(),
          bVal: bVal.toString(),
          subVal: subVal.toString(),
          textFormula: `${aVal.toString()} − (${bVal.toString()}) = ${subVal.toString()}`,
          htmlFormula: `C<sub>${r + 1},${c + 1}</sub> = ${aVal.toHTML()} − ${bVal.toHTML()} = <strong>${subVal.toHTML()}</strong>`
        });
      }
    }

    return { result, steps, operation: 'Resta (A − B)' };
  }

  /* ============================================================
     6) PRODUCTO DE MATRICES (A × B)
     ============================================================ */
  static multiply(matrixA, matrixB) {
    if (matrixA.cols !== matrixB.rows) {
      throw new Error(
        `¡Regla de juego infringida! Para multiplicar matrices, las COLUMNAS de A (${matrixA.cols}) ` +
        `deben ser iguales a las FILAS de B (${matrixB.rows}).`
      );
    }

    const result = new Matrix(matrixA.rows, matrixB.cols);
    const steps = [];

    for (let r = 0; r < matrixA.rows; r++) {
      for (let c = 0; c < matrixB.cols; c++) {
        let cellSum = new Fraction(0n, 1n);
        const subProducts = [];
        const subProductsText = [];

        for (let k = 0; k < matrixA.cols; k++) {
          const aElem = matrixA.get(r, k);
          const bElem = matrixB.get(k, c);
          const prod = aElem.mul(bElem);
          cellSum = cellSum.add(prod);

          subProducts.push({
            a: aElem,
            b: bElem,
            prod: prod
          });

          subProductsText.push(`(${aElem.toString()} × ${bElem.toString()})`);
        }

        result.set(r, c, cellSum);

        // Para matrices grandes (ej: 30x30 con 900 celdas), construir la fórmula
        // bajo demanda o para los primeros pasos para evitar saturar el DOM en móviles.
        const isLarge = (matrixA.rows * matrixB.cols) > 36;
        const generateFullHTML = !isLarge || steps.length < 25;

        let htmlFormula = '';
        if (generateFullHTML) {
          const htmlDetails = subProducts
            .map(sp => `(${sp.a.toHTML()} × ${sp.b.toHTML()})`)
            .join(' + ');

          const intermediateHtml = subProducts
            .map(sp => sp.prod.toHTML())
            .join(' + ');

          htmlFormula = `
            <div class="prod-step-calc">
              <span class="cell-label">C<sub>${r + 1},${c + 1}</sub> = Fila ${r + 1}(A) · Col ${c + 1}(B)</span>
              <div class="prod-expanded">${htmlDetails}</div>
              <div class="prod-intermediate">= ${intermediateHtml}</div>
              <div class="prod-final"><strong>= ${cellSum.toHTML()}</strong></div>
            </div>
          `;
        }

        steps.push({
          row: r + 1,
          col: c + 1,
          rIndex: r,
          cIndex: c,
          resultVal: cellSum.toString(),
          resultHTML: cellSum.toHTML(),
          subProducts: isLarge ? subProducts : null,
          textFormula: `C[${r + 1},${c + 1}] = ${subProductsText.join(' + ')} = ${cellSum.toString()}`,
          htmlFormula: htmlFormula,
          getHtmlFormula: function() {
            if (this.htmlFormula) return this.htmlFormula;
            const details = (this.subProducts || subProducts)
              .map(sp => `(${sp.a.toHTML()} × ${sp.b.toHTML()})`)
              .join(' + ');
            const inter = (this.subProducts || subProducts)
              .map(sp => sp.prod.toHTML())
              .join(' + ');
            return `
              <div class="prod-step-calc">
                <span class="cell-label">C<sub>${this.row},${this.col}</sub> = Fila ${this.row}(A) · Col ${this.col}(B)</span>
                <div class="prod-expanded">${details}</div>
                <div class="prod-intermediate">= ${inter}</div>
                <div class="prod-final"><strong>= ${cellSum.toHTML()}</strong></div>
              </div>
            `;
          }
        });
      }
    }

    return {
      result,
      steps,
      operation: 'Multiplicación (A × B)',
      dimInfo: `${matrixA.rows}×${matrixA.cols} por ${matrixB.rows}×${matrixB.cols} da como resultado una matriz ${matrixA.rows}×${matrixB.cols}`
    };
  }

  /* ============================================================
     PRODUCTO POR ESCALAR (k * A)
     ============================================================ */
  multiplyScalar(scalar) {
    const k = scalar instanceof Fraction ? scalar : new Fraction(scalar);
    const result = new Matrix(this.rows, this.cols);
    const steps = [];

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const val = this.get(r, c);
        const prod = val.mul(k);
        result.set(r, c, prod);
        steps.push({
          row: r + 1,
          col: c + 1,
          kVal: k.toString(),
          val: val.toString(),
          prodVal: prod.toString()
        });
      }
    }

    return { result, steps, scalar: k };
  }

  /* ============================================================
     DETERMINANTE CON FRACCIONES EXACTAS
     ============================================================ */
  determinant() {
    if (!this.isSquare()) {
      throw new Error("El determinante solo está definido para matrices cuadradas (N×N).");
    }

    const n = this.rows;

    // Caso 1x1
    if (n === 1) {
      return { det: this.get(0, 0), method: '1x1' };
    }

    // Caso 2x2
    if (n === 2) {
      // a*d - b*c
      const a = this.get(0, 0);
      const b = this.get(0, 1);
      const c = this.get(1, 0);
      const d = this.get(1, 1);
      const det = a.mul(d).sub(b.mul(c));
      return {
        det,
        method: '2x2',
        formula: `(${a.toString()} × ${d.toString()}) − (${b.toString()} × ${c.toString()}) = ${det.toString()}`
      };
    }

    // Eliminación Gaussiana exacta con fracciones
    const mat = [];
    for (let i = 0; i < n; i++) {
      mat.push([]);
      for (let j = 0; j < n; j++) {
        mat[i].push(new Fraction(this.get(i, j)));
      }
    }

    let detSign = 1n;

    for (let col = 0; col < n; col++) {
      // Buscar pivote no nulo
      let pivotRow = col;
      while (pivotRow < n && mat[pivotRow][col].isZero()) {
        pivotRow++;
      }

      if (pivotRow === n) {
        // Columna de ceros -> det = 0
        return { det: new Fraction(0n, 1n), method: 'Eliminación Gaussiana Exacta' };
      }

      if (pivotRow !== col) {
        // Intercambiar filas (cambia el signo del determinante)
        const temp = mat[col];
        mat[col] = mat[pivotRow];
        mat[pivotRow] = temp;
        detSign = -detSign;
      }

      const pivot = mat[col][col];

      for (let r = col + 1; r < n; r++) {
        if (!mat[r][col].isZero()) {
          const factor = mat[r][col].div(pivot);
          for (let c = col; c < n; c++) {
            mat[r][c] = mat[r][c].sub(factor.mul(mat[col][c]));
          }
        }
      }
    }

    let detVal = new Fraction(detSign, 1n);
    for (let i = 0; i < n; i++) {
      detVal = detVal.mul(mat[i][i]);
    }

    return {
      det: detVal,
      method: 'Eliminación Gaussiana Exacta',
      formula: `Producto de la diagonal superior: ${detVal.toString()}`
    };
  }

  /* ============================================================
     7) RENDERIZADO EN FORMATO MATRIZ VISUAL CON CORCHETES
     ============================================================ */
  toHTML(options = {}) {
    const {
      highlightCells = [], // Array de [r, c] o 'main-diag' o 'sec-diag'
      highlightClass = 'highlight-sport',
      interactive = false,
      name = 'M',
      displayMode = 'fraction', // 'fraction' | 'decimal'
      decimalPlaces = 4,
      density = 'auto' // 'normal', 'compact', 'mini', 'micro', 'auto'
    } = options;

    let isMainDiag = highlightCells === 'main-diag';
    let isSecDiag = highlightCells === 'sec-diag';

    let gridHtml = '';
    for (let r = 0; r < this.rows; r++) {
      let rowHtml = `<div class="matrix-row" data-row="${r}">`;
      for (let c = 0; c < this.cols; c++) {
        const val = this.get(r, c);
        let cellClass = 'matrix-cell';

        if (isMainDiag && r === c) {
          cellClass += ' cell-highlight-main';
        } else if (isSecDiag && (this.isSquare() ? c === this.cols - 1 - r : c === Math.min(this.rows, this.cols) - 1 - r)) {
          cellClass += ' cell-highlight-sec';
        } else if (Array.isArray(highlightCells)) {
          const match = highlightCells.some(([hr, hc]) => hr === r && hc === c);
          if (match) cellClass += ` ${highlightClass}`;
        }

        let cellContent;
        if (displayMode === 'decimal') {
          cellContent = `<span class="val-decimal" title="Exacto: ${val.toString()}">${val.toDecimalString(decimalPlaces)}</span>`;
        } else {
          cellContent = val.toHTML();
        }

        rowHtml += `
          <div class="${cellClass}" title="Posición [${r + 1}, ${c + 1}] = ${val.toString()}" data-r="${r}" data-c="${c}">
            ${cellContent}
          </div>
        `;
      }
      rowHtml += `</div>`;
      gridHtml += rowHtml;
    }

    let densityClass = '';
    if (density === 'micro' || (density === 'auto' && this.cols > 20)) {
      densityClass = 'grid-micro';
    } else if (density === 'mini' || (density === 'auto' && this.cols > 12)) {
      densityClass = 'grid-mini';
    } else if (density === 'compact' || (density === 'auto' && this.cols > 6)) {
      densityClass = 'grid-compact';
    } else if (this.cols > 8) {
      densityClass = 'grid-ultra-dense';
    } else if (this.cols > 5) {
      densityClass = 'grid-dense';
    }

    return `
      <div class="matrix-bracket-container ${densityClass}">
        <div class="matrix-bracket bracket-left"></div>
        <div class="matrix-grid-display ${densityClass}" style="--grid-cols: ${this.cols};">
          ${gridHtml}
        </div>
        <div class="matrix-bracket bracket-right"></div>
      </div>
    `;
  }
}

// Global browser o Node export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Matrix;
} else {
  window.Matrix = Matrix;
}
