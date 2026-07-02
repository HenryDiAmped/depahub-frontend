import type {
  Administrador,
  LoginResponse,
  RegisterResponse,
  Propiedad,
  Inmueble,
  Inquilino,
  Contrato,
  Cuenta,
  BalanceMensual,
  Ingreso,
  Egreso,
} from './types';

const BASE_URL = 'http://localhost:8080/api';

// ============================================
// UTILIDADES PARA FETCH
// ============================================

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    // Intentar obtener el mensaje de error del backend
    let errorMessage = `Error: ${response.status}`;
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        const textError = await response.text();
        if (textError) {
          errorMessage = textError;
        }
      }
    } catch (e) {
      // Si falla al parsear el error, usar el mensaje por defecto
    }
    
    throw new Error(errorMessage);
  }

  // Si es un DELETE exitoso o respuesta vacía, retornar objeto vacío
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  // Verificar si la respuesta tiene contenido
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  // Si no es JSON, intentar obtener como texto y retornar objeto vacío
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  // Intentar parsear como JSON, si falla retornar objeto vacío
  try {
    return JSON.parse(text);
  } catch {
    return {} as T;
  }
}

// ============================================
// AUTH
// ============================================

export const authApi = {
  register: (data: Omit<Administrador, 'id'>) =>
    fetchApi<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (email: string, password: string) =>
    fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// ============================================
// ADMINISTRADORES
// ============================================

export const administradoresApi = {
  getAll: () => fetchApi<Administrador[]>('/administradores'),
  getById: (id: number) => fetchApi<Administrador>(`/administradores/${id}`),
  create: (data: Omit<Administrador, 'id'>) =>
    fetchApi<Administrador>('/administradores', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Administrador) =>
    fetchApi<Administrador>(`/administradores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchApi<void>(`/administradores/${id}`, { method: 'DELETE' }),
};

// ============================================
// PROPIEDADES
// ============================================

export const propiedadesApi = {
  getAll: (administradorId?: number) => {
    const url = administradorId
      ? `/propiedades?administradorId=${administradorId}`
      : '/propiedades';
    return fetchApi<Propiedad[]>(url);
  },
  getById: (id: number) => fetchApi<Propiedad>(`/propiedades/${id}`),
  create: (data: Propiedad) =>
    fetchApi<Propiedad>('/propiedades', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Propiedad) =>
    fetchApi<Propiedad>(`/propiedades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchApi<void>(`/propiedades/${id}`, { method: 'DELETE' }),
};

// ============================================
// INMUEBLES
// ============================================

export const inmueblesApi = {
  getAll: (propiedadId?: number) => {
    const url = propiedadId
      ? `/inmuebles?propiedadId=${propiedadId}`
      : '/inmuebles';
    return fetchApi<Inmueble[]>(url);
  },
  getById: (id: number) => fetchApi<Inmueble>(`/inmuebles/${id}`),
  create: (data: Inmueble) =>
    fetchApi<Inmueble>('/inmuebles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Inmueble) =>
    fetchApi<Inmueble>(`/inmuebles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchApi<void>(`/inmuebles/${id}`, { method: 'DELETE' }),
};

// ============================================
// INQUILINOS
// ============================================

export const inquilinosApi = {
  getAll: (inmuebleId?: number) => {
    const url = inmuebleId
      ? `/inquilinos?inmuebleId=${inmuebleId}`
      : '/inquilinos';
    return fetchApi<Inquilino[]>(url);
  },
  getById: (id: number) => fetchApi<Inquilino>(`/inquilinos/${id}`),
  create: (data: Inquilino) =>
    fetchApi<Inquilino>('/inquilinos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Inquilino) =>
    fetchApi<Inquilino>(`/inquilinos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchApi<void>(`/inquilinos/${id}`, { method: 'DELETE' }),
};

// ============================================
// CONTRATOS
// ============================================

export const contratosApi = {
  getAll: (administradorId?: number, inquilinoId?: number) => {
    let url = '/contratos';
    const params = [];
    if (administradorId) params.push(`administradorId=${administradorId}`);
    if (inquilinoId) params.push(`inquilinoId=${inquilinoId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return fetchApi<Contrato[]>(url);
  },
  getById: (id: number) => fetchApi<Contrato>(`/contratos/${id}`),
  create: (data: Contrato) =>
    fetchApi<Contrato>('/contratos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Contrato) =>
    fetchApi<Contrato>(`/contratos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchApi<void>(`/contratos/${id}`, { method: 'DELETE' }),
};

// ============================================
// CUENTAS
// ============================================

export const cuentasApi = {
  getAll: (administradorId?: number, inquilinoId?: number) => {
    let url = '/cuentas';
    const params = [];
    if (administradorId) params.push(`administradorId=${administradorId}`);
    if (inquilinoId) params.push(`inquilinoId=${inquilinoId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return fetchApi<Cuenta[]>(url);
  },
  getById: (id: number) => fetchApi<Cuenta>(`/cuentas/${id}`),
  create: (data: Cuenta) =>
    fetchApi<Cuenta>('/cuentas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Cuenta) =>
    fetchApi<Cuenta>(`/cuentas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) => fetchApi<void>(`/cuentas/${id}`, { method: 'DELETE' }),
};

// ============================================
// BALANCES MENSUALES
// ============================================

export const balancesApi = {
  getAll: (administradorId?: number) => {
    const url = administradorId
      ? `/balances-mensuales?administradorId=${administradorId}`
      : '/balances-mensuales';
    return fetchApi<BalanceMensual[]>(url);
  },
  getById: (id: number) => fetchApi<BalanceMensual>(`/balances-mensuales/${id}`),
  create: (data: BalanceMensual) =>
    fetchApi<BalanceMensual>('/balances-mensuales', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: BalanceMensual) =>
    fetchApi<BalanceMensual>(`/balances-mensuales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchApi<void>(`/balances-mensuales/${id}`, { method: 'DELETE' }),
};

// ============================================
// INGRESOS
// ============================================

export const ingresosApi = {
  getAll: (balanceId?: number) => {
    const url = balanceId ? `/ingresos?balanceId=${balanceId}` : '/ingresos';
    return fetchApi<Ingreso[]>(url);
  },
  getById: (id: number) => fetchApi<Ingreso>(`/ingresos/${id}`),
  create: (data: Ingreso) =>
    fetchApi<Ingreso>('/ingresos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Ingreso) =>
    fetchApi<Ingreso>(`/ingresos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) => fetchApi<void>(`/ingresos/${id}`, { method: 'DELETE' }),
};

// ============================================
// EGRESOS
// ============================================

export const egresosApi = {
  getAll: (balanceId?: number) => {
    const url = balanceId ? `/egresos?balanceId=${balanceId}` : '/egresos';
    return fetchApi<Egreso[]>(url);
  },
  getById: (id: number) => fetchApi<Egreso>(`/egresos/${id}`),
  create: (data: Egreso) =>
    fetchApi<Egreso>('/egresos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Egreso) =>
    fetchApi<Egreso>(`/egresos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) => fetchApi<void>(`/egresos/${id}`, { method: 'DELETE' }),
};
