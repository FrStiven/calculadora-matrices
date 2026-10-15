/**
 * Fraction.js - Motor matemático de aritmética exacta con fracciones y conversor decimal.
 * Soporta enteros, fracciones (ej: 3/4, -5/2), decimales (ej: 0.75, 0,5),
 * decimales periódicos (ej: 0.(3), 0.1(6), 0.333...), números mixtos (ej: 2 1/2)
 * y cálculo sin pérdida de precisión usando BigInt.
 */

class Fraction {
  /**
   * @param {number|bigint|string|Fraction} num - Numerador o string de fracción/decimal
   * @param {number|bigint|string} [den=1n] - Denominador
   */
  constructor(num = 0n, den = 1n) {
    if (num instanceof Fraction) {
      this.n = num.n;
      this.d = num.d;
      return;
    }

    if (typeof num === 'string') {
      const parsed = Fraction.fromString(num);
      this.n = parsed.n;
      this.d = parsed.d;
      return;
    }

    let n = BigInt(num);
    let d = BigInt(den);

    if (d === 0n) {
      throw new Error("División por cero: el denominador no puede ser 0");
    }

    // Normalizar signos (el denominador siempre es positivo)
    if (d < 0n) {
      n = -n;
      d = -d;
    }

    if (n === 0n) {
      this.n = 0n;
      this.d = 1n;
    } else {
      const g = Fraction.gcd(Fraction.absBigInt(n), d);
      this.n = n / g;
      this.d = d / g;
    }
  }

  static gcd(a, b) {
    let x = a < 0n ? -a : a;
    let y = b < 0n ? -b : b;
    while (y !== 0n) {
      const t = y;
      y = x % y;
      x = t;
    }
    return x;
  }

  static absBigInt(x) {
    return x < 0n ? -x : x;
  }

  /**
   * Calcula la raíz n-ésima entera exacta de un BigInt si existe, o null si no es exacta.
   * @param {bigint} val 
   * @param {bigint} root 
   * @returns {bigint|null}
   */
  static integerNthRoot(val, root) {
    if (val === 0n) return 0n;
    if (val === 1n) return 1n;
    if (root === 1n) return val;
    if (val < 0n) return null;

    if (root === 2n) {
      let x0 = val / 2n;
      if (x0 !== 0n) {
        let x1 = (x0 + val / x0) / 2n;
        while (x1 < x0) {
          x0 = x1;
          x1 = (x0 + val / x0) / 2n;
        }
        if (x0 * x0 === val) return x0;
      } else {
        if (1n * 1n === val) return 1n;
      }
      return null;
    }

    const valNum = Number(val);
    const rootNum = Number(root);
    if (!isFinite(valNum)) return null;
    let approx = BigInt(Math.round(Math.pow(valNum, 1 / rootNum)));
    if (approx < 1n) approx = 1n;
    for (let delta of [0n, -1n, 1n, -2n, 2n]) {
      const cand = approx + delta;
      if (cand >= 0n && cand ** root === val) {
        return cand;
      }
    }
    return null;
  }

  /**
   * Elimina paréntesis exteriores redundantes si envuelven toda la expresión.
   * Ej: "((81))" -> "81", "(3/4)" -> "3/4", pero "(81)^1/2" -> "(81)^1/2"
   */
  static cleanParens(str) {
    let s = str.trim();
    while (s.startsWith('(') && s.endsWith(')')) {
      let depth = 0;
      let matches = true;
      for (let i = 0; i < s.length - 1; i++) {
        if (s[i] === '(') depth++;
        else if (s[i] === ')') depth--;
        if (depth === 0) {
          matches = false;
          break;
        }
      }
      if (matches) {
        s = s.slice(1, -1).trim();
      } else {
        break;
      }
    }
    return s;
  }

  /**
   * Convierte un valor numérico de punto flotante a Fraction reducida.
   * @param {number} val
   * @param {number} [maxDecimals=6]
   * @returns {Fraction}
   */
  static fromDecimal(val, maxDecimals = 6) {
    if (typeof val !== 'number') val = Number(val);
    if (!isFinite(val)) throw new Error("Valor decimal infinito o no numérico");
    if (Number.isInteger(val)) return new Fraction(BigInt(val), 1n);

    const sign = val < 0 ? -1n : 1n;
    const absVal = Math.abs(val);

    const fixed = absVal.toFixed(maxDecimals).replace(/\.?0+$/, '');
    const parts = fixed.split('.');
    if (parts.length === 1) {
      return new Fraction(sign * BigInt(parts[0]), 1n);
    }

    const intPart = parts[0];
    const decPart = parts[1];
    const den = 10n ** BigInt(decPart.length);
    const num = BigInt(intPart + decPart);

    return new Fraction(sign * num, den);
  }

  /**
   * Eleva una fracción baseFrac a un exponente fraccionario expFrac: (baseFrac) ^ (expFrac)
   * Soporta potencias enteras, exponentes negativos y raíces (1/2, 1/3, etc.).
   */
  static pow(baseFrac, expFrac) {
    const base = baseFrac instanceof Fraction ? baseFrac : new Fraction(baseFrac);
    const exp = expFrac instanceof Fraction ? expFrac : new Fraction(expFrac);

    const ne = exp.n;
    const de = exp.d;

    if (base.n === 0n) {
      if (ne < 0n) throw new Error("0 no puede elevarse a una potencia negativa");
      return new Fraction(0n, 1n);
    }

    // Raíz de orden par de base negativa en números reales
    if (base.n < 0n && de % 2n === 0n) {
      throw new Error(`Raíz de orden par (${de}) de número negativo (${base.toString()}) no pertenece a los números reales`);
    }

    // Exponente entero puro (de === 1n)
    if (de === 1n) {
      let absExp = ne < 0n ? -ne : ne;
      if (absExp > 100n) throw new Error("Exponente demasiado grande para cálculo exacto (máx 100)");
      let numPow = base.n ** absExp;
      let denPow = base.d ** absExp;
      if (ne < 0n) return new Fraction(denPow, numPow);
      return new Fraction(numPow, denPow);
    }

    // Exponente fraccionario (raíces)
    const sign = (base.n < 0n && (ne % 2n !== 0n)) ? -1n : 1n;
    const absNum = base.n < 0n ? -base.n : base.n;
    const absDen = base.d;
    const absExpNum = ne < 0n ? -ne : ne;

    if (absExpNum > 100n || de > 100n) throw new Error("Exponente fraccionario fuera de límites operativos");

    const poweredNum = absNum ** absExpNum;
    const poweredDen = absDen ** absExpNum;

    // Intentar raíz entera exacta
    const rootNum = Fraction.integerNthRoot(poweredNum, de);
    const rootDen = Fraction.integerNthRoot(poweredDen, de);

    if (rootNum !== null && rootDen !== null) {
      let finalNum = sign * rootNum;
      let finalDen = rootDen;
      if (ne < 0n) return new Fraction(finalDen, finalNum);
      return new Fraction(finalNum, finalDen);
    }

    // Raíz irracional: evaluar aproximación decimal limpia (ej: (2)^1/2 ≈ 1.414214)
    const baseFloat = base.toNumber();
    const expFloat = exp.toNumber();
    const resFloat = Math.pow(baseFloat, expFloat);
    if (isNaN(resFloat) || !isFinite(resFloat)) {
      throw new Error(`Resultado numérico no válido para (${base.toString()})^(${exp.toString()})`);
    }
    return Fraction.fromDecimal(resFloat);
  }

  /**
   * Parsea cadenas variadas, incluyendo expresiones matemáticas avanzadas:
   * - Potencias y raíces: "(81)^1/2", "(2)^1/2", "2^1/3", "(-2)^3", "(3/4)^2", "(-6)^2"
   * - Funciones: "sqrt(81)", "√81", "cbrt(27)"
   * - Fracciones: "3/4", "-2/5", "68/8"
   * - Operaciones en celda: "(-6)*1/2", "5 + 3/4"
   * - Números mixtos: "2 1/2", "-1 3/4"
   * - Decimales con punto o coma: "0.75", "0,5", "2.04"
   * - Decimales periódicos: "0.(3)", "0.1(6)", "0.333..."
   * - Enteros: "86", "7225", "-4"
   */
  static fromString(str) {
    if (!str || typeof str !== 'string') {
      return new Fraction(0n, 1n);
    }

    let clean = str.trim().replace(/\s+/g, ' ');
    if (clean === '' || clean === '-') {
      return new Fraction(0n, 1n);
    }

    // Normalizar coma decimal a punto
    clean = clean.replace(/,/g, '.');

    // Deshacer paréntesis exteriores que envuelvan toda la expresión
    clean = Fraction.cleanParens(clean);

    // 1. Números mixtos (ej: "2 1/2" o "-1 3/4")
    const mixedMatch = clean.match(/^([+-]?\d+)\s+(\d+)\/(\d+)$/);
    if (mixedMatch) {
      const whole = BigInt(mixedMatch[1]);
      const num = BigInt(mixedMatch[2]);
      const den = BigInt(mixedMatch[3]);
      if (den === 0n) throw new Error("Denominador no puede ser 0");
      const sign = whole < 0n ? -1n : 1n;
      const absWhole = whole < 0n ? -whole : whole;
      return new Fraction(sign * (absWhole * den + num), den);
    }

    // 2. Operaciones binarias de menor precedencia fuera de paréntesis: Suma (+) y Resta (-)
    let depth = 0;
    for (let i = clean.length - 1; i >= 0; i--) {
      const ch = clean[i];
      if (ch === ')') depth++;
      else if (ch === '(') depth--;
      else if (depth === 0 && (ch === '+' || ch === '-')) {
        const prev = clean.slice(0, i).trim();
        // Verificar que no sea signo unario al inicio o tras otro operador
        if (prev !== '' && !/[\+\-\*\/\^×]$/.test(prev)) {
          const left = Fraction.fromString(clean.slice(0, i));
          const right = Fraction.fromString(clean.slice(i + 1));
          if (ch === '+') {
            return left.add(right);
          } else {
            return left.sub(right);
          }
        }
      }
    }

    // 3. Multiplicación (*) fuera de paréntesis
    depth = 0;
    for (let i = clean.length - 1; i >= 0; i--) {
      const ch = clean[i];
      if (ch === ')') depth++;
      else if (ch === '(') depth--;
      else if (depth === 0 && (ch === '*' || ch === '×')) {
        const left = Fraction.fromString(clean.slice(0, i));
        const right = Fraction.fromString(clean.slice(i + 1));
        return left.mul(right);
      }
    }

    // 4. Potenciación (^) fuera de paréntesis: ej "(81)^1/2", "2^1/3", "(-2)^3", "(3/4)^2"
    // Buscamos el operador '^' de nivel superior
    depth = 0;
    let powIdx = -1;
    for (let i = 0; i < clean.length; i++) {
      const ch = clean[i];
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      else if (depth === 0 && ch === '^') {
        powIdx = i;
        break;
      }
    }
    if (powIdx !== -1) {
      const leftPart = clean.slice(0, powIdx).trim();
      const rightPart = clean.slice(powIdx + 1).trim();
      if (!leftPart || !rightPart) {
        throw new Error(`Expresión de potencia incompleta: "${str}"`);
      }
      const baseFrac = Fraction.fromString(leftPart);
      const expFrac = Fraction.fromString(rightPart);
      return Fraction.pow(baseFrac, expFrac);
    }

    // 5. División / Fracción simple (/) fuera de paréntesis: ej "68/8", "3/4"
    depth = 0;
    for (let i = clean.length - 1; i >= 0; i--) {
      const ch = clean[i];
      if (ch === ')') depth++;
      else if (ch === '(') depth--;
      else if (depth === 0 && ch === '/') {
        const left = Fraction.fromString(clean.slice(0, i));
        const right = Fraction.fromString(clean.slice(i + 1));
        if (right.n === 0n) throw new Error("División por cero");
        return left.div(right);
      }
    }

    // 6. Funciones directas: sqrt(...), raiz(...), √(x), cbrt(...)
    const sqrtMatch = clean.match(/^(?:sqrt|raiz|√)\s*\((.+)\)$/i) || clean.match(/^√\s*(\d+(?:\.\d+)?)$/);
    if (sqrtMatch) {
      const inner = Fraction.fromString(sqrtMatch[1]);
      return Fraction.pow(inner, new Fraction(1n, 2n));
    }
    const cbrtMatch = clean.match(/^(?:cbrt|raiz3)\s*\((.+)\)$/i);
    if (cbrtMatch) {
      const inner = Fraction.fromString(cbrtMatch[1]);
      return Fraction.pow(inner, new Fraction(1n, 3n));
    }

    // 7. Decimal periódico con notación de paréntesis ej: 0.(3), 0.1(6), -1.(285714)
    const noSpaces = clean.replace(/\s+/g, '');
    const parenMatch = noSpaces.match(/^([+-]?\d*)\.(\d*)\((\d+)\)$/);
    if (parenMatch) {
      const sign = parenMatch[1].startsWith('-') ? -1n : 1n;
      const intRaw = parenMatch[1].replace(/^[+-]/, '');
      const intPart = intRaw === '' ? '0' : intRaw;
      const nonRep = parenMatch[2] || '';
      const rep = parenMatch[3];
      if (rep.length === 0) throw new Error(`Periodo vacío en "${str}"`);

      const m = BigInt(nonRep.length);
      const p = BigInt(rep.length);
      const beforeRep = BigInt(intPart + nonRep);
      const withRep = BigInt(intPart + nonRep + rep);
      const num = withRep - beforeRep;
      const den = (10n ** p - 1n) * (10n ** m);
      return new Fraction(sign * num, den);
    }

    // 8. Decimal periódico aproximado con puntos suspensivos ej: 0.333... o 0.666...
    if (noSpaces.endsWith('...')) {
      const trimmed = noSpaces.slice(0, -3);
      const dotIdx = trimmed.indexOf('.');
      if (dotIdx !== -1) {
        const intPart = trimmed.slice(0, dotIdx).replace(/^[+-]/, '') || '0';
        const sign = trimmed.startsWith('-') ? -1n : 1n;
        const decPart = trimmed.slice(dotIdx + 1);
        if (decPart.length >= 2) {
          const lastDigit = decPart[decPart.length - 1];
          let repCount = 0;
          for (let i = decPart.length - 1; i >= 0; i--) {
            if (decPart[i] === lastDigit) repCount++;
            else break;
          }
          if (repCount >= 2) {
            const nonRep = decPart.slice(0, decPart.length - repCount);
            const rep = lastDigit;
            const m = BigInt(nonRep.length);
            const p = BigInt(rep.length);
            const beforeRep = BigInt(intPart + nonRep);
            const withRep = BigInt(intPart + nonRep + rep);
            const num = withRep - beforeRep;
            const den = (10n ** p - 1n) * (10n ** m);
            return new Fraction(sign * num, den);
          }
        }
      }
    }

    // 9. Número decimal exacto estándar (ej: 0.75, 2.04, -2.5)
    if (noSpaces.includes('.')) {
      const sign = noSpaces.startsWith('-') ? -1n : 1n;
      const unsigned = noSpaces.replace(/^[+-]/, '');
      const parts = unsigned.split('.');
      if (parts.length !== 2) {
        throw new Error(`Número decimal inválido: "${str}"`);
      }
      const intPart = parts[0] === '' ? '0' : parts[0];
      const decPart = parts[1];
      if (!/^\d*$/.test(intPart) || !/^\d+$/.test(decPart)) {
        throw new Error(`Número decimal inválido: "${str}"`);
      }
      const power = BigInt(decPart.length);
      const denominator = 10n ** power;
      const fullNumerator = BigInt(intPart + decPart);
      return new Fraction(sign * fullNumerator, denominator);
    }

    // 10. Número entero simple (ej: 86, 222, 7225, -4)
    if (/^[+-]?\d+$/.test(noSpaces)) {
      return new Fraction(BigInt(noSpaces), 1n);
    }

    throw new Error(`Expresión o número no reconocido: "${str}". Ejemplos válidos: (81)^1/2, 2^1/3, (-2)^3, (3/4)^2, 68/8, 2.04`);
  }

  // Operaciones Aritméticas
  add(other) {
    const f = other instanceof Fraction ? other : new Fraction(other);
    const n = this.n * f.d + f.n * this.d;
    const d = this.d * f.d;
    return new Fraction(n, d);
  }

  sub(other) {
    const f = other instanceof Fraction ? other : new Fraction(other);
    const n = this.n * f.d - f.n * this.d;
    const d = this.d * f.d;
    return new Fraction(n, d);
  }

  mul(other) {
    const f = other instanceof Fraction ? other : new Fraction(other);
    const n = this.n * f.n;
    const d = this.d * f.d;
    return new Fraction(n, d);
  }

  div(other) {
    const f = other instanceof Fraction ? other : new Fraction(other);
    if (f.n === 0n) {
      throw new Error("División por cero en operación de fracciones");
    }
    const n = this.n * f.d;
    const d = this.d * f.n;
    return new Fraction(n, d);
  }

  pow(exp) {
    return Fraction.pow(this, exp);
  }

  neg() {
    return new Fraction(-this.n, this.d);
  }

  abs() {
    return new Fraction(Fraction.absBigInt(this.n), this.d);
  }

  isZero() {
    return this.n === 0n;
  }

  isInteger() {
    return this.d === 1n;
  }

  equals(other) {
    const f = other instanceof Fraction ? other : new Fraction(other);
    return this.n === f.n && this.d === f.d;
  }

  /**
   * Representación en texto estándar: ej. "0", "5", "-3", "3/4", "-7/2"
   */
  toString() {
    if (this.d === 1n) {
      return this.n.toString();
    }
    return `${this.n.toString()}/${this.d.toString()}`;
  }

  /**
   * Valor aproximado en decimal nativo
   */
  toNumber() {
    return Number(this.n) / Number(this.d);
  }

  /**
   * Formatea como string decimal con precisión configurable.
   * Si es entero, omite los ceros decimales innecesarios.
   */
  toDecimalString(decimals = 4) {
    if (this.d === 1n) return this.n.toString();
    const val = this.toNumber();
    // Redondear a 'decimals' lugares sin ceros sobrantes
    const str = val.toFixed(decimals);
    return str.replace(/\.?0+$/, '');
  }

  /**
   * Representación como número mixto si el numerador es mayor que el denominador
   * ej: 5/2 -> "2 ½", -7/3 -> "-2 ⅓"
   */
  toMixedNumberString() {
    if (this.d === 1n) return this.n.toString();
    const sign = this.n < 0n ? '-' : '';
    const absN = Fraction.absBigInt(this.n);
    const whole = absN / this.d;
    const rem = absN % this.d;
    if (whole === 0n) return `${sign}${rem}/${this.d}`;
    if (rem === 0n) return `${sign}${whole}`;
    return `${sign}${whole} ${rem}/${this.d}`;
  }

  /**
   * Análisis exhaustivo de conversión a decimal con detección de periodicidad.
   */
  toDecimalAnalysis(maxDecimals = 12) {
    const isNeg = this.n < 0n;
    const absN = Fraction.absBigInt(this.n);
    const d = this.d;

    const intPart = (absN / d).toString();
    let rem = absN % d;
    const signPrefix = isNeg ? '-' : '';

    if (rem === 0n) {
      return {
        decimal: signPrefix + intPart,
        isPeriodic: false,
        type: 'Decimal entero / exacto',
        intPart,
        decPart: '',
        period: '',
        periodicNotation: signPrefix + intPart
      };
    }

    const remainders = new Map();
    const digits = [];
    let periodIndex = -1;
    let idx = 0;

    // Ejecutar algoritmo de división larga rastreando residuos
    while (rem !== 0n && idx < 200) {
      const remKey = rem.toString();
      if (remainders.has(remKey)) {
        periodIndex = remainders.get(remKey);
        break;
      }
      remainders.set(remKey, idx);
      rem *= 10n;
      const digit = rem / d;
      digits.push(digit.toString());
      rem = rem % d;
      idx++;
    }

    if (rem === 0n) {
      const decPart = digits.join('');
      return {
        decimal: `${signPrefix}${intPart}.${decPart}`,
        isPeriodic: false,
        type: 'Decimal exacto (finito)',
        intPart,
        decPart,
        period: '',
        periodicNotation: `${signPrefix}${intPart}.${decPart}`
      };
    }

    if (periodIndex !== -1) {
      const nonRep = digits.slice(0, periodIndex).join('');
      const rep = digits.slice(periodIndex).join('');
      const isPure = nonRep.length === 0;

      // Representación truncada visible
      const displayDigits = digits.slice(0, Math.min(digits.length, maxDecimals)).join('');
      return {
        decimal: `${signPrefix}${intPart}.${displayDigits}...`,
        isPeriodic: true,
        type: isPure ? 'Decimal periódico puro' : 'Decimal periódico mixto',
        intPart,
        nonRep,
        period: rep,
        periodicNotation: `${signPrefix}${intPart}.${nonRep}(${rep})`,
        vinculumNotation: `${signPrefix}${intPart}.${nonRep}<span class="vinculum">${rep}</span>`
      };
    }

    // Aproximación de seguridad
    const decStr = digits.slice(0, maxDecimals).join('');
    return {
      decimal: `${signPrefix}${intPart}.${decStr}...`,
      isPeriodic: false,
      type: 'Aproximación decimal',
      intPart,
      decPart: decStr,
      period: '',
      periodicNotation: `${signPrefix}${intPart}.${decStr}...`
    };
  }

  /**
   * Genera el desglose matemático detallado para transformar DECIMAL -> FRACCIÓN
   * @param {string} inputStr
   */
  static decimalToFractionDetailed(inputStr) {
    if (!inputStr || typeof inputStr !== 'string') {
      throw new Error("Por favor introduce un número decimal válido.");
    }

    let clean = inputStr.trim().replace(/\s+/g, '').replace(/,/g, '.');
    const isNegative = clean.startsWith('-');
    const signPrefix = isNegative ? '-' : '';
    const unsigned = clean.replace(/^[+-]/, '');

    // Comprobar si es entero
    if (/^\d+$/.test(unsigned)) {
      const frac = new Fraction(BigInt(clean), 1n);
      return {
        fraction: frac,
        type: 'Número Entero',
        steps: [
          `El valor ingresado es un número entero: <strong>${clean}</strong>`,
          `Todo entero tiene denominador 1: <strong>${clean}/1</strong>`
        ],
        irreducible: frac.toString(),
        mixed: null
      };
    }

    // 1. Caso Periódico con Paréntesis: ej. 0.(3), 0.1(6), 1.(285714)
    const parenMatch = unsigned.match(/^(\d*)\.(\d*)\((\d+)\)$/);
    if (parenMatch) {
      const intPart = parenMatch[1] === '' ? '0' : parenMatch[1];
      const nonRep = parenMatch[2] || '';
      const rep = parenMatch[3];
      const isPure = nonRep.length === 0;

      const m = BigInt(nonRep.length); // Cifras anteperíodo
      const p = BigInt(rep.length);    // Cifras período

      const beforeRep = BigInt(intPart + nonRep);
      const withRep = BigInt(intPart + nonRep + rep);
      const rawNum = withRep - beforeRep;
      const rawDen = (10n ** p - 1n) * (10n ** m);

      const g = Fraction.gcd(rawNum, rawDen);
      const finalNum = (isNegative ? -1n : 1n) * (rawNum / g);
      const finalDen = rawDen / g;
      const frac = new Fraction(finalNum, finalDen);

      const nines = '9'.repeat(Number(p));
      const zeros = '0'.repeat(Number(m));
      const denStr = nines + zeros;

      const steps = [];
      steps.push(`<strong>Paso 1: Identificación del tipo de decimal:</strong> Se trata de un <em>${isPure ? 'Decimal Periódico Puro' : 'Decimal Periódico Mixto'}</em>.`);
      steps.push(`Parte entera: <code>${intPart}</code>${nonRep ? `, Anteperíodo: <code>${nonRep}</code>` : ''}, Período recurrente: <code>${rep}</code>.`);
      steps.push(`<strong>Paso 2: Aplicación de la fórmula generatriz:</strong><br>
        Numerador = (Número completo sin comas) − (Parte no periódica)<br>
        <code>Numerador = ${intPart}${nonRep}${rep} − ${intPart}${nonRep} = ${rawNum.toString()}</code>`);
      steps.push(`Denominador = Tantos nueves como cifras periódicas (${p}) seguidos de tantos ceros como anteperíodos (${m}):<br>
        <code>Denominador = ${denStr}</code>`);
      steps.push(`<strong>Paso 3: Fracción sin simplificar:</strong> <code>${signPrefix}${rawNum.toString()} / ${denStr}</code>`);
      steps.push(`<strong>Paso 4: Cálculo del Máximo Común Divisor (MCD):</strong><br>
        <code>MCD(${rawNum.toString()}, ${denStr}) = ${g.toString()}</code>`);
      steps.push(`<strong>Paso 5: Simplificación por el MCD:</strong><br>
        <code>(${rawNum.toString()} ÷ ${g.toString()}) / (${denStr} ÷ ${g.toString()}) = <strong>${frac.toString()}</strong></code>`);

      return {
        fraction: frac,
        type: isPure ? 'Periódico Puro' : 'Periódico Mixto',
        steps,
        irreducible: frac.toString(),
        mixed: frac.toMixedNumberString() !== frac.toString() ? frac.toMixedNumberString() : null
      };
    }

    // 2. Caso Decimal Exacto: ej. 0.75, 2.5, -0.125
    const dotMatch = unsigned.match(/^(\d*)\.(\d+)$/);
    if (dotMatch) {
      const intPart = dotMatch[1] === '' ? '0' : dotMatch[1];
      const decPart = dotMatch[2];
      const decimalPlaces = BigInt(decPart.length);
      const rawDen = 10n ** decimalPlaces;
      const rawNum = BigInt(intPart + decPart);

      const g = Fraction.gcd(rawNum, rawDen);
      const finalNum = (isNegative ? -1n : 1n) * (rawNum / g);
      const finalDen = rawDen / g;
      const frac = new Fraction(finalNum, finalDen);

      const steps = [];
      steps.push(`<strong>Paso 1: Clasificación:</strong> Es un <em>Decimal Exacto</em> con <strong>${decimalPlaces.toString()}</strong> cifras decimales.`);
      steps.push(`<strong>Paso 2: Multiplicación por 10<sup>${decimalPlaces.toString()}</sup>:</strong><br>
        Se expresa sobre la potencia de diez correspondiente: <code>${signPrefix}${rawNum.toString()} / ${rawDen.toString()}</code>.`);
      steps.push(`<strong>Paso 3: Cálculo del Máximo Común Divisor:</strong><br>
        <code>MCD(${rawNum.toString()}, ${rawDen.toString()}) = ${g.toString()}</code>`);
      steps.push(`<strong>Paso 4: División de numerador y denominador entre el MCD:</strong><br>
        Numerador: <code>${rawNum.toString()} ÷ ${g.toString()} = ${(rawNum / g).toString()}</code><br>
        Denominador: <code>${rawDen.toString()} ÷ ${g.toString()} = ${(rawDen / g).toString()}</code>`);
      steps.push(`<strong>Paso 5: Fracción irreducible final:</strong> <strong>${frac.toString()}</strong>`);

      return {
        fraction: frac,
        type: 'Decimal Exacto',
        steps,
        irreducible: frac.toString(),
        mixed: frac.toMixedNumberString() !== frac.toString() ? frac.toMixedNumberString() : null
      };
    }

    throw new Error(`El formato "${inputStr}" no es reconocido como decimal. Usa ejemplos como: 0.75, -2.5, 0.(3) o 0.1(6).`);
  }

  /**
   * Genera el desglose matemático detallado para transformar FRACCIÓN -> DECIMAL
   * @param {string|Fraction} inputFrac
   */
  static fractionToDecimalDetailed(inputFrac, precision = 8) {
    const frac = inputFrac instanceof Fraction ? inputFrac : Fraction.fromString(inputFrac);
    const analysis = frac.toDecimalAnalysis(precision);

    const absN = Fraction.absBigInt(frac.n);
    const d = frac.d;
    const isNeg = frac.n < 0n;
    const signPrefix = isNeg ? '−' : '';

    const steps = [];
    steps.push(`<strong>Paso 1: Identificación de términos:</strong><br>
      Numerador = <code>${frac.n.toString()}</code>, Denominador = <code>${frac.d.toString()}</code>.`);

    if (frac.isInteger()) {
      steps.push(`<strong>Paso 2: División exacta:</strong> El denominador es 1, por lo que el valor es el entero: <strong>${frac.n.toString()}</strong>`);
    } else {
      steps.push(`<strong>Paso 2: Realización de la división euclidiana:</strong><br>
        <code>${absN.toString()} ÷ ${d.toString()}</code> = Cociente entero <code>${analysis.intPart}</code> con residuo <code>${(absN % d).toString()}</code>.`);

      if (!analysis.isPeriodic) {
        steps.push(`<strong>Paso 3: Análisis de los factores primos del denominador:</strong><br>
          El denominador <code>${d.toString()}</code> solo se compone de factores primos 2 y/o 5. Por tanto, produce un <em>Decimal Exacto</em>.`);
        steps.push(`<strong>Paso 4: Continuación con cifras decimales:</strong> La división finaliza con residuo 0 produciendo: <strong>${analysis.decimal}</strong>`);
      } else {
        steps.push(`<strong>Paso 3: Detección del ciclo de residuos:</strong><br>
          Al descender ceros, los residuos se repiten en un bucle cerrado. El período repetitivo es: <code>${analysis.period}</code>.`);
        steps.push(`<strong>Paso 4: Notación periódica matemática:</strong><br>
          Representación con vinculum/paréntesis: <strong>${analysis.periodicNotation}</strong>`);
      }
    }

    return {
      fraction: frac,
      analysis,
      steps,
      displayDecimal: analysis.decimal,
      periodicNotation: analysis.periodicNotation
    };
  }

  /**
   * Representación matemática en HTML enriquecido con apilado vertical
   * para aspecto formal de libro de álgebra lineal / marcador deportivo.
   */
  toHTML() {
    if (this.d === 1n) {
      return `<span class="val-int">${this.n.toString()}</span>`;
    }

    const isNegative = this.n < 0n;
    const absNum = Fraction.absBigInt(this.n).toString();
    const denStr = this.d.toString();

    return `
      <span class="val-fraction ${isNegative ? 'is-neg' : 'is-pos'}">
        ${isNegative ? '<span class="frac-sign">−</span>' : ''}
        <span class="frac-stack">
          <span class="frac-num">${absNum}</span>
          <span class="frac-line"></span>
          <span class="frac-den">${denStr}</span>
        </span>
      </span>
    `;
  }
}

// Para uso en módulos o navegador global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Fraction;
} else {
  window.Fraction = Fraction;
}
