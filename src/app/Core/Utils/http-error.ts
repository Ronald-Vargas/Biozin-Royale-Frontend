export function httpErrorMsg(err: any): string {
  const status: number = err?.status ?? 0;
  const serverMsg: string = err?.error?.strResponseMessage ?? '';

  if (status === 0)   return 'No se pudo conectar con el servidor. ¿Está el backend corriendo?';
  if (status === 401) return 'Sesión expirada. Vuelve a iniciar sesión.';
  if (status === 403) return 'No tienes permiso para esta acción.';
  if (status === 404) return 'Recurso no encontrado (404).';
  if (status >= 500)  return serverMsg || `Error interno del servidor (${status}).`;

  return serverMsg || `Error ${status}.`;
}
