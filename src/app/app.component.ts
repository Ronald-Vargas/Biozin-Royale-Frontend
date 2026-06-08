import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonApp } from '@ionic/angular/standalone';
import { routeAnimations } from './route-animations';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, RouterOutlet],
  animations: [routeAnimations],
})
export class AppComponent {
  // Valor que ordena las pantallas para la animación. Combinamos el
  // `depth` jerárquico con el índice de pestaña (`tab`) del bottom-nav:
  // así las pestañas que comparten depth (todas en 5) quedan ordenadas
  // de izquierda a derecha y se deslizan según su posición. Multiplicar
  // depth por 10 evita colisiones (tab va de 0 a 4).
  getOrder(outlet: RouterOutlet): number {
    if (!outlet?.isActivated) return 0;
    const data = outlet.activatedRouteData;
    return (data['depth'] ?? 0) * 10 + (data['tab'] ?? 0);
  }
}
