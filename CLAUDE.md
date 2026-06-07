# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — dev server at http://localhost:4200 (`ng serve`)
- `npm run build` — production build to `www/` (the Capacitor `webDir`)
- `npm run watch` — rebuild on change, development configuration
- `npm test` — Karma + Jasmine unit tests in Chrome
- `npm run lint` — Angular ESLint

Run a single spec file:
```
ng test --include=src/app/path/to/file.spec.ts
```

## Architecture

Ionic 8 + Angular 20 (standalone, no NgModules) mobile app, wrapped by Capacitor 8 for native builds.

- **Bootstrap**: `src/main.ts` calls `bootstrapApplication(AppComponent, ...)`. Global providers live here: `IonicRouteStrategy`, `provideIonicAngular()`, and `provideRouter(routes, withPreloading(PreloadAllModules))`. Add app-wide providers in this providers array, not a module.
- **Routing**: `src/app/app.routes.ts`. Routes are lazy-loaded via `loadComponent: () => import(...)`. Default path redirects to `home`.
- **Components/Pages**: standalone components that declare their own `imports`. Ionic components are imported individually from `@ionic/angular/standalone` (e.g. `IonApp`, `IonRouterOutlet`) rather than a shared module — import only what each component uses.
- **Environments**: `src/environments/environment.ts`; `angular.json` swaps in `environment.prod.ts` for production builds via `fileReplacements`.
- **Theming**: global styles in `src/global.scss`; Ionic CSS variables in `src/theme/variables.scss`. Both are registered as global styles in `angular.json`.
- **Native config**: `capacitor.config.ts` (appId, appName, `webDir: 'www'`).

## Conventions

- New pages are scaffolded with `ng generate page <name>` — the `@ionic/angular-toolkit:page` schematic produces standalone components with scss (configured in `angular.json`).
- Component class names must end in `Page` or `Component` (ESLint `component-class-suffix`).
- Component selectors use the `app` prefix, kebab-case for elements / camelCase for attribute directives.
