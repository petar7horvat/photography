(function () {
  'use strict';

  function initAlbumVideo(id) {
    const hero = document.querySelector('.album-hero');
    if (!hero || hero.dataset.videoReady) return;
    hero.dataset.videoReady = 'true';
    const video = hero.querySelector('video');
    const stage = hero;
    const backdrop = hero.querySelector('.album-video-backdrop');
    const blurFrame = hero.querySelector('.album-video-blur-frame');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection;
    const listed = window.SNIMCI?.[id];
    const validName = new RegExp('^' + id + '(?:[1-9][0-9]*)?\\.mp4$', 'i');
    const files = [...new Set((Array.isArray(listed) ? listed : [id + '1.mp4'])
      .filter(name => typeof name === 'string' && validName.test(name)))];
    // Shuffle filenames only. No requests are made for the other videos.
    for (let i = files.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [files[i], files[j]] = [files[j], files[i]];
    }
    const cover = window.FOTOGRAFIJE?._covers?.[id] || id + '.jpg';
    const poster = new URL('slike/cover/thumbs/' + encodeURIComponent(cover), document.baseURI).href;
    // Do not request or display the cover while a video is loading.
    function showFallback(show) {
      hero.classList.toggle('has-video-fallback', !!show);
      backdrop.style.backgroundImage = show ? 'url(' + JSON.stringify(poster) + ')' : '';
    }
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'none';

    let visible = false;
    let ready = false;
    let blocked = false;
    let pending = false;
    let exhausted = !files.length;
    let candidate = 0;
    let generation = 0;
    let paintedGeneration = -1;
    showFallback(exhausted || motion.matches || !!connection?.saveData);

    function sizeToVideo() {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;
      stage.style.setProperty('--album-video-ratio', String(vw / vh));
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (!width || !height) return;
      const configured = parseFloat(getComputedStyle(stage).getPropertyValue('--album-video-max-zoom'));
      const zoomLimit = Number.isFinite(configured) ? Math.max(1, Math.min(1.5, configured)) : 1.18;
      const contain = Math.min(width / vw, height / vh);
      const cover = Math.max(width / vw, height / vh);
      // Fill when possible; otherwise limit cropping and blend the remaining area.
      const scale = Math.min(cover, contain * zoomLimit);
      video.style.width = `${vw * scale}px`;
      video.style.height = `${vh * scale}px`;
    }
    if ('ResizeObserver' in window) new ResizeObserver(sizeToVideo).observe(stage);
    else window.addEventListener('resize', sizeToVideo, { passive: true });
    function paintBackdrop() {
      sizeToVideo();
      if (paintedGeneration === generation || !video.videoWidth || video.readyState < 2) return;
      try {
        // One small still frame per clip, not a second playing/decoding video.
        // Canvas is displayed directly: no pixel readback or export is needed.
        const scale = Math.min(1, 320 / Math.max(video.videoWidth, video.videoHeight));
        blurFrame.width = Math.max(1, Math.round(video.videoWidth * scale));
        blurFrame.height = Math.max(1, Math.round(video.videoHeight * scale));
        const ctx = blurFrame.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, blurFrame.width, blurFrame.height);
        paintedGeneration = generation;
        hero.classList.add('has-video-blur-frame');
      } catch {
        // Keep the neutral backdrop if frame capture is unavailable.
      }
    }
    video.addEventListener('loadedmetadata', sizeToVideo);
    video.addEventListener('loadeddata', paintBackdrop);

    function canPlay() {
      return ready && (visible || document.body.classList.contains('viewer-open'))
        && !document.hidden && !blocked && !exhausted
        && !document.body.classList.contains('menu-open')
        && (!motion.matches && !connection?.saveData);
    }
    function sync() {
      showFallback(exhausted || blocked || motion.matches || !!connection?.saveData);
      if (!canPlay()) {
        video.pause();

        return;
      }
      if (!video.hasAttribute('src')) {
        video.src = new URL('slike/snimci/' + encodeURIComponent(files[candidate++]), document.baseURI).href;
        generation++;
      }
      if (pending || !video.paused) return;
      pending = true;
      const attempt = generation;
      video.play().catch(error => {
        if (attempt === generation && error.name === 'NotAllowedError') {
          blocked = true;
          showFallback(true);
        }
      }).finally(() => {
        if (attempt !== generation) return;
        pending = false;
        if (!canPlay()) video.pause();

      });
    }
    video.addEventListener('playing', () => {
      if (!canPlay()) { video.pause(); return; }
      hero.classList.add('has-video-frame');
      paintBackdrop();

    });
    video.addEventListener('error', () => {
      generation++;
      pending = false;
      video.pause();
      video.removeAttribute('src');
      hero.classList.remove('has-video-frame');
      hero.classList.remove('has-video-blur-frame');
      exhausted = candidate >= files.length;

      // Try another listed clip only if this one is absent or unsupported.
      sync();
    });
    motion.addEventListener('change', sync);
    connection?.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pagehide', () => video.pause());
    window.addEventListener('pageshow', sync);
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        sync();
      }, { threshold: 0 }).observe(stage);
    } else visible = true;

    // Let layout and the first thumbnail start before requesting the video.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const first = document.querySelector('#photo-grid img');
      let timer;
      function start() {
        clearTimeout(timer);
        first?.removeEventListener('load', start);
        first?.removeEventListener('error', start);
        ready = true;
        sync();
      }
      if (!first || first.complete) start();
      else {
        first.addEventListener('load', start, { once: true });
        first.addEventListener('error', start, { once: true });
        timer = setTimeout(start, 1500);
      }
    }));

  }

  window.PH.initAlbumVideo = initAlbumVideo;
})();
