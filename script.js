// ---------- Aparición de la portada ----------
window.addEventListener('DOMContentLoaded', () => {
  const elementos = document.querySelectorAll('.hero .reveal');

  elementos.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 150 + i * 180);
  });
});

// ---------- Avatar que acompaña el scroll ----------
const escena = document.querySelector('.escena');
const avatar = document.querySelector('.avatar');
const lugarInicio = document.querySelector('.hero__avatar');
const lugarFin = document.querySelector('.indice__avatar');

// Ajustes de la animación
const INICIO_MOVIMIENTO_X = 0.45; // cuándo empieza a ir hacia la derecha (0 a 1)
const CAMBIO_DE_POSE = 0.5;       // cuándo pasa de saludar a observar (0 a 1)

let medidas = null;
let pendiente = false;

// Posición de un elemento relativa a la escena
function posicion(el, base) {
  const r = el.getBoundingClientRect();
  return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
}

function medir() {
  const base = escena.getBoundingClientRect();
  const escenaTop = base.top + window.scrollY;
  const inicio = posicion(lugarInicio, base);
  const fin = posicion(lugarFin, base);

  // El recorrido termina cuando el avatar observando queda centrado en la pantalla
  const hastaFin = fin.y + fin.h / 2 - window.innerHeight / 2;

  // Sin pedir más scroll del que la página realmente tiene
  const scrollMaximo = document.documentElement.scrollHeight - window.innerHeight - escenaTop;

  medidas = {
    inicio,
    fin,
    escenaTop,
    recorrido: Math.max(1, Math.min(hastaFin, scrollMaximo))
  };
}

const limitar = t => Math.min(Math.max(t, 0), 1);
const mezclar = (a, b, t) => a + (b - a) * t;
const suavizar = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function actualizar() {
  pendiente = false;
  if (!medidas) return;

  const { inicio, fin, escenaTop, recorrido } = medidas;

  // 0 = en la portada, 1 = en el índice
  const progreso = limitar((window.scrollY - escenaTop) / recorrido);
  const suave = suavizar(progreso);

  // Hacia la derecha recién en la segunda parte, cuando los botones ya subieron
  const suaveX = suavizar(limitar((progreso - INICIO_MOVIMIENTO_X) / (1 - INICIO_MOVIMIENTO_X)));

  const x = mezclar(inicio.x, fin.x, suaveX);
  const y = mezclar(inicio.y, fin.y, suave);
  const w = mezclar(inicio.w, fin.w, suave);
  const h = mezclar(inicio.h, fin.h, suave);

  avatar.style.width = `${w}px`;
  avatar.style.height = `${h}px`;
  avatar.style.transform = `translate3d(${x}px, ${y}px, 0)`;

  avatar.classList.toggle('observando', progreso > CAMBIO_DE_POSE);
  avatar.classList.toggle('adelante', progreso > 0);
}

function alScrollear() {
  if (!pendiente) {
    pendiente = true;
    requestAnimationFrame(actualizar);
  }
}

function recalcular() {
  medir();
  actualizar();
}

function iniciar() {
  recalcular();
  setTimeout(() => avatar.classList.add('listo'), 150);
}

window.addEventListener('scroll', alScrollear, { passive: true });
window.addEventListener('resize', recalcular);
window.addEventListener('load', iniciar);

// Vuelve a medir si cambia el tamaño de la página (imágenes, fuentes, nuevas secciones)
if ('ResizeObserver' in window) {
  new ResizeObserver(recalcular).observe(escena);
}
if (document.fonts) {
  document.fonts.ready.then(recalcular);
}