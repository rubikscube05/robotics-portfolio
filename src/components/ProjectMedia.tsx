import { useEffect, useRef } from "react";
import type { ProjectMedia as Media } from "../data/content";
import { Schematic } from "./Schematic";

/** Real footage, a still, or a schematic drawing; videos play only while visible. */
export function ProjectMedia({ media, eager = false }: { media: Media; eager?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  if (media.kind === "video") {
    return (
      <video
        ref={videoRef}
        className="media media--video"
        src={media.src}
        poster={media.poster}
        muted
        loop
        playsInline
        preload={eager ? "auto" : "metadata"}
        aria-label={media.alt}
      />
    );
  }

  if (media.kind === "image") {
    return (
      <img
        className="media media--image"
        src={media.src}
        alt={media.alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  return (
    <div className="media media--schematic">
      <Schematic variant={media.variant} label={media.alt} />
    </div>
  );
}
