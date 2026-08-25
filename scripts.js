(() => {
  const marquees = document.querySelectorAll('[data-logo-marquee]');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  marquees.forEach((marquee) => {
    let resumeTimer = null;

    const pause = () => {
      if (resumeTimer) window.clearTimeout(resumeTimer);
      resumeTimer = null;
      marquee.classList.add('is-paused');
    };

    const resume = (delay = 900) => {
      if (resumeTimer) window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        marquee.classList.remove('is-paused');
        resumeTimer = null;
      }, delay);
    };

    // Touch / pen: stop as soon as the user touches the strip, then resume
    // smoothly after they lift their finger. Page scrolling remains available.
    marquee.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch' || event.pointerType === 'pen') pause();
    }, { passive: true });

    marquee.addEventListener('pointerup', (event) => {
      if (event.pointerType === 'touch' || event.pointerType === 'pen') resume(1400);
    }, { passive: true });

    marquee.addEventListener('pointercancel', () => resume(1400), { passive: true });

    // Desktop: pause while the cursor is over the logos, then continue.
    marquee.addEventListener('mouseenter', () => {
      if (finePointer.matches) pause();
    });
    marquee.addEventListener('mouseleave', () => {
      if (finePointer.matches) resume(350);
    });

    // Also pause when tabbing into the area if future logo links are added.
    marquee.addEventListener('focusin', pause);
    marquee.addEventListener('focusout', () => resume(350));
  });

  document.addEventListener('visibilitychange', () => {
    marquees.forEach((marquee) => {
      if (document.hidden) marquee.classList.add('is-paused');
      else marquee.classList.remove('is-paused');
    });
  });
})();
