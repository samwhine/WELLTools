"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Clip } from "./keyframes";
import { MotionPlayer, PlayerState } from "./engine";

export function useMotionPlayer(clips: Clip[], duration: number, loop = true) {
  const playerRef = useRef<MotionPlayer | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [state, setState] = useState<PlayerState>("idle");

  useEffect(() => {
    const player = new MotionPlayer({
      duration,
      loop,
      onTick: setCurrentTime,
      onStateChange: setState,
    });
    playerRef.current = player;
    return () => player.destroy();
    // Recreate the player when the timeline shape changes (duration/loop);
    // clip content changes are re-bound below without a full restart.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, loop]);

  const bind = useCallback(
    (id: string) => (el: HTMLElement | SVGElement | null) => {
      const clip = clips.find((c) => c.id === id);
      if (clip) playerRef.current?.bind(el, clip);
    },
    [clips]
  );

  const play = useCallback(() => playerRef.current?.play(), []);
  const pause = useCallback(() => playerRef.current?.pause(), []);
  const seek = useCallback((t: number) => playerRef.current?.seek(t), []);
  const restart = useCallback(() => playerRef.current?.restart(), []);

  return { bind, play, pause, seek, restart, currentTime, state };
}
