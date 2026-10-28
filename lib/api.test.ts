import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  authApi,
  contratosApi,
  ingresosApi,
  propiedadesApi,
} from "./api";

const store = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => {
    store.set(key, value);
  },
  removeItem: (key: string) => {
    store.delete(key);
  },
  clear: () => store.clear(),
};

function jsonResponse(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {}
) {
  const status = init.status ?? 200;
  const payload = JSON.stringify(body);
  const headers = new Headers({
    "content-type": "application/json",
    ...init.headers,
  });
  return new Response(payload, { status, headers });
}

function emptyResponse(status = 204, extraHeaders: Record<string, string> = {}) {
  const headers = new Headers(extraHeaders);
  return new Response(null, { status, headers });
}

function lastCall() {
  const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
  const [url, options] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
  return { url, options, headers: new Headers(options.headers) };
}

describe("api client", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    store.clear();
    fetchMock.mockReset();
    vi.stubGlobal("window", { localStorage: localStorageMock });
    vi.stubGlobal("localStorage", localStorageMock);
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("pone Content-Type: application/json", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));
    await propiedadesApi.getAll();

    expect(lastCall().headers.get("Content-Type")).toBe("application/json");
    expect(lastCall().url).toBe("http://localhost:8080/api/propiedades");
  });

  it("si hay authToken en localStorage manda Authorization Bearer", async () => {
    localStorage.setItem("authToken", "abc123");
    fetchMock.mockResolvedValue(jsonResponse([]));
    await propiedadesApi.getAll(1);

    expect(lastCall().headers.get("Authorization")).toBe("Bearer abc123");
  });

  it("login y register no dependen de token previo", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ token: "nuevo", administrador: {}, mensaje: "ok" })
    );
    await authApi.login("ana@mail.com", "secreto");

    const login = lastCall();
    expect(login.url).toBe("http://localhost:8080/api/auth/login");
    expect(login.options.method).toBe("POST");
    expect(login.headers.get("Authorization")).toBeNull();
    expect(login.options.body).toBe(
      JSON.stringify({ email: "ana@mail.com", password: "secreto" })
    );

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ token: "nuevo", administrador: {}, mensaje: "ok" })
    );
    await authApi.register({
      nombreCompleto: "Ana",
      dni: "123",
      email: "ana@mail.com",
      telefono: "999",
      fechaRegistro: "2026-01-01",
      utilidadTotal: 0,
    });

    const register = lastCall();
    expect(register.url).toBe("http://localhost:8080/api/auth/register");
    expect(register.headers.get("Authorization")).toBeNull();
  });

  it("en error JSON usa message o error", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: "Token inválido o expirado" }, { status: 401 })
    );
    await expect(propiedadesApi.getAll()).rejects.toThrow("Token inválido o expirado");

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: "DNI duplicado" }, { status: 409 })
    );
    await expect(propiedadesApi.getAll()).rejects.toThrow("DNI duplicado");
  });

  it("204 o cuerpo vacío no explota al parsear", async () => {
    fetchMock.mockResolvedValueOnce(emptyResponse(204));
    await expect(propiedadesApi.delete(1)).resolves.toEqual({});

    fetchMock.mockResolvedValueOnce(
      emptyResponse(200, { "content-length": "0" })
    );
    await expect(propiedadesApi.getById(1)).resolves.toEqual({});

    fetchMock.mockResolvedValueOnce(emptyResponse(200));
    await expect(propiedadesApi.getById(2)).resolves.toEqual({});
  });

  it("contratosApi.obtenerPdf pide Accept application/pdf y devuelve un Blob", async () => {
    const pdf = new Blob(["%PDF"], { type: "application/pdf" });
    fetchMock.mockResolvedValue(
      new Response(pdf, {
        status: 200,
        headers: { "content-type": "application/pdf" },
      })
    );

    const result = await contratosApi.obtenerPdf(9);
    expect(await result.text()).toBe("%PDF");
    expect(lastCall().url).toBe("http://localhost:8080/api/contratos/9/pdf");
    expect(lastCall().headers.get("Accept")).toBe("application/pdf");
  });

  it("arma query params de propiedades, contratos e ingresos", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse([])));

    await propiedadesApi.getAll(1);
    expect(lastCall().url).toBe(
      "http://localhost:8080/api/propiedades?administradorId=1"
    );

    await contratosApi.getAll(1, 2);
    expect(lastCall().url).toBe(
      "http://localhost:8080/api/contratos?administradorId=1&inquilinoId=2"
    );

    await ingresosApi.getAll(5);
    expect(lastCall().url).toBe("http://localhost:8080/api/ingresos?balanceId=5");
  });
});
