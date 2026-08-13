# Biozin Royale — Frontend

Aplicación de **Biozin Royale**, una plataforma de casino en línea. Un mismo código se ejecuta
como aplicación web y, a través de Capacitor, como aplicación nativa de Android e iOS.

La interfaz es únicamente una capa de presentación: los resultados de los juegos, el saldo y
las validaciones se resuelven en el servidor. Aquí no se decide ninguna jugada ni se calcula
ningún monto.

- **Backend:** [Biozin-Royale-Backend](https://github.com/bjimenez867/Biozin-Royale-Backend)

---

## Stack

- **Angular 20** con componentes *standalone* (sin NgModules)
- **Ionic 8** — los componentes se importan individualmente desde `@ionic/angular/standalone`
- **Capacitor 8** para los empaquetados nativos
- **SignalR** para el blackjack multijugador y los chats de soporte
- **TypeScript 5.9** · **RxJS 7.8**

## Requisitos

- Node.js 20 o superior
- Android Studio (para compilar el APK) o Xcode (para iOS)
- Una instancia del backend en ejecución

## Instalación

```bash
npm install
npm start          # servidor de desarrollo en http://localhost:4200
```

## Comandos

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo (`ng serve`) |
| `npm run build` | Compilación de producción hacia `www/` |
| `npm run watch` | Recompila ante cada cambio, en configuración de desarrollo |
| `npm test` | Pruebas unitarias con Karma y Jasmine |
| `npm run lint` | Análisis estático con Angular ESLint |

Para ejecutar un único archivo de pruebas:

```bash
ng test --include=src/app/ruta/al/archivo.spec.ts
```

## Configuración

Los entornos viven en `src/environments/`. `angular.json` sustituye `environment.ts` por
`environment.prod.ts` en las compilaciones de producción.

```ts
export const environment = {
  production: false,
  supabaseUrl: '…',            // proyecto de Supabase
  supabaseKey: '…',            // clave publicable, protegida por RLS
  apiUrl: 'http://localhost:5000/api',
  stripePublishableKey: '…',   // clave publicable de Stripe
  paypalClientId: '…',         // identificador de cliente de PayPal
  support: { waNumber: '…', waDisplay: '…', email: '…' },
};
```

> Todas las claves de estos archivos son **publicables por diseño**: se entregan al navegador en
> cada carga y no otorgan acceso privilegiado. Las claves secretas (Stripe, PayPal, SMTP, base de
> datos) viven exclusivamente en el backend y nunca deben incorporarse aquí.

## Estructura

```
src/app/
├── Auth/         Registro, inicio de sesión, verificación y recuperación
├── User/         Experiencia del jugador
│   ├── games/ blackjack/ roulette/ slots/ sports/
│   ├── Wallet/   Depósitos, retiros y métodos de pago
│   ├── bonuses/  Promociones disponibles
│   ├── profile/  Perfil, seguridad, historial y soporte
│   └── shared/   Componentes, iconos y utilidades reutilizables
├── Support/      Panel del agente: tickets y solicitudes internas
├── Admin/        Supervisión, usuarios, equipo, finanzas, bonos y reportes
└── Core/         Servicios, guardas, interceptores y modelos
```

El arranque ocurre en `src/main.ts`, con `bootstrapApplication`. Los proveedores globales se
declaran allí, no en un módulo. Las rutas están en `src/app/app.routes.ts` y se cargan de forma
diferida mediante `loadComponent`, protegidas por guardas de rol y de tipo de cuenta.

## Compilación móvil

```bash
npm run build
npx cap sync
npx cap open android      # o: npx cap open ios
```

`capacitor.config.ts` define `webDir: 'www'`, de modo que `npm run build` debe ejecutarse antes
de cada sincronización.

Plugins en uso: `filesystem` y `share` (descarga de reportes en el dispositivo), `preferences`
(sesión y ajustes), `browser`, `app`, `haptics`, `keyboard` y `status-bar`.

> En el WebView nativo los enlaces con `download` no funcionan: los reportes se escriben con
> `Filesystem` y se entregan mediante `Share`. Al modificar la descarga de archivos, verificá el
> comportamiento en el dispositivo y no solo en el navegador.

## Tiempo real

Los servicios de `Core/Services` mantienen las conexiones de SignalR:

- `blackjack-realtime.service.ts` — estado de la mesa, turnos y apuestas
- `chat-realtime.service.ts` — mensajes de tickets y solicitudes internas
- `notification-realtime.service.ts` — avisos generales de la sesión

Todos reutilizan una única conexión por hub y esperan a que quede establecida antes de invocar
métodos, de modo que una llamada durante la reconexión no se pierda en silencio.

## Convenciones

- Las páginas se generan con `ng generate page <nombre>`, que produce componentes *standalone*.
- El nombre de las clases termina en `Page` o `Component` (regla `component-class-suffix`).
- Los selectores usan el prefijo `app`: kebab-case para elementos, camelCase para directivas.
- Los estilos globales están en `src/global.scss` y las variables de tema en
  `src/theme/variables.scss`.
