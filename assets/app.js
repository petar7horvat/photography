(function(){
'use strict';
const {config, route, albums, galleryHref, configureCovers, applySEO, createViewerHistory, setupMasonry, orderAlbumPhotos} = window.PH;
const PROFILE = { ...config, location: `${config.city}, ${config.country}` };
const main = document.getElementById('main');
if (route.type !== 'home') {
  const template = document.getElementById(route.type === 'contact' ? 'contact-template' : 'gallery-template');
  main.replaceChildren(template.content.cloneNode(true));
  main.classList.add('inner-page');
}
document.body.classList.add(`page-${route.type}`);
configureCovers();
applySEO();

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Keep the native dialog open throughout its short exit animation.
const menu = $('#mobile-menu');
const menuButton = $('.menu-toggle');
if (menu && menuButton) {
  let animation = null;
  let closing = null;
  const animateMenu = (from, to, duration) => {
    animation?.cancel();
    if (reducedMotion.matches || !menu.animate) return null;
    animation = menu.animate([from, to], { duration, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
    return animation;
  };
  const closeMenu = () => {
    if (closing) return closing;
    if (!menu.open) return Promise.resolve();
    const style = getComputedStyle(menu);
    const from = { opacity: style.opacity, transform: style.transform };
    menu.classList.add('is-closing');
    const exit = animateMenu(from, { opacity: 0, transform: 'translateY(-8px)' }, 160);
    closing = (async () => {
      if (exit) await exit.finished.catch(() => {});
      menu.close();
      animation?.cancel(); animation = null;
      menu.classList.remove('is-closing');
    })().finally(() => { closing = null; });
    return closing;
  };
  menuButton.addEventListener('click', () => {
    if (menu.open || closing) return;
    menu.showModal(); document.body.classList.add('menu-open');
    menuButton.setAttribute('aria-expanded', 'true');
    animateMenu({ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'translateY(0)' }, 200);
  });
  $('[data-close-menu]', menu).addEventListener('click', closeMenu);
  menu.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
  $$('a', menu).forEach(a => a.addEventListener('click', async event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (closing) return;
    await closeMenu();
    navigatePage(a.href);
  }));
  menu.addEventListener('close', () => {
    document.body.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
  matchMedia('(min-width: 701px)').addEventListener('change', event => {
    if (event.matches && menu.open) closeMenu();
  });
}

function revealElements(root = document) {
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('is-pending'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px 20px 0px' });
  $$('.reveal', root).forEach(el => {
    // Never hide initially visible content, including restored scroll positions.
    if (el.getBoundingClientRect().top > innerHeight) el.classList.add('is-pending');
    observer.observe(el);
  });
  reducedMotion.addEventListener('change', e => {
    if (e.matches) { $$('.is-pending').forEach(el => el.classList.remove('is-pending')); observer.disconnect(); }
  }, { once: true });
}
revealElements();

let pageAnimation = null;
let leaving = false;
async function navigatePage(href) {
  if (leaving) return;
  const destination = new URL(href, location.href);
  if (destination.pathname === location.pathname && destination.search === location.search) {
    location.assign(destination.href); return;
  }
  leaving = true;
  if (!reducedMotion.matches && main.animate && (route.type === 'contact' || destination.searchParams.get('stranica') === 'kontakt')) {
    pageAnimation = main.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-5px)'}], {duration:130,easing:'ease-out',fill:'forwards'});
    await pageAnimation.finished.catch(() => {});
  }
  location.assign(destination.href);
}
document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href]');
  if (!link || link.target || link.hasAttribute('download')) return;
  const destination = new URL(link.href, location.href);
  if (destination.pathname !== new URL('index.html', document.baseURI).pathname) return;
  if (destination.pathname === location.pathname && destination.search === location.search) return;
  if (route.type === 'contact' || destination.searchParams.get('stranica') === 'kontakt') {
    event.preventDefault(); navigatePage(destination.href);
  }
});
window.addEventListener('pageshow', () => { pageAnimation?.cancel(); leaving = false; });


function safeInstagram(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['instagram.com', 'www.instagram.com'].includes(url.hostname) ? url : null;
  } catch { return null; }
}
function configureContact() {
  $$('.brand-name').forEach(el => { el.firstChild.textContent = config.name; });
  $$('.menu-bottom,.hero-topline').forEach(el => { el.textContent = PROFILE.location; });
  $('.site-footer p').textContent = config.brand;
  const emailSlot = $('#email-slot');
  if (!emailSlot) return;
  $('#contact-name').textContent = config.name;
  $('.contact-hero-copy p').textContent = config.bio;
  $('.contact-row:last-child span').textContent = PROFILE.location;
  const email = PROFILE.email.trim();
  if (/^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/.test(email)) {
    emailSlot.href = `mailto:${email}`;
    emailSlot.textContent = email;
  }
  const instagram = safeInstagram(PROFILE.instagram);
  if (instagram) {
    const a = $('#instagram-slot'); a.href = instagram.href;
    $('span', a).textContent = '@' + (instagram.pathname.split('/').filter(Boolean)[0] || 'Instagram');
  }
}
configureContact();

async function loadManifest() { return { albums }; }

function ensureDimensions(photo) {
  if (photo.measured) return Promise.resolve(photo);
  if (photo.loadingDimensions) return photo.loadingDimensions;
  photo.loadingDimensions = new Promise(resolve => {
    const image = new Image();
    image.onload = () => { photo.width = image.naturalWidth; photo.height = image.naturalHeight; photo.measured = true; resolve(photo); };
    image.onerror = () => resolve(photo);
    image.src = photo.src;
  });
  return photo.loadingDimensions;
}

function displayStatus(title, message, retry = false) {
  const status = $('#album-status');
  status.replaceChildren(); status.hidden = false;
  const h = document.createElement('h2'); h.textContent = title;
  const p = document.createElement('p'); p.textContent = message;
  status.append(h, p);
  if (retry) {
    const button = document.createElement('button');
    button.className = 'status-button'; button.textContent = 'Pokušaj ponovo';
    button.addEventListener('click', () => location.reload()); status.append(button);
  }
}

async function initAlbum() {
  const grid = $('#photo-grid');
  if (!grid) return;
  if (route.type === 'invalid') {
    $('#album-title').textContent = 'Stranica nije pronađena';
    displayStatus('Izaberi galeriju.', 'Dostupne galerije su navedene iznad.');
    return;
  }
  const data = await loadManifest();
  const id = route.id || data.albums[0]?.id;
  const albumIndex = data.albums.findIndex(a => a.id === id);
  const album = data.albums[albumIndex];
  if (!album) {
    $('#album-title').textContent = 'Galerija nije pronađena';
    displayStatus('Izaberi galeriju.', 'Dostupne galerije su navedene iznad.');
    return;
  }
  album.photos = orderAlbumPhotos(album);
  applySEO(route);
  $('#album-title').textContent = album.title;
  $('#album-tabs').replaceChildren(...data.albums.map(a => {
    const link = document.createElement('a'); link.href = galleryHref(a.id);
    link.textContent = a.shortTitle;
    if (a.id === album.id) link.setAttribute('aria-current', 'page');
    return link;
  }));
  const next = data.albums[(albumIndex + 1) % data.albums.length];
  $('#next-album').href = galleryHref(next.id);
  $('#next-album h2').textContent = next.title;
  $('#album-end').hidden = false;
  if (!album.photos.length) {
    displayStatus('Fotografije uskoro.', 'Ova galerija još nema fotografija.');
    return;
  }
    const fragment = document.createDocumentFragment();
    album.photos.forEach((photo, i) => {
    const figure = document.createElement('figure'); figure.className = 'photo-item';
    const link = document.createElement('a'); link.className = 'photo-link';
    link.href = photo.src; link.dataset.index = i;
    link.setAttribute('aria-label', `Otvori fotografiju ${i + 1}: ${photo.title}`);
    const previewSrc = new URL(
      `slike/${album.id}/thumbs/${encodeURIComponent(photo.file)}`,
      document.baseURI
    ).href;

    const img = document.createElement('img');

    img.alt = photo.alt;
    img.width = photo.width;
    img.height = photo.height;
    img.loading = i < 3 ? 'eager' : 'lazy';
    img.decoding = 'async';

    photo.thumb = previewSrc;

    img.addEventListener('error', () => {
      img.alt = 'Sličica trenutno nije dostupna.';
      link.classList.add('image-unavailable');

      console.warn('Proveri putanju sličice:', previewSrc);
    }, { once: true });

    img.src = previewSrc;
    link.append(img);
    figure.append(link); fragment.append(figure);
  });
grid.append(fragment);
setupMasonry(grid);
$('#album-status').hidden = true;
await enableViewer(album, grid);
}

async function enableViewer(album, grid) {
  let viewer = null;
  let opening = false;
  let closingFromHistory = false;
  let desired = null;
  let initiatingLink = null;
  const photos = album.photos;
  const getIndex = () => {
    const value = new URLSearchParams(location.hash.slice(1)).get('foto');
    if (!value) return null;
    const index = photos.findIndex(photo => photo.file === value);
    return index >= 0 ? index : null;
  };
  const navigation = createViewerHistory({ browser: window, getIndex, getKey: index => photos[index].file, onNavigate: index => {
    desired = index;
    if (viewer) {
      if (viewer.isDestroying) return;
      if (index === null) { closingFromHistory = true; viewer.close(); }
      else if (viewer.currIndex !== index) viewer.goTo(index);
    } else if (!opening && index !== null) open(index, false);
  } });

  async function open(index, push = true) {
    if (opening || viewer) return;
    opening = true; desired = index;
    const PhotoSwipe = window.PhotoSwipe;
    if (!PhotoSwipe) { opening = false; location.assign(photos[index].src); return; }
    await ensureDimensions(photos[index]);
    if (!push && desired === null) { opening = false; return; }
    if (desired !== null) index = desired;
    const scrollY = window.scrollY;
    const pageElements = [...document.body.children].filter(el => ['HEADER', 'MAIN', 'FOOTER'].includes(el.tagName));
    const oldInert = pageElements.map(el => el.inert);
    const oldBodyStyle = document.body.getAttribute('style');
    const pswp = new PhotoSwipe({
      dataSource: photos.map(photo => ({ src: photo.src, width: photo.width, height: photo.height, alt: photo.alt, msrc: photo.thumb, srcset: photo.srcset })),
      index, bgOpacity: 1, loop: false, showHideAnimationType: 'fade',
      showAnimationDuration: reducedMotion.matches ? 0 : 280,
      hideAnimationDuration: reducedMotion.matches ? 0 : 230,
      zoomAnimationDuration: reducedMotion.matches ? 0 : 230,
      closeOnVerticalDrag: true, pinchToClose: true,
      imageClickAction: 'zoom', clickToCloseNonZoomable: false,
      doubleTapAction: 'zoom', tapAction: 'toggle-controls',
      initialZoomLevel: 'fit', secondaryZoomLevel: 1.8, maxZoomLevel: 4,
      preload: [1, 2], trapFocus: true, returnFocus: true,
      closeTitle: 'Zatvori fotografiju', zoomTitle: 'Uvećaj ili umanji',
      arrowPrevTitle: 'Prethodna fotografija', arrowNextTitle: 'Sledeća fotografija',
      indexIndicatorSep: ' / ', errorMsg: 'Fotografija nije učitana. Proveri vezu i otvori je ponovo.',
      paddingFn: viewport => ({ top: viewport.x < 700 ? 80 : 72, bottom: viewport.x < 700 ? 28 : 40, left: viewport.x < 700 ? 0 : 70, right: viewport.x < 700 ? 0 : 70 }),
    });
    viewer = pswp; opening = false; closingFromHistory = false;
    navigation.enter(index, push);
    document.body.classList.add('viewer-open');
    Object.assign(document.body.style, { position: 'fixed', top: `-${scrollY}px`, left: '0', right: '0', width: '100%' });
    pageElements.forEach(el => { el.inert = true; });
    pswp.on('change', () => {
      navigation.change(pswp.currIndex); desired = pswp.currIndex;
      [pswp.currIndex - 1, pswp.currIndex, pswp.currIndex + 1].forEach(index => {
        const photo = photos[index];
        if (!photo || photo.measured) return;
        ensureDimensions(photo).then(() => {
          if (viewer !== pswp || pswp.isDestroying || !photo.measured) return;
          Object.assign(pswp.options.dataSource[index], {width:photo.width,height:photo.height});
          pswp.refreshSlideContent(index);
        });
      });
    });
    pswp.on('afterInit', () => {
      pswp.element.setAttribute('aria-label', `${album.title} — pregled fotografija`);
      const live = $('.pswp__counter', pswp.element);
      if (live) { live.setAttribute('aria-live', 'polite'); live.setAttribute('aria-atomic', 'true'); }
    });
    pswp.on('close', () => {
      if (!closingFromHistory) navigation.close();
      desired = null;
    });
    pswp.on('destroy', () => {
      viewer = null;
      document.body.classList.remove('viewer-open');
      if (oldBodyStyle === null) document.body.removeAttribute('style');
      else document.body.setAttribute('style', oldBodyStyle);
      pageElements.forEach((el, i) => { el.inert = oldInert[i]; });
      window.scrollTo({ top: scrollY, behavior: 'instant' });
      const target = initiatingLink || $(`a[data-index="${pswp.currIndex}"]`, grid);
      target?.focus({ preventScroll: true });
      // A Forward gesture can arrive while the closing animation is running.
      if (desired !== null) open(desired, false);
    });
    pswp.init();
  }
  grid.addEventListener('click', event => {
    const link = event.target.closest('a[data-index]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault(); initiatingLink = link;
    open(Number(link.dataset.index), true);
  });
  // Reloading an existing viewer entry already has its album underneath it.
  // An externally opened deep link needs a base entry created first.
  const existingViewerEntry = typeof history.state?.phViewer === 'string';
  const directIndex = existingViewerEntry ? getIndex() : navigation.prepareDirectLink();
  if (directIndex !== null) open(directIndex, !existingViewerEntry);
  else if (new URLSearchParams(location.hash.slice(1)).has('foto')) {
    const url = new URL(location.href); url.hash = '';
    history.replaceState(history.state, '', url);
  }
}

$$('.photo-grid').forEach(setupMasonry);

initAlbum().catch(() => {
  displayStatus('Fotografije nisu učitane.', 'Proveri internet vezu i pokušaj ponovo.', true);
});

})();
