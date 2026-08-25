(() => {
  const marquees = document.querySelectorAll('[data-logo-marquee]');
  const SPEED_PX_PER_SECOND = 75; // Same approximate pace as the Toronto SIGGRAPH 0.5px/frame scroller.
  const TOUCH_RESUME_DELAY = 900;
  const MOUSE_RESUME_DELAY = 600;

  marquees.forEach((marquee) => {
    const track = marquee.querySelector('.logo-marquee-track');
    const firstGroup = track?.querySelector('.logo-marquee-group');
    if (!track || !firstGroup) return;

    let isMouseDown = false;
    let isTouching = false;
    let startX = 0;
    let startScrollLeft = 0;
    let resumeAt = 0;
    let lastTime = performance.now();
    let loopWidth = 0;

    const measure = () => {
      loopWidth = firstGroup.getBoundingClientRect().width;
      if (loopWidth > 0 && marquee.scrollLeft >= loopWidth) {
        marquee.scrollLeft %= loopWidth;
      }
    };

    const pause = () => {
      resumeAt = Number.POSITIVE_INFINITY;
    };

    const resumeAfter = (delay) => {
      resumeAt = performance.now() + delay;
    };

    const normalize = () => {
      if (!loopWidth) measure();
      if (!loopWidth) return;
      while (marquee.scrollLeft >= loopWidth) marquee.scrollLeft -= loopWidth;
      while (marquee.scrollLeft < 0) marquee.scrollLeft += loopWidth;
    };

    const animate = (now) => {
      const delta = Math.min(now - lastTime, 50);
      lastTime = now;

      const canMove =
        !document.hidden &&
        !isMouseDown &&
        !isTouching &&
        now >= resumeAt;

      if (canMove && loopWidth > 0) {
        marquee.scrollLeft += SPEED_PX_PER_SECOND * (delta / 1000);
        normalize();
      }

      requestAnimationFrame(animate);
    };

    // Desktop: auto-scroll continues while hovering. It pauses only when the
    // user actively clicks/drags, matching the Toronto SIGGRAPH behavior.
    marquee.addEventListener('mousedown', (event) => {
      if (event.button !== 0) return;
      isMouseDown = true;
      pause();
      marquee.classList.add('is-dragging');
      startX = event.pageX;
      startScrollLeft = marquee.scrollLeft;
    });

    window.addEventListener('mousemove', (event) => {
      if (!isMouseDown) return;
      event.preventDefault();
      const walk = (event.pageX - startX) * 1.5;
      marquee.scrollLeft = startScrollLeft - walk;
      normalize();
    }, { passive: false });

    const endMouseDrag = () => {
      if (!isMouseDown) return;
      isMouseDown = false;
      marquee.classList.remove('is-dragging');
      resumeAfter(MOUSE_RESUME_DELAY);
    };

    window.addEventListener('mouseup', endMouseDrag);
    marquee.addEventListener('mouseleave', () => {
      if (isMouseDown) endMouseDrag();
    });

    // Mobile/tablet: touching the strip pauses it immediately. Native page
    // scrolling remains available. Auto-scroll resumes shortly after release.
    marquee.addEventListener('touchstart', () => {
      isTouching = true;
      pause();
    }, { passive: true });

    const endTouch = () => {
      isTouching = false;
      resumeAfter(TOUCH_RESUME_DELAY);
    };

    marquee.addEventListener('touchend', endTouch, { passive: true });
    marquee.addEventListener('touchcancel', endTouch, { passive: true });

    // Re-measure after images load and whenever the strip changes size.
    track.querySelectorAll('img').forEach((img) => {
      if (!img.complete) img.addEventListener('load', measure, { once: true });
    });

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(measure);
      observer.observe(marquee);
      observer.observe(firstGroup);
    } else {
      window.addEventListener('resize', measure);
    }

    measure();
    requestAnimationFrame(animate);
  });
})();
