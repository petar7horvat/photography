(function () {
  'use strict';
  const read = (doc, name) => doc.querySelector(`meta[name="${name}"]`)?.content.trim() || '';
  function readSettings(doc) {
    return {
      name: read(doc, 'site:name'), brand: read(doc, 'site:brand'), title: read(doc, 'site:title'),
      description: read(doc, 'description'), url: read(doc, 'site:url'),
      email: read(doc, 'site:email'), instagram: read(doc, 'site:instagram'),
      city: read(doc, 'site:city'), country: read(doc, 'site:country'), countryCode: read(doc, 'site:country-code'),
      bio: read(doc, 'site:bio'), hero: read(doc, 'site:hero'), contactImage: read(doc, 'site:contact-image'),
      heroAlt: read(doc, 'site:hero-alt'), contactAlt: read(doc, 'site:contact-alt'),
      socialImage: read(doc, 'site:social-image'), socialAlt: read(doc, 'site:social-alt'),
      verification: read(doc, 'site:verification'),
    };
  }
  function publicBase(config, href) {
    try {
      const url = config.url ? new URL(config.url) : new URL('./', href);
      if (!['https:', 'http:'].includes(url.protocol) || ['localhost', '127.0.0.1'].includes(url.hostname)) return '';
      url.search = ''; url.hash = '';
      if (url.pathname.endsWith('/index.html')) url.pathname = url.pathname.slice(0, -10);
      if (!url.pathname.endsWith('/')) url.pathname += '/';
      return url.href;
    } catch { return ''; }
  }
  const config = readSettings(document);
  const parameters = new URLSearchParams(location.search);
  const requestedAlbum = parameters.get('galerija') || parameters.get('album');
  const route = requestedAlbum ? { type: 'gallery', id: requestedAlbum === 'priroda' ? 'pejzazi' : requestedAlbum }
    : parameters.get('stranica') === 'kontakt' ? { type: 'contact' }
    : parameters.has('stranica') ? { type: 'invalid' } : { type: 'home' };
  const albums = (window.GALERIJE || []).map(album => ({ ...album, shuffle: true,
    photos: (window.FOTOGRAFIJE?.[album.id] || []).map(entry => {
      const photo = typeof entry === 'string' ? { file: entry } : { ...entry };
      if (typeof photo.file !== 'string' || /[\\/]/.test(photo.file) || !/\.(jpe?g|png)$/i.test(photo.file)) return null;
      const src = new URL(`slike/${album.id}/${encodeURIComponent(photo.file)}`, document.baseURI).href;
      const measured = Number(photo.width) > 0 && Number(photo.height) > 0;
      return { ...photo, src, thumb: src, title: photo.alt || album.title,
        alt: photo.alt || `Fotografija iz galerije ${album.title}`,
        width: measured ? Number(photo.width) : 1600, height: measured ? Number(photo.height) : 1200,
        measured,
      };
    }).filter(Boolean),
  }));
  const galleryHref = id => `index.html?galerija=${encodeURIComponent(id)}`;
  function pageHref(page) {
    return page.type === 'contact' ? 'index.html?stranica=kontakt'
      : page.type === 'gallery' ? galleryHref(page.id) : 'index.html';
  }
  function meta(name, value, property = false) {
    const attribute = property ? 'property' : 'name';
    let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
    if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, name); document.head.append(element); }
    element.content = value;
  }
  function applySEO(page = route) {
    const album = albums.find(a => a.id === page.id);
    const invalid = page.type === 'invalid' || (page.type === 'gallery' && !album);
    const title = invalid ? `Galerija nije pronađena — ${config.brand}`
      : page.type === 'contact' ? `Kontakt — ${config.name}, ${config.city}`
      : album ? `${album.title} — ${config.name} | Fotografija, ${config.city}` : config.title;
    const description = page.type === 'contact'
      ? `${config.name}, ${config.city}, ${config.country}. ${config.bio} Kontakt za fotografisanje: ${config.email}.`
      : album ? `${album.title} — fotografije. ${config.name}, ${config.city}. Galerija i kontakt za fotografisanje i saradnju.`
      : config.description;
    document.title = title;
    meta('description', description); meta('author', config.name);
    meta('robots', invalid ? 'noindex,follow' : 'index,follow,max-image-preview:large');
    meta('og:title', title, true); meta('og:description', description, true);
    meta('og:site_name', config.brand, true); meta('og:type', 'website', true);
    meta('twitter:title', title); meta('twitter:description', description);
    meta('twitter:card', 'summary_large_image');
    if (config.verification) meta('google-site-verification', config.verification);
    const base = publicBase(config, location.href);
    const person = { '@type': 'Person', name: config.name, description: config.bio,
      jobTitle: 'Fotograf', email: config.email,
      homeLocation: { '@type': 'Place', name: `${config.city}, ${config.country}` },
      sameAs: /^https:\/\/(www\.)?instagram\.com\//.test(config.instagram) ? [config.instagram] : [],
    };
    const graph = [person];
    if (base && !invalid) {
      const canonical = new URL(pageHref(page), base).href;
      let link = document.head.querySelector('link[rel="canonical"]');
      if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.append(link); }
      link.href = canonical;
      meta('og:url', canonical, true);
      const social = new URL(config.socialImage || `slike/cover/${config.hero}`, base).href;
      meta('og:image', social, true); meta('og:image:alt', config.socialAlt, true);
      meta('twitter:image', social); meta('twitter:image:alt', config.socialAlt);
      person['@id'] = base + '#person'; person.url = base;
      graph.push({ '@type': 'WebSite', '@id': base + '#website', url: base,
        name: config.brand, inLanguage: 'sr-Latn', publisher: { '@id': person['@id'] } });
      const webPage = { '@type': page.type === 'contact' ? 'ContactPage' : album ? 'CollectionPage' : 'WebPage',
        '@id': canonical + '#page', url: canonical, name: title, description, inLanguage: 'sr-Latn',
        isPartOf: { '@id': base + '#website' }, about: { '@id': person['@id'] } };
      graph.push(webPage);
      if (album) {
        graph.push({ '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Galerija', item: new URL('index.html', base).href },
          { '@type': 'ListItem', position: 2, name: album.title, item: canonical },
        ] });
        webPage.mainEntity = { '@type': 'ItemList', numberOfItems: album.photos.length,
          itemListElement: album.photos.map((photo, i) => ({ '@type': 'ListItem', position: i + 1,
            item: { '@type': 'ImageObject', contentUrl: new URL(`slike/${album.id}/${encodeURIComponent(photo.file)}`, base).href,
              caption: photo.alt, ...(photo.measured ? { width: photo.width, height: photo.height } : {}),
              ...(photo.author ? { creator: { '@type': 'Person', name: photo.author } } : {}),
            } })) };
      }
    }
    let schema = document.getElementById('structured-data');
    if (!schema) { schema = document.createElement('script'); schema.type = 'application/ld+json'; schema.id = 'structured-data'; document.head.append(schema); }
    schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  }
  function configureCovers(root = document) {
    root.querySelectorAll('img[data-cover]').forEach(img => {
      const id = img.dataset.cover;
      let name = id === 'index' ? config.hero : id === 'kontakt' ? config.contactImage : `${id}.jpg`;
      name = window.FOTOGRAFIJE?._covers?.[name.replace(/\.[^.]+$/, '').toLowerCase()] || name;
      const stem = name.replace(/\.[^.]+$/, '');
      const candidates = [...new Set([name, ...['jpg', 'png', 'jpeg', 'JPG', 'PNG', 'JPEG'].map(ext => `${stem}.${ext}`),
        ...(id === 'zivotinje' ? ['zivotinja.jpg', 'zivotinja.png', 'zivotinja.jpeg'] : [])])]
        .map(file => new URL(`slike/cover/${encodeURIComponent(file)}`, document.baseURI).href);
      const fallback = albums.find(a => a.id === id)?.photos[0]?.src;
      if (fallback) candidates.push(fallback);
      img.alt = id === 'index' ? config.heroAlt : id === 'kontakt' ? config.contactAlt
        : `${albums.find(a => a.id === id)?.title || id} — fotografska galerija`;
      let index = 0;
      const next = () => {
        if (index < candidates.length) { img.hidden = false; img.classList.add('cover-pending'); img.src = candidates[index++]; }
        else { img.hidden = true; img.removeAttribute('src'); }
      };
      img.addEventListener('error', next);
      img.addEventListener('load', () => { img.hidden = false; img.classList.remove('cover-pending'); });
      // Missing covers are optional; no broken-image icon is shown.
      img.hidden = !img.getAttribute('src');
      next();
    });
  }
  window.PH = { readSettings, publicBase, config, route, albums, galleryHref, pageHref, applySEO, configureCovers };
})();
