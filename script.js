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
const indice = document.querySelector('#indice');

let medidas = null;
let pendiente = false;

// Posición de un elemento relativa a la escena
function posicion(el, base) {
  const r = el.getBoundingClientRect();
  return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
}

function medir() {
  const base = escena.getBoundingClientRect();
  medidas = {
    inicio: posicion(lugarInicio, base),
    fin: posicion(lugarFin, base),
    escenaTop: base.top + window.scrollY,
    recorrido: indice.getBoundingClientRect().top - base.top
  };
}

const mezclar = (a, b, t) => a + (b - a) * t;
const suavizar = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function actualizar() {
  pendiente = false;
  const { inicio, fin, escenaTop, recorrido } = medidas;

  // 0 = en la portada, 1 = en el índice
  const progreso = Math.min(Math.max((window.scrollY - escenaTop) / recorrido, 0), 1);
  const suave = suavizar(progreso);

  // El movimiento hacia la derecha arranca recién en la segunda mitad del scroll,
  // cuando los botones ya subieron
  const avanceX = Math.min(Math.max((progreso - 0.45) / 0.55, 0), 1);
  const suaveX = suavizar(avanceX);

  const x = mezclar(inicio.x, fin.x, suaveX);
  const y = mezclar(inicio.y, fin.y, progreso);
  const w = mezclar(inicio.w, fin.w, suave);
  const h = mezclar(inicio.h, fin.h, suave);

  avatar.style.width = `${w}px`;
  avatar.style.height = `${h}px`;
  avatar.style.transform = `translate3d(${x}px, ${y}px, 0)`;

  avatar.classList.toggle('observando', progreso > 0.5);
  avatar.classList.toggle('adelante', progreso > 0);
}
function alScrollear() {
  if (!pendiente) {
    pendiente = true;
    requestAnimationFrame(actualizar);
  }
}

function iniciar() {
  medir();
  actualizar();
  setTimeout(() => avatar.classList.add('listo'), 150);
}

window.addEventListener('scroll', alScrollear, { passive: true });
window.addEventListener('resize', () => { medir(); actualizar(); });
window.addEventListener('load', iniciar);   // espera fuentes e imágenes para medir bien