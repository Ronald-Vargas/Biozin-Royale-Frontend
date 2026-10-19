import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AtmosphereComponent } from 'src/app/User/shared/Components/atmosphere/atmosphere.component';
import { SvgIconComponent } from 'src/app/User/shared/Components/svg-icons/svg-icons.component';
import { AdminHeaderComponent } from 'src/app/Admin/shared/admin-header/admin-header.component';
import { AdminNavComponent } from 'src/app/Admin/shared/admin-nav/admin-nav.component';
import { ICON_SEARCH } from 'src/app/User/shared/icons/icons';

// ───────────────────────── Tipos ─────────────────────────
type Seccion = 'res' | 'ord' | 'prods' | 'inv' | 'cli' | 'usr';
type Estado = 'Pendiente' | 'Preparando' | 'Enviado' | 'Entregado' | 'Cancelado';
type Rol = 'admin' | 'soporte' | 'cliente';
type Hoja = 'pedido' | 'cliente' | 'producto' | 'usuario';
type Categoria = 'Camisetas' | 'Sudaderas y gorras' | 'Accesorios' | 'Hogar' | 'Juegos';

interface Producto {
  id: string;
  nombre: string;
  categoria: Categoria;
  precio: number;
  stock: number;
  visible: boolean;
  descripcion: string;
  /** Color de la miniatura en las listas. */
  color: string;
}
interface ItemPedido { id: string; nombre: string; talla: string | null; cantidad: number; precio: number; }
interface Pedido {
  no: string;
  correo: string;
  cliente: string;
  fecha: string;
  estado: Estado;
  pago: string;
  direccion: string;
  items: ItemPedido[];
  historial: { estado: Estado; fecha: string }[];
}
interface Usuario { nombre: string; correo: string; rol: Rol; activo: boolean; }
interface Dialogo {
  titulo: string;
  texto: string;
  ok: string;
  conservar: string;
  accion: () => void;
  volver?: () => void;
}

// ─────────────────── Constantes y datos simulados ───────────────────
const YO = 'admin@biozin.com'; // cuenta que está usando el panel (no puede bloquearse ni cambiarse el rol)
const STOCK_BAJO = 5;
const ENVIO_GRATIS_DESDE = 60;
const COSTO_ENVIO = 5;

const SECCIONES: { k: Seccion; t: string }[] = [
  { k: 'res', t: 'Resumen' }, { k: 'ord', t: 'Pedidos' }, { k: 'prods', t: 'Productos' },
  { k: 'inv', t: 'Inventario' }, { k: 'cli', t: 'Clientes' }, { k: 'usr', t: 'Usuarios' },
];
const ESTADOS: Estado[] = ['Pendiente', 'Preparando', 'Enviado', 'Entregado'];
const FILTROS_PEDIDO: ('Todos' | Estado)[] = ['Todos', 'Pendiente', 'Preparando', 'Enviado', 'Entregado', 'Cancelado'];
const CATEGORIAS: Categoria[] = ['Camisetas', 'Sudaderas y gorras', 'Accesorios', 'Hogar', 'Juegos'];
/** Control de estados: a qué estados puede pasar un pedido desde el actual. */
const SIGUIENTES: Record<Estado, Estado[]> = {
  Pendiente: ['Preparando', 'Cancelado'],
  Preparando: ['Enviado', 'Cancelado'],
  Enviado: ['Entregado'],
  Entregado: [],
  Cancelado: [],
};
const ACCION: Record<string, string> = {
  Preparando: 'Empezar a preparar',
  Enviado: 'Marcar como enviado',
  Entregado: 'Marcar como entregado',
};
const ROLES: Record<Rol, { nombre: string; descripcion: string }> = {
  admin: { nombre: 'Administrador', descripcion: 'Gestiona productos, inventario, pedidos, clientes y usuarios.' },
  soporte: { nombre: 'Soporte', descripcion: 'Atiende pedidos y consulta clientes. No edita productos ni usuarios.' },
  cliente: { nombre: 'Cliente', descripcion: 'Compra en la tienda y sigue sus pedidos.' },
};

const crear = (
  id: string, nombre: string, categoria: Categoria, precio: number, stock: number, color: string, descripcion: string,
): Producto => ({ id, nombre, categoria, precio, stock, visible: true, descripcion, color });

const PRODUCTOS_DEMO: Producto[] = [
  crear('t1', 'Camiseta Royale', 'Camisetas', 28, 24, '#15110a', 'Algodón negro con el emblema bordado al pecho.'),
  crear('t2', 'Camiseta Marfil', 'Camisetas', 30, 6, '#ece3cb', 'Color marfil con el emblema en dorado y negro.'),
  crear('t3', 'Camiseta Ruleta', 'Camisetas', 29, 15, '#3a1319', 'Vino profundo, inspirada en la mesa de ruleta.'),
  crear('t4', 'Camiseta Mesa Verde', 'Camisetas', 29, 11, '#12261f', 'Verde fieltro de mesa con el emblema dorado.'),
  crear('t5', 'Camiseta Gold Member', 'Camisetas', 34, 9, '#3a2a0d', 'Bronce oscuro, corte relajado y emblema grande.'),
  crear('h1', 'Sudadera High Roller', 'Sudaderas y gorras', 62, 3, '#15110a', 'Felpa gruesa con capucha y emblema bordado.'),
  crear('h2', 'Sudadera Marfil', 'Sudaderas y gorras', 64, 10, '#ece3cb', 'Felpa color marfil con interior suave.'),
  crear('g1', 'Gorra Royale Negra', 'Sudaderas y gorras', 24, 18, '#15110a', 'Ajustable, con el emblema bordado al frente.'),
  crear('g2', 'Gorra Royale Marfil', 'Sudaderas y gorras', 24, 12, '#ece3cb', 'Ajustable, color marfil con emblema dorado.'),
  crear('g3', 'Gorra Vino', 'Sudaderas y gorras', 26, 14, '#3a1319', 'Edición vino con bordado dorado.'),
  crear('k1', 'Llavero Ficha 5', 'Accesorios', 8, 2, '#1b150a', 'Llavero de metal con la ficha de 5 de la casa.'),
  crear('k2', 'Llavero Ficha 25', 'Accesorios', 9, 22, '#1b150a', 'Llavero de metal con la ficha de 25.'),
  crear('k3', 'Llavero Ficha 100', 'Accesorios', 11, 16, '#1b150a', 'La ficha de 100 en versión llavero.'),
  crear('r3', 'Pin Royale', 'Accesorios', 6, 30, '#1b150a', 'Pin esmaltado con el emblema para solapa o gorra.'),
  crear('a1', 'Bolsa de tela', 'Accesorios', 15, 26, '#ece3cb', 'Algodón grueso con el emblema estampado.'),
  crear('r1', 'Taza Jackpot', 'Hogar', 14, 40, '#2b2210', 'Cerámica de 330 ml con borde dorado.'),
  crear('r4', 'Taza Marfil', 'Hogar', 14, 33, '#ece3cb', 'Cerámica de 330 ml color marfil.'),
  crear('p1', 'Póster Royale', 'Hogar', 18, 20, '#15110a', 'Impresión de 40 × 60 cm en papel mate.'),
  crear('p2', 'Póster Marfil', 'Hogar', 18, 17, '#ece3cb', 'Versión marfil, 40 × 60 cm en papel mate.'),
  crear('j1', 'Baraja Royale', 'Juegos', 16, 12, '#12261f', '54 cartas con dorso negro y dorado.'),
  crear('j2', 'Set de 50 fichas', 'Juegos', 39, 8, '#3a1319', 'Cincuenta fichas con estuche de aluminio.'),
  crear('j3', 'Set de 100 fichas', 'Juegos', 69, 5, '#3a1319', 'Cien fichas de cinco valores en estuche.'),
  crear('j4', 'Dados dorados', 'Juegos', 12, 25, '#15110a', 'Dos dados de 16 mm con acabado dorado.'),
  crear('j5', 'Tapete de póker', 'Juegos', 45, 7, '#12261f', 'Fieltro verde de 90 cm con el emblema.'),
];

const USUARIOS_DEMO: Usuario[] = [
  { nombre: 'Admin Royale', correo: 'admin@biozin.com', rol: 'admin', activo: true },
  { nombre: 'Soporte Royale', correo: 'soporte@biozin.com', rol: 'soporte', activo: true },
  { nombre: 'Ana Mora', correo: 'cliente@biozin.com', rol: 'cliente', activo: true },
  { nombre: 'Luis Vargas', correo: 'luis@correo.com', rol: 'cliente', activo: true },
  { nombre: 'Marta Solís', correo: 'marta@correo.com', rol: 'cliente', activo: false },
];

const PEDIDOS_DEMO: Pedido[] = [
  {
    no: 'BR-10241', correo: 'cliente@biozin.com', cliente: 'Ana Mora', fecha: '13 oct', estado: 'Pendiente',
    pago: 'Billetera', direccion: 'Limón, Guácimo',
    items: [{ id: 't1', nombre: 'Camiseta Royale', talla: 'M', cantidad: 2, precio: 28 }, { id: 'g1', nombre: 'Gorra Royale Negra', talla: null, cantidad: 1, precio: 24 }],
    historial: [{ estado: 'Pendiente', fecha: '13 oct' }],
  },
  {
    no: 'BR-10238', correo: 'luis@correo.com', cliente: 'Luis Vargas', fecha: '12 oct', estado: 'Preparando',
    pago: 'SINPE Móvil', direccion: 'Heredia, Centro',
    items: [{ id: 'h1', nombre: 'Sudadera High Roller', talla: 'L', cantidad: 1, precio: 62 }],
    historial: [{ estado: 'Pendiente', fecha: '12 oct' }, { estado: 'Preparando', fecha: '13 oct' }],
  },
  {
    no: 'BR-10230', correo: 'cliente@biozin.com', cliente: 'Ana Mora', fecha: '9 oct', estado: 'Enviado',
    pago: 'Tarjeta', direccion: 'Limón, Guácimo',
    items: [{ id: 'j2', nombre: 'Set de 50 fichas', talla: null, cantidad: 1, precio: 39 }],
    historial: [{ estado: 'Pendiente', fecha: '9 oct' }, { estado: 'Preparando', fecha: '10 oct' }, { estado: 'Enviado', fecha: '11 oct' }],
  },
  {
    no: 'BR-10215', correo: 'luis@correo.com', cliente: 'Luis Vargas', fecha: '2 oct', estado: 'Entregado',
    pago: 'Tarjeta', direccion: 'Heredia, Centro',
    items: [{ id: 'r1', nombre: 'Taza Jackpot', talla: null, cantidad: 2, precio: 14 }, { id: 'r3', nombre: 'Pin Royale', talla: null, cantidad: 1, precio: 6 }],
    historial: [{ estado: 'Pendiente', fecha: '2 oct' }, { estado: 'Preparando', fecha: '3 oct' }, { estado: 'Enviado', fecha: '4 oct' }, { estado: 'Entregado', fecha: '7 oct' }],
  },
  {
    no: 'BR-10202', correo: 'marta@correo.com', cliente: 'Marta Solís', fecha: '1 oct', estado: 'Cancelado',
    pago: 'SINPE Móvil', direccion: 'San José, Escazú',
    items: [{ id: 'r1', nombre: 'Taza Jackpot', talla: null, cantidad: 2, precio: 14 }],
    historial: [{ estado: 'Pendiente', fecha: '1 oct' }, { estado: 'Cancelado', fecha: '2 oct' }],
  },
];

// ───────────────────────── Componente ─────────────────────────
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, AtmosphereComponent, SvgIconComponent, AdminHeaderComponent, AdminNavComponent],
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
})
export class StoreComponent implements OnDestroy {
  private readonly router = inject(Router);

  // Datos fijos para la plantilla
  readonly yo = YO;
  readonly secciones = SECCIONES;
  readonly filtrosPedido = FILTROS_PEDIDO;
  readonly categorias = CATEGORIAS;
  readonly estados = ESTADOS;
  readonly rolesLista = Object.keys(ROLES) as Rol[];
  readonly roles = ROLES;
  readonly iconBuscar = ICON_SEARCH;

  // Estado de la pantalla
  readonly seccion = signal<Seccion>('res');
  readonly filtroPedidos = signal<'Todos' | Estado>('Todos');
  readonly busquedaProd = signal('');
  readonly soloBajo = signal(false);
  readonly hoja = signal<Hoja | null>(null);
  readonly pedidoNo = signal<string | null>(null);
  readonly clienteCorreo = signal<string | null>(null);
  readonly errorForm = signal('');
  readonly dialogo = signal<Dialogo | null>(null);
  readonly aviso = signal<string | null>(null);

  // Datos simulados (cuando exista la API, se reemplazan por servicios)
  readonly productos = signal<Producto[]>(PRODUCTOS_DEMO);
  readonly pedidos = signal<Pedido[]>(PEDIDOS_DEMO);
  readonly usuarios = signal<Usuario[]>(USUARIOS_DEMO);

  // Formularios
  formProd = { id: '', nombre: '', categoria: 'Camisetas' as Categoria, precio: '', stock: '', descripcion: '' };
  formUsr = { nombre: '', correo: '', rol: 'cliente' as Rol, clave: '' };

  private temporizador?: ReturnType<typeof setTimeout>;

  // ── Derivados ──
  readonly ventas = computed(() => this.pedidos().filter(o => o.estado !== 'Cancelado').reduce((a, o) => a + this.totalPedido(o), 0));
  readonly porAtender = computed(() => this.pedidos().filter(o => o.estado === 'Pendiente').length);
  readonly stockBajo = computed(() => this.productos().filter(p => p.stock <= STOCK_BAJO));
  readonly recientes = computed(() => this.pedidos().slice(0, 5));
  readonly pedidosFiltrados = computed(() => this.pedidos().filter(o => this.filtroPedidos() === 'Todos' || o.estado === this.filtroPedidos()));
  readonly productosFiltrados = computed(() => {
    const q = this.norm(this.busquedaProd().trim());
    return q ? this.productos().filter(p => this.norm(`${p.nombre} ${p.categoria}`).includes(q)) : this.productos();
  });
  readonly inventario = computed(() => (this.soloBajo() ? this.stockBajo() : this.productos()));
  readonly unidades = computed(() => this.productos().reduce((a, p) => a + p.stock, 0));
  readonly valorInventario = computed(() => this.productos().reduce((a, p) => a + p.stock * p.precio, 0));
  readonly clientes = computed(() => this.usuarios().filter(u => u.rol === 'cliente').map(u => {
    const propios = this.pedidos().filter(o => o.correo === u.correo);
    const gastado = propios.filter(o => o.estado !== 'Cancelado').reduce((a, o) => a + this.totalPedido(o), 0);
    return { ...u, cantidad: propios.length, gastado };
  }));
  readonly pedidoAbierto = computed(() => this.pedidos().find(o => o.no === this.pedidoNo()) ?? null);
  readonly clienteAbierto = computed(() => this.usuarios().find(u => u.correo === this.clienteCorreo()) ?? null);

  ngOnDestroy(): void {
    clearTimeout(this.temporizador);
  }

  // ── Navegación ──
  onBack(): void {
    this.router.navigate(['/admin']);
  }
  irSeccion(s: Seccion): void {
    this.seccion.set(s);
    this.cerrarHoja();
  }
  cerrarHoja(): void {
    this.hoja.set(null);
    this.errorForm.set('');
  }

  // ── Utilidades ──
  private norm(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  private hoy(): string {
    return new Date().toLocaleDateString('es-CR', { day: 'numeric', month: 'short' }).replace('.', '');
  }
  dinero(n: number): string {
    return `$${n.toFixed(2)}`;
  }
  mostrarAviso(texto: string): void {
    clearTimeout(this.temporizador);
    this.aviso.set(texto);
    this.temporizador = setTimeout(() => this.aviso.set(null), 3200);
  }
  trackId = (_: number, x: { id: string }) => x.id;
  trackNo = (_: number, o: Pedido) => o.no;
  trackCorreo = (_: number, u: { correo: string }) => u.correo;

  // ── Pedidos y control de estados ──
  totalPedido(o: Pedido): number {
    const s = o.items.reduce((a, i) => a + i.precio * i.cantidad, 0);
    return s + (s > 0 && s < ENVIO_GRATIS_DESDE ? COSTO_ENVIO : 0);
  }
  indiceEstado(e: Estado): number {
    return ESTADOS.indexOf(e);
  }
  fechaDe(o: Pedido, e: Estado): string {
    return o.historial.find(h => h.estado === e)?.fecha ?? '';
  }
  pedidosDe(correo: string): Pedido[] {
    return this.pedidos().filter(o => o.correo === correo);
  }
  siguientes(o: Pedido): Estado[] {
    return SIGUIENTES[o.estado];
  }
  accionDe(e: Estado): string {
    return ACCION[e] ?? e;
  }
  abrirPedido(no: string): void {
    this.pedidoNo.set(no);
    this.hoja.set('pedido');
  }
  cambiarEstado(no: string, estado: Estado): void {
    const pedido = this.pedidos().find(o => o.no === no);
    if (!pedido || !SIGUIENTES[pedido.estado].includes(estado)) return;

    this.pedidos.update(ps => ps.map(o => (o.no === no
      ? { ...o, estado, historial: [...o.historial, { estado, fecha: this.hoy() }] }
      : o)));

    if (estado === 'Cancelado') {
      // Al cancelar, las unidades vuelven al inventario.
      this.productos.update(ps => ps.map(p => {
        const devueltas = pedido.items.filter(i => i.id === p.id).reduce((a, i) => a + i.cantidad, 0);
        return devueltas ? { ...p, stock: p.stock + devueltas } : p;
      }));
    }
    this.mostrarAviso(`Pedido ${no} actualizado a ${estado.toLowerCase()}.`);
  }
  pedirCancelar(no: string): void {
    this.dialogo.set({
      titulo: `¿Cancelar el pedido ${no}?`,
      texto: 'Las unidades volverán al inventario y el cliente verá el pedido como cancelado. Esta acción no se puede deshacer.',
      ok: 'Cancelar pedido',
      conservar: 'Conservar pedido',
      accion: () => this.cambiarEstado(no, 'Cancelado'),
    });
  }

  // ── Productos ──
  nuevoProducto(): void {
    this.formProd = { id: '', nombre: '', categoria: 'Camisetas', precio: '', stock: '', descripcion: '' };
    this.errorForm.set('');
    this.hoja.set('producto');
  }
  editarProducto(id: string): void {
    const p = this.productos().find(x => x.id === id);
    if (!p) return;
    this.formProd = { id: p.id, nombre: p.nombre, categoria: p.categoria, precio: String(p.precio), stock: String(p.stock), descripcion: p.descripcion };
    this.errorForm.set('');
    this.hoja.set('producto');
  }
  guardarProducto(): void {
    const f = this.formProd;
    const nombre = f.nombre.trim();
    const precio = parseFloat(f.precio);
    const stock = Number(f.stock);
    const error =
      !nombre ? 'Escribe el nombre del producto.'
      : !(precio > 0) ? 'El precio debe ser un número mayor que 0.'
      : !(String(f.stock).trim() !== '' && Number.isInteger(stock) && stock >= 0) ? 'El stock debe ser un número entero desde 0.'
      : '';
    this.errorForm.set(error);
    if (error) return;

    const descripcion = f.descripcion.trim();
    if (f.id) {
      this.productos.update(ps => ps.map(p => (p.id === f.id ? { ...p, nombre, categoria: f.categoria, precio, stock, descripcion } : p)));
    } else {
      this.productos.update(ps => [...ps, crear(`n${Date.now()}`, nombre, f.categoria, precio, stock, '#1b150a', descripcion || 'Producto oficial de Biozin Royale.')]);
    }
    this.cerrarHoja();
    this.mostrarAviso(f.id ? 'Cambios guardados.' : 'Producto creado.');
  }
  alternarVisible(id: string): void {
    this.productos.update(ps => ps.map(p => (p.id === id ? { ...p, visible: !p.visible } : p)));
  }
  pedirEliminar(p: Producto): void {
    this.dialogo.set({
      titulo: `¿Eliminar ${p.nombre}?`,
      texto: 'El producto desaparecerá de la tienda y del inventario. Los pedidos anteriores conservan su historial. Esta acción no se puede deshacer.',
      ok: 'Eliminar producto',
      conservar: 'Conservar producto',
      accion: () => {
        this.productos.update(ps => ps.filter(x => x.id !== p.id));
        this.mostrarAviso('Producto eliminado.');
      },
    });
  }

  // ── Inventario ──
  ajustar(id: string, delta: number): void {
    this.productos.update(ps => ps.map(p => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)));
  }
  estadoStock(p: Producto): { texto: string; clase: string } {
    if (p.stock <= 0) return { texto: 'Agotado', clase: 'agotado' };
    if (p.stock <= STOCK_BAJO) return { texto: 'Stock bajo', clase: 'bajo' };
    return { texto: 'Disponible', clase: 'ok' };
  }

  // ── Clientes ──
  abrirCliente(correo: string): void {
    this.clienteCorreo.set(correo);
    this.hoja.set('cliente');
  }

  // ── Usuarios y roles ──
  cambiarRol(correo: string, rol: Rol): void {
    if (correo === YO) return;
    const u = this.usuarios().find(x => x.correo === correo);
    this.usuarios.update(us => us.map(x => (x.correo === correo ? { ...x, rol } : x)));
    if (u) this.mostrarAviso(`Rol actualizado: ${u.nombre} ahora es ${ROLES[rol].nombre.toLowerCase()}.`);
  }
  alternarBloqueo(u: Usuario): void {
    if (u.correo === YO) return;
    if (!u.activo) {
      this.usuarios.update(us => us.map(x => (x.correo === u.correo ? { ...x, activo: true } : x)));
      return;
    }
    this.dialogo.set({
      titulo: `¿Bloquear a ${u.nombre}?`,
      texto: 'No podrá iniciar sesión ni comprar hasta que reactives su cuenta.',
      ok: 'Bloquear cuenta',
      conservar: 'Mantener activa',
      accion: () => this.usuarios.update(us => us.map(x => (x.correo === u.correo ? { ...x, activo: false } : x))),
    });
  }
  nuevoUsuario(): void {
    this.formUsr = { nombre: '', correo: '', rol: 'cliente', clave: '' };
    this.errorForm.set('');
    this.hoja.set('usuario');
  }
  guardarUsuario(): void {
    const f = this.formUsr;
    const correo = f.correo.trim().toLowerCase();
    const error =
      !f.nombre.trim() ? 'Escribe el nombre del usuario.'
      : !/^\S+@\S+\.\S+$/.test(correo) ? 'Escribe un correo válido, por ejemplo nombre@correo.com.'
      : f.clave.length < 6 ? 'La contraseña temporal necesita al menos 6 caracteres.'
      : this.usuarios().some(u => u.correo === correo) ? 'Ese correo ya tiene cuenta.'
      : '';
    this.errorForm.set(error);
    if (error) return;
    this.usuarios.update(us => [...us, { nombre: f.nombre.trim(), correo, rol: f.rol, activo: true }]);
    this.cerrarHoja();
    this.mostrarAviso('Usuario creado.');
  }

  // ── Diálogo de confirmación ──
  aceptarDialogo(): void {
    const d = this.dialogo();
    this.dialogo.set(null);
    d?.accion();
  }
  cancelarDialogo(): void {
    const d = this.dialogo();
    this.dialogo.set(null);
    d?.volver?.();
  }
}