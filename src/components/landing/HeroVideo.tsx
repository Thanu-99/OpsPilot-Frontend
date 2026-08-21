import { useState } from "react";

const videos = ["/videos/scene1.mp4", "/videos/scene2.mp4"];

function HeroVideo() {
  const [videoIndex, setVideoIndex] = useState(0);

  function playNextVideo() {
    setVideoIndex((currentIndex) =>
      currentIndex === videos.length - 1 ? 0 : currentIndex + 1,
    );
  }

  return (
    <div className="relative h-full min-h-[480px] overflow-hidden bg-black lg:min-h-[680px]">
      <video
        key={videos[videoIndex]}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={playNextVideo}
        className="absolute inset-0 size-full object-cover object-center"
      >
        <source src={videos[videoIndex]} type="video/mp4" />
      </video>

      {/* Blends the footage into the dark text panel on the left */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/50 to-transparent" />

      {/* Keeps video refined and readable against the page */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/20" />

      <div className="absolute bottom-6 right-6 text-xs font-medium tracking-wide text-white/50">
        {String(videoIndex + 1).padStart(2, "0")} /{" "}
        {String(videos.length).padStart(2, "0")}
      </div>
    </div>
  );
}

export default HeroVideo;