"use client";
import * as Dialog from "@radix-ui/react-dialog";
import type { ProjectImage } from "@/lib/project-galleries";
import "./image-viewer.css";

export function ImageViewer({
  images,
  index,
  client,
  onChange,
  onClose,
  onRestoreFocus,
}: {
  images: ProjectImage[];
  index: number | null;
  client: string;
  onChange: (index: number) => void;
  onClose: () => void;
  onRestoreFocus: (event: Event) => void;
}) {
  if (!images.length) return null;
  const current = Math.min(index ?? 0, images.length - 1);
  const photo = images[current];
  const move = (delta: number) =>
    onChange((current + delta + images.length) % images.length);
  return (
    <Dialog.Root
      open={index !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="photo-viewer-overlay" />
        <Dialog.Content
          className="photo-viewer"
          onCloseAutoFocus={onRestoreFocus}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              event.stopPropagation();
              move(event.key === "ArrowRight" ? 1 : -1);
            }
          }}
        >
          <Dialog.Title className="sr-only">
            {client} — full screen gallery
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Use the arrow buttons or your keyboard to browse all {images.length}{" "}
            images.
          </Dialog.Description>
          <Dialog.Close
            className="photo-viewer-close"
            aria-label="Close full screen image"
          >
            CLOSE <span aria-hidden="true">×</span>
          </Dialog.Close>
          <img
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
          />
          {images.length > 1 && (
            <button
              className="photo-arrow photo-prev"
              aria-label="Previous project image"
              onClick={() => move(-1)}
            >
              ←
            </button>
          )}
          {images.length > 1 && (
            <button
              className="photo-arrow photo-next"
              aria-label="Next project image"
              onClick={() => move(1)}
            >
              →
            </button>
          )}
          <p className="photo-viewer-caption" aria-live="polite">
            <span>
              {String(current + 1).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")}
            </span>
            {photo.caption}
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
