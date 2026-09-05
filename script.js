gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const scenes = gsap.utils.toArray(".scene");
const progressFill = document.querySelector(".progress-fill");
const soundToggle = document.querySelector(".sound-toggle");
const soundLabel = document.querySelector(".sound-label");
const soundIcon = document.querySelector(".sound-icon");
const story = document.querySelector(".story");
const preloader = document.querySelector(".preloader");
const preloaderVideo = document.querySelector(".preloader-video");
const preloaderShade = document.querySelector(".preloader-shade");
const preloaderContent = document.querySelector(".preloader-content");
const firstSceneVideo = scenes[0]?.querySelector(".scene-video");
const firstScene = scenes[0];
const firstSceneClickTarget = scenes[0];

let soundEnabled = false;
let activeIndex = 0;
let isAnimatingScroll = false;
let introInitStarted = false;
let introTransitionStarted = false;
let touchStartY = 0;

scenes.forEach((scene, index) => {
  const video = scene.querySelector(".scene-video");
  const content = scene.querySelector(".scene-content");
  if (!video) return;

  if (index > 0 && content) {
    gsap.fromTo(
      content,
      { y: 42, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: {
          trigger: scene,
          start: "top 72%",
          end: "top 28%",
          toggleActions: "play reverse play reverse",
        },
      },
    );
  }

  if (index > 0) {
    gsap.fromTo(
      video,
      { scale: 1.13 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: scene,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.1,
        },
      },
    );
  }

  ScrollTrigger.create({
    trigger: scene,
    start: "top 55%",
    end: "bottom 45%",
    onEnter: () => activateScene(scene),
    onEnterBack: () => activateScene(scene),
  });
});

if (progressFill && story) {
  gsap.to(progressFill, {
    height: "100%",
    ease: "none",
    scrollTrigger: {
      trigger: story,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4,
    },
  });
}

function activateScene(scene) {
  if (!scene) return;

  activeIndex = scenes.indexOf(scene);
  scenes.forEach((item) => {
    const video = item.querySelector(".scene-video");
    if (!video) return;

    if (item === scene) {
      video.muted = !soundEnabled;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}

function goToScene(index) {
  if (!scenes.length) return;

  const nextIndex = Math.max(0, Math.min(index, scenes.length - 1));

  if (nextIndex === activeIndex || isAnimatingScroll) return;

  isAnimatingScroll = true;

  gsap.to(window, {
    duration: 0.82,
    scrollTo: {
      y: scenes[nextIndex],
      autoKill: false,
    },
    ease: "power3.inOut",

    onComplete: () => {
      activeIndex = nextIndex;
      isAnimatingScroll = false;
    },

    onInterrupt: () => {
      isAnimatingScroll = false;
    },
  });
}

if (preloader) {
  preloader.addEventListener("click", hidePreloader);
}

if (firstScene) {
  firstScene.addEventListener("click", () => {
    goToScene(1);
  });
}

window.addEventListener(
  "wheel",
  (event) => {
    if (Math.abs(event.deltaY) < 8) return;
    event.preventDefault();
    goToScene(activeIndex + (event.deltaY > 0 ? 1 : -1));
  },
  { passive: false },
);

window.addEventListener(
  "touchstart",
  (event) => {
    if (event.touches.length !== 1) return;
    touchStartY = event.touches[0].clientY;
  },
  { passive: false },
);

window.addEventListener(
  "touchmove",
  (event) => {
    event.preventDefault();
  },
  { passive: false },
);

window.addEventListener(
  "touchend",
  (event) => {
    event.preventDefault();
    const distance = touchStartY - event.changedTouches[0].clientY;
    if (Math.abs(distance) < 48) {
      if (
        firstScene &&
        firstScene.contains(event.target) &&
        activeIndex === 0
      ) {
        goToScene(1);
      }
      return;
    }
    goToScene(activeIndex + (distance > 0 ? 1 : -1));
  },
  { passive: false },
);

if (soundToggle) {
  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    if (soundLabel) {
      soundLabel.textContent = soundEnabled
        ? "\u0627\u0644\u0635\u0648\u062a \u064a\u0639\u0645\u0644"
        : "\u0627\u0644\u0635\u0648\u062a \u0645\u063a\u0644\u0642";
    }
    if (soundIcon) {
      soundIcon.textContent = soundEnabled ? "\u25d6" : "\u2301";
    }

    const activeScene = scenes.find((scene) =>
      ScrollTrigger.isInViewport(scene, 0.5),
    );
    if (activeScene) {
      const video = activeScene.querySelector(".scene-video");
      if (!video) return;
      video.muted = !soundEnabled;
      if (soundEnabled) video.play().catch(() => {});
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initIntro, { once: true });
} else {
  initIntro();
}
const scene1 = document.querySelector("#scene-1");

if (scene1) {
  scene1.addEventListener("click", () => {
    if (document.body.classList.contains("is-loading")) return;

    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  });
}
function initIntro() {
  if (introInitStarted) return;
  introInitStarted = true;

  prepareIntroTransition();
  ScrollTrigger.refresh();

  if (preloaderVideo) {
    preloaderVideo.play().catch(() => {});
  }
  if (firstSceneVideo) {
    firstSceneVideo.pause();
    restartVideo(firstSceneVideo);
  }

  revealPreloaderVideo();
  gsap.delayedCall(3, hidePreloader);
}

function prepareIntroTransition() {
  if (preloader) {
    gsap.set(preloader, {
      autoAlpha: 1,
      backgroundColor: "rgba(23, 35, 30, 1)",
    });
  }

  if (preloaderVideo) {
    gsap.set(preloaderVideo, {
      scale: 1.04,
      yPercent: 0,
      rotateX: 0,
      rotateY: 0,
      z: 0,
      autoAlpha: 1,
      // filter: "saturate(0.86) contrast(1.08) blur(0px)",
      transformPerspective: 1400,
    });
  }

  if (firstSceneVideo) {
    gsap.set(firstSceneVideo, {
      scale: 0.68,
      yPercent: 9,
      rotateX: 24,
      rotateY: -9,
      z: -360,
      autoAlpha: 0,
      // filter: "saturate(0.7) contrast(1.08) blur(4px)",
      transformPerspective: 1400,
    });
  }
}

function revealPreloaderVideo() {
  if (!preloaderVideo) return;

  gsap.fromTo(
    preloaderVideo,
    {
      scale: 1.14,
      rotateX: 9,
      rotateY: -5,
      autoAlpha: 0,
      // filter: "saturate(0.76) contrast(1.12) blur(3px)",
    },
    {
      duration: 1.2,
      scale: 1.04,
      rotateX: 0,
      rotateY: 0,
      autoAlpha: 1,
      // filter: "saturate(0.86) contrast(1.08) blur(0px)",
      ease: "power3.out",
    },
  );
}

function hidePreloader() {
  if (introTransitionStarted) return;
  introTransitionStarted = true;

  if (!preloader || !preloaderVideo || !firstSceneVideo) {
    document.body.classList.remove("is-loading");
    activateScene(scenes[0]);
    return;
  }

  document.body.classList.add("is-entering");
  firstSceneVideo.muted = !soundEnabled;
  restartVideo(firstSceneVideo);
  firstSceneVideo.play().catch(() => {});

  const timeline = gsap.timeline({
    defaults: { ease: "power3.inOut" },
    onComplete: () => {
      document.body.classList.remove("is-loading");
      document.body.classList.remove("is-entering");
      preloader.classList.add("is-hidden");
      // إضافة هذا السطر لمنع المطب من حجب الضغطات مستقبلاً
      preloader.style.pointerEvents = "none";
      preloaderVideo.pause();
      activateScene(scenes[0]);
      ScrollTrigger.refresh();
    },
  });

  timeline
    .to(
      preloader,
      {
        duration: 1.05,
        autoAlpha: 0,
      },
      0.12,
    )
    .to(
      preloaderVideo,
      {
        duration: 1,
        scale: 1.28,
        yPercent: -4,
        rotateX: -18,
        rotateY: 7,
        z: 260,
        autoAlpha: 0,
      },
      0,
    )
    .to(
      firstSceneVideo,
      {
        duration: 1.55,
        scale: 1.08,
        yPercent: 0,
        rotateX: 0,
        rotateY: 0,
        z: 0,
        autoAlpha: 1,
        ease: "expo.out",
      },
      0.06,
    );
}

function restartVideo(video) {
  try {
    video.currentTime = 0;
  } catch {
    // Some browsers block seeking until metadata is available.
  }
}
