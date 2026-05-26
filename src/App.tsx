import { ArrowRight, Github, Globe, Heart, Linkedin, Mail } from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef } from "react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4";
const LOGO_VIDEO_URL = "/aurora-logo.mp4";

const navLinks = ["Features", "Playlists", "Import Audio", "Library", "About"];
const featurePills = [
  "Lossless Audio",
  "FLAC Support",
  "Playlist Sync",
  "AI Recommendations",
  "Audio Extraction",
  "Cloud Music Vault",
];

function useCinematicVideoFade() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const monitorFrameRef = useRef<number | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);
  const opacityRef = useRef(0);
  const fadingOutRef = useRef(false);

  const cancelFade = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const setVideoOpacity = useCallback((value: number) => {
    opacityRef.current = value;
    if (videoRef.current) {
      videoRef.current.style.opacity = String(value);
    }
  }, []);

  const fadeTo = useCallback(
    (target: number, duration = 500) => {
      const video = videoRef.current;
      if (!video) return;

      cancelFade();

      const startOpacity = opacityRef.current;
      const delta = target - startOpacity;
      const start = performance.now();

      const animate = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setVideoOpacity(startOpacity + delta * eased);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        } else {
          frameRef.current = null;
          setVideoOpacity(target);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    },
    [cancelFade, setVideoOpacity],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const stopFadeOutMonitor = () => {
      if (monitorFrameRef.current !== null) {
        cancelAnimationFrame(monitorFrameRef.current);
        monitorFrameRef.current = null;
      }
    };

    const cancelRestartTimeout = () => {
      if (restartTimeoutRef.current !== null) {
        window.clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
    };

    const restartPlayback = () => {
      cancelFade();
      stopFadeOutMonitor();
      cancelRestartTimeout();
      fadingOutRef.current = false;
      setVideoOpacity(0);

      window.setTimeout(() => {
        video.currentTime = 0;
        void video.play();
        fadeTo(1);
        startFadeOutMonitor();
      }, 100);
    };

    const startFadeOutMonitor = () => {
      stopFadeOutMonitor();

      const monitor = () => {
        if (Number.isFinite(video.duration) && !fadingOutRef.current) {
          const remaining = video.duration - video.currentTime;
          if (remaining <= 0.55) {
            fadingOutRef.current = true;
            fadeTo(0);
            restartTimeoutRef.current = window.setTimeout(restartPlayback, Math.max(remaining * 1000, 0));
          }
        }

        if (!video.ended) {
          monitorFrameRef.current = requestAnimationFrame(monitor);
        }
      };

      monitorFrameRef.current = requestAnimationFrame(monitor);
    };

    setVideoOpacity(0);

    const handleLoadedData = () => {
      fadingOutRef.current = false;
      void video.play();
      fadeTo(1);
      startFadeOutMonitor();
    };

    const handleEnded = () => {
      restartPlayback();
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("ended", handleEnded);

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      handleLoadedData();
    }

    return () => {
      cancelFade();
      stopFadeOutMonitor();
      cancelRestartTimeout();
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("ended", handleEnded);
    };
  }, [cancelFade, fadeTo, setVideoOpacity]);

  return videoRef;
}

function AmbientStage() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.14),transparent_24%),radial-gradient(circle_at_82%_22%,rgba(116,141,255,0.12),transparent_27%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.1),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(0,0,0,0.68)_0%,rgba(0,0,0,0.22)_36%,rgba(0,0,0,0.5)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.82)_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[4] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.035] blur-3xl animate-pulse-soft" />
      <div className="pointer-events-none absolute inset-0 z-[5] opacity-50">
        {Array.from({ length: 24 }).map((_, index) => (
          <span
            className="absolute h-1 w-1 rounded-full bg-white/55 shadow-[0_0_18px_rgba(255,255,255,0.55)] animate-pulse-soft"
            key={index}
            style={{
              left: `${8 + ((index * 37) % 84)}%`,
              top: `${10 + ((index * 29) % 76)}%`,
              animationDelay: `${index * 180}ms`,
              opacity: 0.16 + (index % 5) * 0.07,
            }}
          />
        ))}
      </div>
    </>
  );
}

function BackgroundVideo() {
  const videoRef = useCinematicVideoFade();

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full translate-y-[17%] object-cover"
      muted
      autoPlay
      playsInline
      preload="auto"
      src={VIDEO_URL}
    />
  );
}

function Nav() {
  return (
    <nav className="relative z-20 px-6 py-6">
      <div className="liquid-glass mx-auto flex max-w-5xl items-center justify-between rounded-full px-6 py-3">
        <a className="flex items-center gap-2 text-lg font-semibold text-white" href="#" aria-label="Aurora home">
          <video
            aria-hidden="true"
            autoPlay
            className="h-7 w-7 rounded-full object-cover"
            loop
            muted
            playsInline
            preload="auto"
            src={LOGO_VIDEO_URL}
          />
          <span>Aurora</span>
        </a>

        <div className="hidden gap-8 text-sm font-medium text-white/80 md:flex">
          {navLinks.map((link) => (
            <a className="transition-colors hover:text-white" href="#" key={link}>
              {link}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden text-sm font-medium text-white transition-colors hover:text-white/75 sm:inline-flex">
            Upload
          </button>
          <button className="liquid-glass rounded-full px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5">
            Launch App
          </button>
        </div>
      </div>
    </nav>
  );
}

function ImportBar() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="mt-8 w-full max-w-2xl space-y-4 animate-fade-rise [animation-delay:260ms]">
      <form className="liquid-glass flex items-center gap-3 rounded-full py-2 pl-6 pr-2" onSubmit={handleSubmit}>
        <input
          aria-label="Video URL"
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40 sm:text-base"
          placeholder="Paste YouTube, Instagram or video URL"
          type="url"
        />
        <button
          aria-label="Import audio"
          className="rounded-full bg-white p-3 text-black transition-transform duration-300 hover:scale-105"
          type="submit"
        >
          <ArrowRight size={20} />
        </button>
      </form>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {featurePills.map((pill) => (
          <span
            className="liquid-glass rounded-full px-5 py-2 text-sm text-white/80 transition-all duration-300 hover:bg-white/5"
            key={pill}
          >
            {pill}
          </span>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-12 pt-24 text-center md:-translate-y-[8%] md:pt-20">
      <div className="max-w-6xl animate-fade-rise">
        <h1 className="mb-8 max-w-[min(100%,72rem)] font-serifDisplay text-5xl tracking-[0] text-white md:whitespace-nowrap md:text-6xl lg:text-7xl">
          Built for people who truly feel music
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
          Import songs from videos, build immersive playlists, and create your own cinematic music universe powered by
          beautifully crafted audio experiences.
        </p>
      </div>

      <ImportBar />

      <div className="mt-10 flex flex-col items-center justify-center gap-4 animate-fade-rise [animation-delay:420ms] sm:flex-row">
        <button className="rounded-full bg-white px-8 py-4 font-medium text-black transition-transform duration-300 hover:scale-[1.03]">
          Start Listening
        </button>
        <button className="liquid-glass rounded-full px-8 py-4 font-medium text-white transition-colors hover:bg-white/5">
          View Manifesto
        </button>
      </div>
    </main>
  );
}

function SocialLinks() {
  const socials = [
    { label: "GitHub", icon: Github },
    { label: "Gmail", icon: Mail },
    { label: "LinkedIn", icon: Linkedin },
    { label: "Website", icon: Globe },
  ];

  return (
    <footer className="relative z-10 flex flex-col items-center gap-5 pb-10">
      <div className="flex justify-center gap-4">
        {socials.map(({ label, icon: Icon }) => (
          <button
            aria-label={label}
            className="liquid-glass rounded-full p-4 text-white/80 transition-all duration-300 hover:bg-white/5 hover:text-white"
            key={label}
          >
            <Icon size={19} />
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-center text-sm font-medium tracking-[0] text-white/65">Made by Ojaswi Kashtheriya</p>
        <div className="flex w-64 items-center justify-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/55 to-white/25" />
          <Heart aria-hidden="true" className="h-3.5 w-3.5 fill-white text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.55)]" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-white/55 to-white/25" />
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-black">
      <BackgroundVideo />
      <AmbientStage />

      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <Nav />
        <Hero />
        <SocialLinks />
      </div>
    </div>
  );
}
