"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

// Same track as pplx.surajgaud.com — swap for any YouTube video ID.
const YT_VIDEO_ID = "tRsQsTMvPNg";

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (v: number) => void;
  destroy?: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: Record<string, unknown>,
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [playing, setPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!document.getElementById("yt-api")) {
      const tag = document.createElement("script");
      tag.id = "yt-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    const init = () => {
      if (!containerRef.current || !window.YT) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: "0",
        width: "0",
        videoId: YT_VIDEO_ID,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          loop: 1,
          playlist: YT_VIDEO_ID,
        },
        events: {
          onReady: () => setPlayerReady(true),
        },
      });
    };

    if (window.YT?.Player) {
      init();
    } else {
      window.onYouTubeIframeAPIReady = init;
    }

    return () => {
      playerRef.current?.destroy?.();
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    window.location.href = `https://www.perplexity.ai/search/new?q=${encodeURIComponent(q)}`;
  };

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p || !playerReady) return;
    if (playing) {
      p.pauseVideo();
      setPlaying(false);
    } else {
      p.setVolume(50);
      p.playVideo();
      setPlaying(true);
    }
  };

  return (
    <main className="crt-screen flex flex-col">
      {/* Logo top-left */}
      <div className="relative z-10 p-8 sm:p-12">
        <h1
          className="crt-text text-5xl sm:text-7xl font-bold tracking-tight"
          style={{ filter: "blur(0.4px)" }}
        >
          pplx.fm
        </h1>
      </div>

      {/* Play / Pause top-right */}
      <button
        type="button"
        onClick={togglePlay}
        disabled={!playerReady}
        aria-label={playing ? "Pause music" : "Play music"}
        className="absolute top-8 right-8 sm:top-12 sm:right-12 z-10 crt-text border-2 border-current rounded-md w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-40"
      >
        <span className="text-xl leading-none">
          {playing ? "❚❚" : "▶"}
        </span>
      </button>

      {/* Hidden YouTube player */}
      <div
        ref={containerRef}
        aria-hidden
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      {/* Center form */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-4 w-full max-w-2xl"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Whats on your mind?"
            autoFocus
            className="crt-input flex-1 text-2xl sm:text-3xl text-center"
          />
          <button type="submit" className="crt-btn px-4 py-1 text-xl font-bold">
            GO
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex justify-between items-end p-6 sm:p-8 text-sm sm:text-base">
        <span className="crt-text opacity-80">Hosted on Vercel</span>
        <span className="crt-text opacity-80">
          Ideated with V0 by rishabh
        </span>
      </div>

      {/* CRT overlays — on top of content */}
      <div className="crt-noise" aria-hidden />
      <div className="crt-scanlines" aria-hidden />
      <div className="crt-vignette" aria-hidden />

      {/* Boot sequence — runs once on mount */}
      <div className="crt-boot" aria-hidden />
    </main>
  );
}
