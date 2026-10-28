"use client";

import { Accessibility, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";

type FontSize = "normal" | "large" | "extra-large";

type AccessibilityPreferences = {
  fontSize: FontSize;
  highContrast: boolean;
  reduceMotion: boolean;
};

const STORAGE_KEY = "depahub-accessibility-preferences";
const defaultPreferences: AccessibilityPreferences = {
  fontSize: "normal",
  highContrast: false,
  reduceMotion: false,
};

function applyPreferences(preferences: AccessibilityPreferences) {
  const root = document.documentElement;
  root.dataset.fontSize = preferences.fontSize;
  root.dataset.highContrast = String(preferences.highContrast);
  root.dataset.reduceMotion = String(preferences.reduceMotion);
}

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedPreferences = localStorage.getItem(STORAGE_KEY);
    if (!savedPreferences) {
      applyPreferences(defaultPreferences);
      setIsReady(true);
      return;
    }

    try {
      const parsed = JSON.parse(savedPreferences) as Partial<AccessibilityPreferences>;
      const restored = { ...defaultPreferences, ...parsed };
      setPreferences(restored);
      applyPreferences(restored);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      applyPreferences(defaultPreferences);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    applyPreferences(preferences);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [isReady, preferences]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const setFontSize = (fontSize: FontSize) => setPreferences((current) => ({ ...current, fontSize }));
  const toggle = (key: "highContrast" | "reduceMotion") =>
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  const reset = () => setPreferences(defaultPreferences);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <section
          id="accessibility-menu"
          aria-label="Opciones de accesibilidad"
          className="absolute bottom-16 right-0 w-80 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xl"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold">Accesibilidad</h2>
              <p className="text-sm text-muted-foreground">Personaliza la visualización de DepaHub.</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-md p-1 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" aria-label="Cerrar opciones de accesibilidad">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-semibold">Tamaño de texto</legend>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setFontSize("normal")} aria-pressed={preferences.fontSize === "normal"} className="rounded-md border border-border px-2 py-2 text-sm font-medium aria-pressed:bg-primary aria-pressed:text-primary-foreground">Normal</button>
              <button type="button" onClick={() => setFontSize("large")} aria-pressed={preferences.fontSize === "large"} className="rounded-md border border-border px-2 py-2 text-base font-medium aria-pressed:bg-primary aria-pressed:text-primary-foreground">Grande</button>
              <button type="button" onClick={() => setFontSize("extra-large")} aria-pressed={preferences.fontSize === "extra-large"} className="rounded-md border border-border px-2 py-2 text-lg font-medium aria-pressed:bg-primary aria-pressed:text-primary-foreground">Extra</button>
            </div>
          </fieldset>

          <div className="mt-4 space-y-2">
            <button type="button" onClick={() => toggle("highContrast")} aria-pressed={preferences.highContrast} className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><span className="font-medium">Alto contraste</span><span className="text-sm">{preferences.highContrast ? "Activado" : "Desactivado"}</span></button>
            <button type="button" onClick={() => toggle("reduceMotion")} aria-pressed={preferences.reduceMotion} className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><span className="font-medium">Reducir movimiento</span><span className="text-sm">{preferences.reduceMotion ? "Activado" : "Desactivado"}</span></button>
          </div>

          <button type="button" onClick={reset} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><RotateCcw className="h-4 w-4" aria-hidden="true" />Restablecer ajustes</button>
        </section>
      )}

      <button type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-controls="accessibility-menu" className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ring" aria-label={isOpen ? "Cerrar opciones de accesibilidad" : "Abrir opciones de accesibilidad"}>
        <Accessibility className="h-7 w-7" aria-hidden="true" />
      </button>
    </div>
  );
}
