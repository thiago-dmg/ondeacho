import { ReactNode, useEffect } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
};

export function Modal({ open, title, onClose, children, footer, size = "md" }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="oa-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="oa-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`oa-modal oa-modal--${size}`}>
        <div className="oa-modal__head">
          <h2 id="oa-modal-title">{title}</h2>
          <button type="button" className="oa-modal__close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>
        <div className="oa-modal__body">{children}</div>
        {footer ? <div className="oa-modal__foot">{footer}</div> : null}
      </div>
    </div>
  );
}
