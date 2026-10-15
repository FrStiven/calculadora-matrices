# CombatMatrix Pro - Calculadora Táctica de Artes Marciales & Combate

Una aplicación web moderna, interactiva y de alto impacto visual que unifica los principales **Deportes de Combate y Artes Marciales (Boxeo, MMA, Brazilian Jiu-Jitsu, Judo, Muay Thai y Taekwondo)** para resolver operaciones de matrices con **precisión fraccionaria exacta**.

---

## Fondo Oscuro Inmersivo & Emblema de la UFC en el Centro

- **Octágono Central (UFC):**
  - **Emblema en la Mitad:** Logotipo oficial vectorial de la **UFC** (`img/ufc_logo.svg`) centrado en el fondo sobre la malla geométrica del octágono, creando una atmósfera de campeonato mundial sin interferir con la calculadora.
  - **Fondo Oscuro de Arena:** Tonos profundos de carbono (`#060911`) con resplandores perimetrales rojo y azul para las esquinas de combate.

- **Galería Ordenada en los Flancos (Sin Subtítulos):**
  - **Estructura Equilibrada:** 6 tarjetas ordenadas en los flancos laterales (3 en el flanco izquierdo - Esquina Roja, y 3 en el flanco derecho - Esquina Azul).
  - **Sin Subtítulos:** Se eliminaron todos los textos y etiquetas sobre las imágenes, presentando fotografías limpias en marcos oscuros blindados con ribetes neón (**Oro**, **Rojo**, **Azul**).
  - **Rotación Suave y Automática:** Cada 4.5 segundos, una de las tarjetas realiza una transición de desvanecimiento suave (*fade-out / fade-in*) y renueva su fotografía desde el banco de 22 combates reales: nocauts y golpes en el cuadrilátero y la jaula (Ali vs Foreman KO, Ali vs Frazier, Mike Tyson impactando y noqueando a Larry Holmes, Canelo Álvarez cruzando golpes, Oleksandr Usyk en combate titular, Gennady Golovkin vs Rosado, Alex Pereira en UFC 300, Ilia Topuria en el octágono, Charles Oliveira en sumisión, Chris Weidman noqueando a Anderson Silva en UFC 162, combate de BJJ Lepri vs Gracie, Ippon de Judo, Muay Thai en el Estadio Lumpinee de Bangkok, y Boxeo Olímpico en Río 2016).
  - **100% Acción en Combate:** Todas las imágenes fueron capturadas durante la pelea (en el ring, octágono o tatami), sin fotos de estudio ni poses con cinturón fuera de combate.
  - **Micro-flotación Armoniosa:** Movimiento suave y sincronizado en lugar de desplazamientos desordenados, permitiendo una experiencia visual limpia, enfocada y táctica.
  - **Pausa al Pasar el Cursor:** Si el usuario coloca el puntero sobre cualquier fotografía, la rotación se pausa y la tarjeta se amplía ligeramente para apreciarla en detalle.

---

## Cumplimiento de los 10 Requerimientos

| # | Requerimiento de la Pizarra | Implementación en CombatMatrix Pro |
|---|---|---|
| **1** | **Preguntar Tamaño Matrices de Cualquier Dimensión** | Entrada libre de cualquier tamaño ($M \times N$): Steppers táctiles (`+` / `−`), escritura directa por teclado de cualquier dimensión, botón de **+ Tamaño Libre** (ej: 5×5, 7×7, 10×10, etc.) y chips de acceso rápido (2×2, 3×3, 4×4, 5×5, 3×2, 2×3). Cuenta con scroll bidireccional suave y autoajuste de densidad de celdas para matrices grandes, conservando los valores al cambiar de dimensión. |
| **2** | **Hacer Transpuesta** | "Cambio de Guardia": Botones **Transpuesta Aᵀ** y **Transpuesta Bᵀ**. Invierte filas por columnas ($A_{ij} \to A_{ji}$) con desglose celda por celda. |
| **3** | **Definir Diagonal Principal** | "Ataque Frontal": Resalta las celdas $i = j$ en el tatami y calcula la **Traza $\text{tr}(A)$** sumando los elementos en fracciones exactas. |
| **4** | **Definir Diagonal Secundaria** | "Barrido Cruzado": Resalta los impactos diagonales ($j = n - 1 - i$) y calcula su suma exacta fraccionaria. |
| **5** | **Realizar Suma de Matrices** | **Combo Striking [A + B]** y **Reversal [A − B]** con veredicto arbitral de compatibilidad en tiempo real en el marcador. |
| **6** | **Realizar Producto de Matrices** | **Ippon / Sumisión KO [A × B]** y **Pase de Guardia [B × A]**. Valida la regla de conformabilidad (columnas de A = filas de B) y desglosa el producto punto con fracciones. |
| **7** | **Mostrar Resultado en Formato Matriz** | Presentación formal de álgebra lineal con corchetes de combate `[ ... ]` en la tarjeta de campeón, cuadrícula alineada y transferencia rápida a la Esquina Roja o Azul. |
| **8** | **Manejo de Estructura de Fracción** | Motor aritmético de precisión exacta (`Fraction.js`) con simplificación por MCD. Admite entradas como `1/2`, `-3/4`, `5`, `-2`, `0.25`, etc., y muestra divisiones apiladas verticalmente ($\frac{a}{b}$). |
| **9** | **Personalizada por Temática (Artes Marciales)** | Temática unificada de Artes Marciales (Boxeo, MMA, BJJ, Judo, Muay Thai): campana y gong de combate, tarjetas de jueces, impactos sonoros y cuadritos flotantes con fotos reales. |
| **10** | **Responsive + FavIcon** | Adaptable a móviles, tablets y monitores de escritorio. Incluye **Favicon SVG temático** (`favicon.svg`). |

---

## Despliegue en Vivo & Repositorio GitHub

- **Sitio Web en Vivo (GitHub Pages):** [https://frstiven.github.io/calculadora-matrices/](https://frstiven.github.io/calculadora-matrices/)
- **Repositorio Oficial en GitHub:** [https://github.com/FrStiven/calculadora-matrices](https://github.com/FrStiven/calculadora-matrices)

---

## Cómo Abrir la Aplicación

1. **En línea:** Accede directamente a [https://frstiven.github.io/calculadora-matrices/](https://frstiven.github.io/calculadora-matrices/)
2. **Directamente en tu explorador de archivos:**
   Haz doble clic sobre el archivo [**`index.html`**](file:///c:/Users/Wayne/Desktop/calculadoramatrices/index.html).
3. **Mediante servidor local:**
   Abre tu navegador en: **http://localhost:8085**
