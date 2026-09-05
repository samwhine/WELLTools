"use client";

import { useEffect, useMemo, useState } from "react";
import { MotionTemplate, TemplateSettings } from "@/lib/motion/registry";
import { useMotionPlayer } from "@/lib/motion/useMotionPlayer";
import { useElementSize } from "@/lib/utils/useElementSize";

// Fixed authoring size every thumbnail renders at, then scales down to fit
// the card. Keeps every template's px-based font sizes/paddings looking
// proportionally correct regardless of the card's actual rendered width.
const STAGE_WIDTH = 480;
const STAGE_HEIGHT = 360;

/**
 * Live preview thumbnail for the template browser grid (spec §42).
 * Lazy-loaded via IntersectionObserver and only mounts the animation loop
 * while the card is on screen, per the library-performance rule in spec §61
 * ("do not render 300 animated previews simultaneously").
 */
export function TemplateThumbnail({ template }: { template: MotionTemplate }) {
  const [wrapperRef, wrapperSize] = useElementSize<HTMLDivElement>();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => setVisible(entries[0]?.isIntersecting ?? false), {
      rootMargin: "150px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [wrapperRef]);

  const scale = wrapperSize.width > 0 ? wrapperSize.width / STAGE_WIDTH : 0;

  return (
    <div ref={wrapperRef} className="absolute inset-0 overflow-hidden bg-[#101114]">
      {visible && scale > 0 ? (
        <ThumbnailStage template={template} scale={scale} />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="px-6 text-center text-sm text-ink-faint">{template.name}</span>
        </div>
      )}
    </div>
  );
}

function ThumbnailStage({ template, scale }: { template: MotionTemplate; scale: number }) {
  const settings = useMemo(() => {
    const s: TemplateSettings = {};
    for (const c of template.controls) s[c.key] = c.default;
    return s;
  }, [template]);

  const canvasSize = useMemo(() => ({ width: STAGE_WIDTH, height: STAGE_HEIGHT }), []);
  const { clips, totalDuration } = useMemo(
    () => template.render(settings, canvasSize),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [template, settings]
  );
  const { bind, play, currentTime } = useMotionPlayer(clips, totalDuration, true);

  useEffect(() => {
    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalDuration]);

  return (
    <div
      style={{
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      <template.Component settings={settings} bind={bind} currentTime={currentTime} duration={totalDuration} />
    </div>
  );
}
