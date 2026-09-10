gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const scenes = gsap.utils.toArray(".scene");
const progressFill = document.querySelector(".progress-fill");
const soundToggle = document.querySelector(".sound-toggle");
const soundLabel = document.querySelector(".sound-label");
const soundIcon = document.querySelector(".sound-icon");
const story = document.querySelector(".story");
const preloader = document.querySelector(".preloader");
const preloaderVideo = document.querySelector(".preloader-video");
const backgroundMusic = document.querySelector("#background-music");
const preloaderShade = document.querySelector(".preloader-shade");
const preloaderContent = document.querySelector(".preloader-content");
const firstSceneVideo = scenes[0]?.querySelector(".scene-video");
const firstScene = scenes[0];
const secondScene = scenes[1];
const scrollCue = document.querySelector(".scroll-cue");
const countdown = document.querySelector(".countdown");
const locationCopy = document.querySelector(".location-copy");
const mediaUpload = document.querySelector("#media-upload");
const uploadStatus = document.querySelector(".upload-status");
const messageTrigger = document.querySelector(".message-trigger");
const messageForm = document.querySelector(".message-form");
const messageClose = document.querySelector(".message-close");
const messageStatus = document.querySelector(".message-status");
const sarhahAccountUrl = "https://1892026.sarhne.com";

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
      {
        scale: 1.16,
        yPercent: 4,
        autoAlpha: 0.45,
        filter: "blur(7px) saturate(0.8)",
      },
      {
        scale: 1,
        yPercent: 0,
        autoAlpha: 1,
        filter: "blur(0px) saturate(1)",
        ease: "none",
        scrollTrigger: {
          trigger: scene,
          start: "top bottom",
          end: "top top",
          scrub: 1.05,
          invalidateOnRefresh: true,
        },
      },
    );

    gsap.fromTo(
      scene,
      { autoAlpha: 0.55 },
      {
        autoAlpha: 1,
        ease: "none",
        scrollTrigger: {
          trigger: scene,
          start: "top bottom",
          end: "top 25%",
          scrub: 0.9,
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
  if (scrollCue) {
    scrollCue.classList.toggle("is-hidden", activeIndex > 0);
  }
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
  preloader.addEventListener("click", () => {
    playBackgroundMusic();
  });
}

playBackgroundMusic();

function playBackgroundMusic() {
  if (!backgroundMusic) return;
  backgroundMusic.play().catch(() => {});
}

if (firstScene) {
  firstScene.addEventListener("click", () => {
    goToScene(1);
  });
}

if (secondScene) {
  secondScene.addEventListener("click", () => {
    goToScene(2);
  });
}

if (scrollCue) {
  scrollCue.addEventListener("click", (event) => {
    event.stopPropagation();
    goToScene(1);
  });
}

if (locationCopy) {
  locationCopy.addEventListener("click", async (event) => {
    event.stopPropagation();

    const location = locationCopy.dataset.location || "";
    const copyText = locationCopy.querySelector(".location-copy-text");
    const copyIcon = locationCopy.querySelector(".location-copy-icon");

    if (!location || location === "اكتب عنوان الفرح هنا") return;

    try {
      await navigator.clipboard.writeText(location);
    } catch {
      const fallback = document.createElement("textarea");
      fallback.value = location;
      fallback.setAttribute("readonly", "");
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand("copy");
      fallback.remove();
    }

    locationCopy.classList.add("is-copied");
    if (copyText) copyText.textContent = "تم نسخ اللوكيشن";
    if (copyIcon) copyIcon.textContent = "✓";

    window.setTimeout(() => {
      locationCopy.classList.remove("is-copied");
      if (copyText) copyText.textContent = "نسخ اللوكيشن";
      if (copyIcon) copyIcon.textContent = "⧉";
    }, 2200);
  });
}

if (mediaUpload) {
  mediaUpload.addEventListener("change", () => {
    const files = Array.from(mediaUpload.files || []);
    if (!uploadStatus) return;

    if (!files.length) {
      uploadStatus.textContent = "اختار صور أو فيديوهات من جهازك";
      return;
    }

    const fileNames = files.map((file) => file.name).join("، ");
    uploadStatus.textContent = `تم اختيار ${files.length} ملف: ${fileNames}`;
  });
}

if (messageTrigger && messageForm) {
  messageClose?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    messageForm.reset();
    messageForm.hidden = true;
    messageTrigger.setAttribute("aria-expanded", "false");
  });

  messageTrigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = !messageForm.hidden;
    messageForm.hidden = isOpen;
    messageTrigger.setAttribute("aria-expanded", String(!isOpen));
    if (!isOpen) messageForm.querySelector("textarea")?.focus();
  });

  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const message = messageForm.querySelector("textarea");
    if (!message?.value.trim()) return;

    if (messageStatus) {
      messageStatus.textContent = "جاري تحويلك إلى حساب الصراحة...";
    }

    message.value = "";
    messageForm.hidden = true;
    messageTrigger.setAttribute("aria-expanded", "false");

    if (sarhahAccountUrl) {
      window.location.href = sarhahAccountUrl;
    }
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
  { passive: true },
);

window.addEventListener(
  "touchmove",
  () => {
    // Let the browser continue natural mobile scrolling and click handling.
  },
  { passive: true },
);

window.addEventListener(
  "touchend",
  (event) => {
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
  { passive: true },
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

if (countdown) {
  const now = new Date();
  let weddingDate = new Date(now.getFullYear(), 8, 18, 20, 0, 0);

  if (weddingDate <= now) {
    weddingDate = new Date(now.getFullYear() + 1, 8, 18, 20, 0, 0);
  }

  const countdownDays = countdown.querySelector('[data-countdown="days"]');
  const countdownHours = countdown.querySelector('[data-countdown="hours"]');
  const countdownMinutes = countdown.querySelector(
    '[data-countdown="minutes"]',
  );
  const countdownSeconds = countdown.querySelector(
    '[data-countdown="seconds"]',
  );

  const updateCountdown = () => {
    const remaining = Math.max(0, weddingDate.getTime() - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (countdownDays)
      countdownDays.textContent = String(days).padStart(2, "0");
    if (countdownHours) {
      countdownHours.textContent = String(hours).padStart(2, "0");
    }
    if (countdownMinutes) {
      countdownMinutes.textContent = String(minutes).padStart(2, "0");
    }
    if (countdownSeconds) {
      countdownSeconds.textContent = String(seconds).padStart(2, "0");
    }
  };

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initIntro, { once: true });
} else {
  initIntro();
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
  gsap.delayedCall(7, hidePreloader);
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
