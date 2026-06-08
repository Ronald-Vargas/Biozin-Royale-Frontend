import { trigger, transition, style, query, group, animate } from '@angular/animations';

// Las queries son opcionales porque en la primera carga puede no
// existir una página :leave (no hay pantalla saliente).
const optional = { optional: true };

// Ambas pantallas (entrante y saliente) se posicionan superpuestas
// y a pantalla completa durante la transición para poder deslizarlas.
const fill = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
};

const EASE = '280ms cubic-bezier(0.25, 0.8, 0.25, 1)';

function slide(enterFrom: string, leaveTo: string) {
  return [
    query(':enter, :leave', [style(fill)], optional),
    query(':enter', [style({ transform: `translateX(${enterFrom})` })], optional),
    group([
      query(':leave', [animate(EASE, style({ transform: `translateX(${leaveTo})` }))], optional),
      query(':enter', [animate(EASE, style({ transform: 'translateX(0)' }))], optional),
    ]),
  ];
}

// Cada ruta tiene un `data.depth` numérico. Al avanzar (depth mayor)
// la pantalla nueva entra desde la derecha; al retroceder (depth
// menor) entra desde la izquierda. Estilo iOS con leve parallax.
export const routeAnimations = trigger('routeAnimations', [
  transition(':increment', slide('100%', '-30%')),
  transition(':decrement', slide('-30%', '100%')),
]);
