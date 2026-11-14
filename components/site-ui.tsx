"use client";
import * as Dialog from "@radix-ui/react-dialog";

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="arrow">
      <path
        d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h15M13 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}
export function Brand({ className = "" }: { className?: string }) {
  return (
    <span role="img" aria-label="IMMRSV" className={`brand ${className}`} />
  );
}
export function Close() {
  return (
    <Dialog.Close className="close-button" aria-label="Close dialog">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="m6 6 12 12M6 18 18 6"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
    </Dialog.Close>
  );
}
