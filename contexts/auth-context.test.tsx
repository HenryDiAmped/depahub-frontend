/** @vitest-environment jsdom */
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./auth-context";
import type { Administrador } from "@/lib/types";

const { push, loginApi, registerApi } = vi.hoisted(() => ({
  push: vi.fn(),
  loginApi: vi.fn(),
  registerApi: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/api", () => ({
  authApi: {
    login: loginApi,
    register: registerApi,
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

const admin: Administrador = {
  id: 1,
  nombreCompleto: "Ana Pérez",
  dni: "71794266",
  email: "ana@mail.com",
  telefono: "999999999",
  fechaRegistro: "2026-01-01",
  utilidadTotal: 0,
};

const alta: Omit<Administrador, "id"> = {
  nombreCompleto: "Ana Pérez",
  dni: "71794266",
  email: "ana@mail.com",
  telefono: "999999999",
  fechaRegistro: "2026-01-01",
  utilidadTotal: 0,
};

function AuthProbe() {
  const { admin, isLoading, login, register, logout } = useAuth();

  return (
    <div>
      <p data-testid="loading">{isLoading ? "cargando" : "listo"}</p>
      <p data-testid="admin">{admin?.nombreCompleto ?? "sin sesión"}</p>
      <button
        type="button"
        onClick={() => {
          void login("ana@mail.com", "secreto").catch(() => undefined);
        }}
      >
        Iniciar sesión
      </button>
      <button
        type="button"
        onClick={() => {
          void register(alta).catch(() => undefined);
        }}
      >
        Registrarse
      </button>
      <button type="button" onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockReset();
    loginApi.mockReset();
    registerApi.mockReset();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("login OK guarda admin y authToken y redirige a /dashboard", async () => {
    loginApi.mockResolvedValue({
      mensaje: "ok",
      token: "jwt-login",
      administrador: admin,
    });

    renderAuth();
    await screen.findByText("listo");

    await act(async () => {
      screen.getByRole("button", { name: "Iniciar sesión" }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("admin").textContent).toBe("Ana Pérez");
    });
    expect(localStorage.getItem("admin")).toBe(JSON.stringify(admin));
    expect(localStorage.getItem("authToken")).toBe("jwt-login");
    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("login fail no escribe en localStorage", async () => {
    loginApi.mockRejectedValue(new Error("Credenciales incorrectas"));

    renderAuth();
    await screen.findByText("listo");

    await act(async () => {
      screen.getByRole("button", { name: "Iniciar sesión" }).click();
    });

    await waitFor(() => {
      expect(loginApi).toHaveBeenCalled();
    });
    expect(screen.getByTestId("admin").textContent).toBe("sin sesión");
    expect(localStorage.getItem("admin")).toBeNull();
    expect(localStorage.getItem("authToken")).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });

  it("register OK guarda token + administrador y redirige a /dashboard", async () => {
    registerApi.mockResolvedValue({
      mensaje: "ok",
      token: "jwt-register",
      administrador: admin,
    });

    renderAuth();
    await screen.findByText("listo");

    await act(async () => {
      screen.getByRole("button", { name: "Registrarse" }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("admin").textContent).toBe("Ana Pérez");
    });
    expect(localStorage.getItem("admin")).toBe(JSON.stringify(admin));
    expect(localStorage.getItem("authToken")).toBe("jwt-register");
    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("al montar restaura sesión si hay admin y token", async () => {
    localStorage.setItem("admin", JSON.stringify(admin));
    localStorage.setItem("authToken", "jwt-sesion");

    renderAuth();

    expect(await screen.findByTestId("admin")).toHaveProperty(
      "textContent",
      "Ana Pérez"
    );
    expect(localStorage.getItem("admin")).toBe(JSON.stringify(admin));
    expect(localStorage.getItem("authToken")).toBe("jwt-sesion");
  });

  it("al montar, si falta admin o token, limpia ambos", async () => {
    localStorage.setItem("admin", JSON.stringify(admin));

    const { unmount } = renderAuth();
    await screen.findByText("listo");
    expect(screen.getByTestId("admin").textContent).toBe("sin sesión");
    expect(localStorage.getItem("admin")).toBeNull();
    expect(localStorage.getItem("authToken")).toBeNull();
    unmount();

    localStorage.setItem("authToken", "jwt-huerfano");
    renderAuth();
    await screen.findByText("listo");
    expect(screen.getByTestId("admin").textContent).toBe("sin sesión");
    expect(localStorage.getItem("admin")).toBeNull();
    expect(localStorage.getItem("authToken")).toBeNull();
  });

  it("logout borra storage y va a /login", async () => {
    localStorage.setItem("admin", JSON.stringify(admin));
    localStorage.setItem("authToken", "jwt-sesion");

    renderAuth();
    await screen.findByText("Ana Pérez");

    act(() => {
      screen.getByRole("button", { name: "Cerrar sesión" }).click();
    });

    expect(screen.getByTestId("admin").textContent).toBe("sin sesión");
    expect(localStorage.getItem("admin")).toBeNull();
    expect(localStorage.getItem("authToken")).toBeNull();
    expect(push).toHaveBeenCalledWith("/login");
  });
});
