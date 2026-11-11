"use client";

import { CheckCircle2, CircleAlert } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

interface Toast {
  id: number;
  message: string;
  tone: "success" | "error";
  action?: { label: string; run: () => void };
}

type Show = (message: string, opts?: { tone?: Toast["tone"]; action?: Toast["action"] }) => void;

const ToastContext = createContext<Show>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const show = useCallback<Show>(
    (message, opts) => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-2), { id, message, tone: opts?.tone ?? "success", action: opts?.action }]);
      setTimeout(() => dismiss(id), opts?.action ? 6000 : 3000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast-in pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border border-line bg-raised py-2.5 pl-4 pr-2 text-sm text-fg shadow-2xl shadow-black/60"
          >
            {t.tone === "success" ? (
              <CheckCircle2 size={17} className="shrink-0 text-accent" />
            ) : (
              <CircleAlert size={17} className="shrink-0 text-danger" />
            )}
            <span className="min-w-0 flex-1">{t.message}</span>
            {t.action ? (
              <button
                type="button"
                className="rounded-xl px-3 py-1.5 font-semibold text-accent hover:bg-accent-soft"
                onClick={() => {
                  t.action?.run();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            ) : (
              <span className="w-2" />
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
