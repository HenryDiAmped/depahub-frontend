// ============================================
// INTERFACES DE DATOS DE LA API
// ============================================

export interface Administrador {
  id?: number;
  nombreCompleto: string;
  dni: string;
  email: string;
  telefono: string;
  password?: string;
  fechaRegistro: string;
  utilidadTotal: number;
}

export interface Propiedad {
  id?: number;
  nombre: string;
  direccion: string;
  distrito: string;
  descripcion: string;
  administrador?: { id: number };
}

export type EstadoInmueble = 'DISPONIBLE' | 'OCUPADO' | 'MANTENIMIENTO';

export interface Inmueble {
  id?: number;
  nombre: string;
  piso: number;
  precioBase: number;
  estado: EstadoInmueble;
  descripcion: string;
  propiedad?: { id: number };
}

export type EstadoInquilino = 'ACTIVO' | 'RETIRADO';

export interface Inquilino {
  id?: number;
  nombreCompleto: string;
  dni: string;
  telefono: string;
  email?: string; // Email es opcional
  fechaNacimiento: string;
  estado: EstadoInquilino;
  inmueble?: { id: number };
}

export type EstadoContrato = 'ACTIVO' | 'FINALIZADO' | 'CANCELADO';

export interface Contrato {
  id?: number;
  fechaInicio: string;
  fechaFin: string;
  montoAlquiler: number;
  garantia: number;
  estado: EstadoContrato;
  condiciones: string;
  fechaRegistro: string;
  administrador?: { id: number };
  inquilino?: { id: number };
}

export type TipoCuenta = 'POR_PAGAR' | 'POR_COBRAR';
export type EstadoCuenta = 'PENDIENTE' | 'SALDADA';

export interface Cuenta {
  id?: number;
  tipo: TipoCuenta;
  importe: number;
  concepto: string;
  fechaEmitida: string;
  estado: EstadoCuenta;
  administrador?: { id: number };
  inquilino?: { id: number };
}

export interface BalanceMensual {
  id?: number;
  mes: number;
  anio: number;
  totalIngresos: number;
  totalEgresos: number;
  utilidad?: number;
  fechaGeneracion: string;
  administrador?: { id: number };
}

export interface Ingreso {
  id?: number;
  importe: number;
  concepto: string;
  fecha: string;
  balanceMensual?: { id: number };
}

export interface Egreso {
  id?: number;
  importe: number;
  concepto: string;
  fecha: string;
  balanceMensual?: { id: number };
}

// ============================================
// INTERFACES PARA RESPUESTAS DE LA API
// ============================================

export interface LoginResponse {
  mensaje: string;
  administrador: Administrador;
}

export interface RegisterResponse {
  mensaje: string;
  administrador: Administrador;
}

export interface ApiError {
  message: string;
  status: number;
}
