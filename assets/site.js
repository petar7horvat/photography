(function () {
  'use strict';

  /* =========================================================
     PETAR HORVAT PHOTOGRAPHY
     Site configuration + routing + SEO + structured data
     ========================================================= */

  const BASE_URL = 'https://petar7horvat.github.io/photography/';

  /* ---------------------------------------------------------
     ČITANJE META PODEŠAVANJA
     --------------------------------------------------------- */

  const read = (doc, name) =>
    doc.querySelector(`meta[name="${name}"]`)?.content.trim() || '';

  function readSettings(doc) {
    return {
      name: read(doc, 'site:name') || 'Petar Horvat',
      brand: read(doc, 'site:brand') || 'Petar Horvat Photography',

      title:
        read(doc, 'site:title') ||
        'Fotograf Beograd | Petar Horvat Photography',

      description:
        read(doc, 'description') ||
        'Petar Horvat Photography — fotograf iz Beograda. Fotografisanje portreta, automobila, životinja, pejzaža, hrane i enterijera, kao i fotografisanje i snimanje dronom.',

      url: read(doc, 'site:url'),

      email:
        read(doc, 'site:email') ||
        'petar7horvat@gmail.com',

      instagram:
        read(doc, 'site:instagram') ||
        'https://www.instagram.com/pera_horvat/',

      city:
        read(doc, 'site:city') ||
        'Beograd',

      country:
        read(doc, 'site:country') ||
        'Srbija',

      countryCode:
        read(doc, 'site:country-code') ||
        'RS',

      bio:
        read(doc, 'site:bio') ||
        'Strastveni ljubitelj fotografije.',

      hero:
        read(doc, 'site:hero') ||
        'index.jpg',

      contactImage:
        read(doc, 'site:contact-image') ||
        'kontakt.jpg',

      heroAlt:
        read(doc, 'site:hero-alt') ||
        'Mirno planinsko jezero u kom se ogledaju planine, drveće i oblaci.',

      contactAlt:
        read(doc, 'site:contact-alt') ||
        'Petar Horvat — fotograf iz Beograda.',

      socialImage:
        read(doc, 'site:social-image') ||
        'slike/cover/index.jpg',

      socialAlt:
        read(doc, 'site:social-alt') ||
        'Petar Horvat Photography — fotograf iz Beograda.',

      verification:
        read(doc, 'site:verification')
    };
  }

  const config = readSettings(document);

  /* ---------------------------------------------------------
     JAVNA OSNOVNA ADRESA
     --------------------------------------------------------- */

  function publicBase() {
    return BASE_URL;
  }

  /* ---------------------------------------------------------
     ROUTING
     --------------------------------------------------------- */

  const parameters = new URLSearchParams(location.search);

  const requestedAlbum =
    parameters.get('galerija') ||
    parameters.get('album');

  const route =
    requestedAlbum
      ? {
          type: 'gallery',
          id:
            requestedAlbum === 'priroda'
              ? 'pejzazi'
              : requestedAlbum
        }
      : parameters.get('stranica') === 'kontakt'
        ? { type: 'contact' }
        : parameters.has('stranica')
          ? { type: 'invalid' }
          : { type: 'home' };

  /* ---------------------------------------------------------
     GALERIJE
     --------------------------------------------------------- */

  const gallerySEO = {
    automobili: {
      title: 'Fotograf automobila Beograd | Petar Horvat Photography',
      description:
        'Fotografisanje automobila u Beogradu. Pogledajte portfolio Petra Horvata — fotografija automobila, vozila, detalja i automobilskih scena.',
      socialImage:
        'slike/automobili/7M3A9114-HDR.jpg',
      socialAlt:
        'Fotografija automobila — Petar Horvat Photography, Beograd'
    },

    portreti: {
      title: 'Portretni fotograf Beograd | Petar Horvat Photography',
      description:
        'Portretni fotograf iz Beograda. Pogledajte portfolio portreta Petra Horvata i fotografije ljudi u prirodnom, kreativnom i autentičnom stilu.',
      socialImage:
        'slike/portreti/IMG_8652-Enhanced-NR.jpg',
      socialAlt:
        'Portretna fotografija — Petar Horvat Photography, Beograd'
    },

    zivotinje: {
      title: 'Fotograf životinja Beograd | Petar Horvat Photography',
      description:
        'Fotografisanje životinja u Beogradu i okolini. Portfolio Petra Horvata sa fotografijama divljih i domaćih životinja i njihovih prirodnih trenutaka.',
      socialImage:
        'slike/zivotinje/IMG_7846-Enhanced-NR.jpg',
      socialAlt:
        'Fotografija životinje — Petar Horvat Photography, Beograd'
    },

    dron: {
      title: 'Dron fotografisanje i snimanje Beograd | Petar Horvat Photography',
      description:
        'Fotografisanje i snimanje dronom u Beogradu. Vazdušna fotografija i snimanje iz perspektive drona za različite vrste projekata.',
      socialImage:
        'slike/dron/DJI_20250319202009_0031_D.JPG',
      socialAlt:
        'Fotografija iz vazduha dronom — Petar Horvat Photography, Beograd'
    },

    pejzazi: {
      title: 'Fotograf pejzaža Beograd | Petar Horvat Photography',
      description:
        'Pejzažna fotografija Petra Horvata. Planine, jezera, priroda i pejzaži zabeleženi kroz fotografiju.',
      socialImage:
        'slike/pejzazi/IMG_3916.jpg',
      socialAlt:
        'Pejzažna fotografija — Petar Horvat Photography'
    },

    hrana: {
      title: 'Fotograf hrane Beograd | Petar Horvat Photography',
      description:
        'Fotografisanje hrane u Beogradu. Fotografija hrane za restorane, lokale, menije, promociju i društvene mreže.',
      socialImage:
        'slike/hrana/7M3A1657.jpg',
      socialAlt:
        'Fotografija hrane — Petar Horvat Photography, Beograd'
    },

    enterijeri: {
      title: 'Fotograf enterijera Beograd | Petar Horvat Photography',
      description:
        'Fotografisanje enterijera u Beogradu. Fotografija prostora, detalja i arhitekture za prezentaciju, promociju i poslovne projekte.',
      socialImage:
        'slike/enterijeri/7M3A1997.jpg',
      socialAlt:
        'Fotografija enterijera — Petar Horvat Photography, Beograd'
    }
  };

  /* ---------------------------------------------------------
     PODACI O FOTOGRAFIJAMA
     --------------------------------------------------------- */

  const albums = (window.GALERIJE || []).map(album => {
    const seo = gallerySEO[album.id] || {};

    return {
      ...album,

      shuffle: true,

      seoTitle:
        seo.title ||
        `${album.title} — ${config.name} | Fotografija, ${config.city}`,

      seoDescription:
        seo.description ||
        `${album.title} — fotografski portfolio Petra Horvata iz Beograda.`,

      socialImage:
        seo.socialImage ||
        `slike/cover/${album.id}.jpg`,

      socialAlt:
        seo.socialAlt ||
        `${album.title} — Petar Horvat Photography`,

      photos: (window.FOTOGRAFIJE?.[album.id] || [])
        .map(entry => {
          const photo =
            typeof entry === 'string'
              ? { file: entry }
              : { ...entry };

          if (
            typeof photo.file !== 'string' ||
            /[\\/]/.test(photo.file) ||
            !/\.(jpe?g|png)$/i.test(photo.file)
          ) {
            return null;
          }

          const src = new URL(
            `slike/${album.id}/${encodeURIComponent(photo.file)}`,
            document.baseURI
          ).href;

          const measured =
            Number(photo.width) > 0 &&
            Number(photo.height) > 0;

          return {
            ...photo,

            src,
            thumb: src,

            title:
              photo.title ||
              photo.alt ||
              album.title,

            alt:
              photo.alt ||
              `${album.title} — Petar Horvat Photography`,

            width:
              measured
                ? Number(photo.width)
                : 1600,

            height:
              measured
                ? Number(photo.height)
                : 1200,

            measured
          };
        })
        .filter(Boolean)
    };
  });

  /* ---------------------------------------------------------
     URL POMOĆNE FUNKCIJE
     --------------------------------------------------------- */

  const galleryHref = id =>
    `index.html?galerija=${encodeURIComponent(id)}`;

  function pageHref(page) {
    if (page.type === 'contact') {
      return 'index.html?stranica=kontakt';
    }

    if (page.type === 'gallery') {
      return galleryHref(page.id);
    }

    return 'index.html';
  }

  function absoluteURL(path) {
    try {
      return new URL(path, BASE_URL).href;
    } catch {
      return '';
    }
  }

  /* ---------------------------------------------------------
     META TAGOVI
     --------------------------------------------------------- */

  function meta(name, value, property = false) {
    if (!value) return;

    const attribute = property
      ? 'property'
      : 'name';

    let element =
      document.head.querySelector(
        `meta[${attribute}="${name}"]`
      );

    if (!element) {
      element = document.createElement('meta');

      element.setAttribute(
        attribute,
        name
      );

      document.head.append(element);
    }

    element.setAttribute(
      'content',
      value
    );
  }

  function removeMeta(name, property = false) {
    const attribute = property
      ? 'property'
      : 'name';

    document.head
      .querySelectorAll(
        `meta[${attribute}="${name}"]`
      )
      .forEach(element => element.remove());
  }

  /* ---------------------------------------------------------
     CANONICAL
     --------------------------------------------------------- */

  function setCanonical(url) {
    let link =
      document.head.querySelector(
        'link[rel="canonical"]'
      );

    if (!link) {
      link = document.createElement('link');

      link.rel = 'canonical';

      document.head.append(link);
    }

    link.href = url;
  }

  /* ---------------------------------------------------------
     STRUCTURED DATA
     --------------------------------------------------------- */

  function buildStructuredData(page, album, canonical) {
    const base = publicBase();

    const personId =
      `${base}#person`;

    const websiteId =
      `${base}#website`;

    const person = {
      '@type': 'Person',
      '@id': personId,

      name: config.name,

      url: base,

      image:
        absoluteURL(
          'slike/cover/kontakt.jpg'
        ),

      jobTitle: 'Fotograf',

      description:
        'Petar Horvat je fotograf iz Beograda koji se bavi fotografisanjem portreta, automobila, životinja, pejzaža, hrane i enterijera, kao i fotografisanjem i snimanjem dronom.',

      email:
        `mailto:${config.email}`,

      address: {
        '@type': 'PostalAddress',
        addressLocality: config.city,
        addressCountry: config.countryCode
      },

      sameAs: [
        config.instagram
      ]
    };

    const professionalService = {
      '@type': 'ProfessionalService',

      '@id':
        `${base}#professional-service`,

      name:
        config.brand,

      url:
        base,

      image:
        absoluteURL(
          config.socialImage
        ),

      description:
        'Fotografisanje u Beogradu — portreti, automobili, životinje, pejzaži, hrana, enterijeri i fotografisanje i snimanje dronom.',

      provider: {
        '@id': personId
      },

      areaServed: {
        '@type': 'City',
        name: config.city
      },

      address: {
        '@type': 'PostalAddress',
        addressLocality: config.city,
        addressCountry: config.countryCode
      },

      email:
        `mailto:${config.email}`,

      sameAs: [
        config.instagram
      ]
    };

    const website = {
      '@type': 'WebSite',

      '@id':
        websiteId,

      url:
        base,

      name:
        config.brand,

      description:
        config.description,

      inLanguage:
        'sr-Latn',

      publisher: {
        '@id': personId
      }
    };

    const graph = [
      person,
      professionalService,
      website
    ];

    /* -------------------------------------------------------
       WEB PAGE
       ------------------------------------------------------- */

    const webPage = {
      '@type':
        page.type === 'contact'
          ? 'ContactPage'
          : album
            ? 'CollectionPage'
            : 'WebPage',

      '@id':
        `${canonical}#page`,

      url:
        canonical,

      name:
        document.title,

      description:
        document
          .querySelector(
            'meta[name="description"]'
          )
          ?.content || '',

      inLanguage:
        'sr-Latn',

      isPartOf: {
        '@id': websiteId
      },

      about: {
        '@id': personId
      }
    };

    /* -------------------------------------------------------
       GLAVNA SLIKA STRANICE
       ------------------------------------------------------- */

    if (album) {
      webPage.primaryImageOfPage = {
        '@type': 'ImageObject',

        url:
          absoluteURL(
            album.socialImage
          ),

        contentUrl:
          absoluteURL(
            album.socialImage
          ),

        caption:
          album.socialAlt,

        creator: {
          '@id': personId
        }
      };
    } else {
      webPage.primaryImageOfPage = {
        '@type': 'ImageObject',

        url:
          absoluteURL(
            config.socialImage
          ),

        contentUrl:
          absoluteURL(
            config.socialImage
          ),

        caption:
          config.socialAlt,

        creator: {
          '@id': personId
        }
      };
    }

    graph.push(webPage);

    /* -------------------------------------------------------
       BREADCRUMBS
       ------------------------------------------------------- */

    if (album) {
      graph.push({
        '@type':
          'BreadcrumbList',

        '@id':
          `${canonical}#breadcrumb`,

        itemListElement: [
          {
            '@type':
              'ListItem',

            position: 1,

            name:
              'Početna',

            item:
              base
          },

          {
            '@type':
              'ListItem',

            position: 2,

            name:
              'Galerija',

            item:
              base
          },

          {
            '@type':
              'ListItem',

            position: 3,

            name:
              album.title,

            item:
              canonical
          }
        ]
      });

      /* -----------------------------------------------------
         IMAGE OBJECTS
         ----------------------------------------------------- */

      if (album.photos.length) {
        webPage.mainEntity = {
          '@type':
            'ItemList',

          name:
            `${album.title} — Petar Horvat Photography`,

          numberOfItems:
            album.photos.length,

          itemListElement:
            album.photos.map(
              (photo, index) => ({
                '@type':
                  'ListItem',

                position:
                  index + 1,

                item: {
                  '@type':
                    'ImageObject',

                  contentUrl:
                    photo.src,

                  url:
                    photo.src,

                  name:
                    photo.title,

                  caption:
                    photo.alt,

                  creator: {
                    '@id': personId
                  },

                  ...(photo.measured
                    ? {
                        width:
                          photo.width,

                        height:
                          photo.height
                      }
                    : {})
                }
              })
            )
        };
      }
    }

    return {
      '@context':
        'https://schema.org',

      '@graph':
        graph
    };
  }

  /* ---------------------------------------------------------
     PRIMENA SEO PODATAKA
     --------------------------------------------------------- */

  function applySEO(page = route) {
    const album =
      albums.find(
        a => a.id === page.id
      );

    const invalid =
      page.type === 'invalid' ||
      (
        page.type === 'gallery' &&
        !album
      );

    /* -------------------------------------------------------
       TITLE
       ------------------------------------------------------- */

    let title;

    if (invalid) {
      title =
        `Stranica nije pronađena | ${config.brand}`;
    } else if (page.type === 'contact') {
      title =
        `Kontakt | ${config.brand}`;
    } else if (album) {
      title =
        album.seoTitle;
    } else {
      title =
        'Fotograf Beograd | Petar Horvat Photography';
    }

    /* -------------------------------------------------------
       DESCRIPTION
       ------------------------------------------------------- */

    let description;

    if (invalid) {
      description =
        'Tražena stranica nije pronađena.';
    } else if (page.type === 'contact') {
      description =
        `Kontaktirajte Petra Horvata, fotografa iz Beograda, za portrete, automobile, životinje, pejzaže, hranu, enterijere i fotografisanje i snimanje dronom.`;
    } else if (album) {
      description =
        album.seoDescription;
    } else {
      description =
        config.description;
    }

    document.title =
      title;

    /* -------------------------------------------------------
       STANDARD META
       ------------------------------------------------------- */

    meta(
      'description',
      description
    );

    meta(
      'author',
      config.name
    );

    meta(
      'robots',
      invalid
        ? 'noindex,follow'
        : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
    );

    /* -------------------------------------------------------
       OPEN GRAPH
       ------------------------------------------------------- */

    meta(
      'og:title',
      title,
      true
    );

    meta(
      'og:description',
      description,
      true
    );

    meta(
      'og:site_name',
      config.brand,
      true
    );

    meta(
      'og:type',
      'website',
      true
    );

    meta(
      'og:locale',
      'sr_RS',
      true
    );

    /* -------------------------------------------------------
       TWITTER / X
       ------------------------------------------------------- */

    meta(
      'twitter:card',
      'summary_large_image'
    );

    meta(
      'twitter:title',
      title
    );

    meta(
      'twitter:description',
      description
    );

    /* -------------------------------------------------------
       GOOGLE VERIFICATION
       ------------------------------------------------------- */

    if (config.verification) {
      meta(
        'google-site-verification',
        config.verification
      );
    } else {
      removeMeta(
        'google-site-verification'
      );
    }

    /* -------------------------------------------------------
       INVALID STRANICA
       ------------------------------------------------------- */

    if (invalid) {
      removeMeta(
        'og:url',
        true
      );

      removeMeta(
        'og:image',
        true
      );

      removeMeta(
        'og:image:alt',
        true
      );

      removeMeta(
        'twitter:image'
      );

      removeMeta(
        'twitter:image:alt'
      );

      return;
    }

    /* -------------------------------------------------------
       CANONICAL URL
       ------------------------------------------------------- */

    const canonical =
      page.type === 'home'
        ? BASE_URL
        : new URL(
            pageHref(page),
            BASE_URL
          ).href;

    setCanonical(
      canonical
    );

    /* -------------------------------------------------------
       SOCIAL IMAGE
       ------------------------------------------------------- */

    let socialImage =
      config.socialImage;

    let socialAlt =
      config.socialAlt;

    if (album) {
      socialImage =
        album.socialImage;

      socialAlt =
        album.socialAlt;
    }

    if (page.type === 'contact') {
      socialImage =
        'slike/cover/kontakt.jpg';

      socialAlt =
        'Petar Horvat — fotograf iz Beograda';
    }

    const absoluteSocialImage =
      absoluteURL(
        socialImage
      );

    /* -------------------------------------------------------
       OPEN GRAPH URL
       ------------------------------------------------------- */

    meta(
      'og:url',
      canonical,
      true
    );

    meta(
      'og:image',
      absoluteSocialImage,
      true
    );

    meta(
      'og:image:alt',
      socialAlt,
      true
    );

    meta(
      'og:image:type',
      /\.(png)$/i.test(
        socialImage
      )
        ? 'image/png'
        : 'image/jpeg',
      true
    );

    /*
     * Open Graph zahteva apsolutne URL-ove.
     * Dimenzije nisu kritične, ali ih navodimo kada znamo
     * da je slika standardna fotografija.
     */

    meta(
      'og:image:width',
      '1600',
      true
    );

    meta(
      'og:image:height',
      '1200',
      true
    );

    /* -------------------------------------------------------
       TWITTER IMAGE
       ------------------------------------------------------- */

    meta(
      'twitter:image',
      absoluteSocialImage
    );

    meta(
      'twitter:image:alt',
      socialAlt
    );

    /* -------------------------------------------------------
       STRUCTURED DATA
       ------------------------------------------------------- */

    const schema =
      buildStructuredData(
        page,
        album,
        canonical
      );

    let schemaElement =
      document.getElementById(
        'structured-data'
      );

    if (!schemaElement) {
      schemaElement =
        document.createElement(
          'script'
        );

      schemaElement.type =
        'application/ld+json';

      schemaElement.id =
        'structured-data';

      document.head.append(
        schemaElement
      );
    }

    schemaElement.textContent =
      JSON.stringify(
        schema,
        null,
        2
      );
  }

  /* ---------------------------------------------------------
     COVER SLIKE
     --------------------------------------------------------- */

  function configureCovers(
    root = document
  ) {
    root
      .querySelectorAll(
        'img[data-cover]'
      )
      .forEach(img => {
        const id =
          img.dataset.cover;

        let name =
          id === 'index'
            ? config.hero
            : id === 'kontakt'
              ? config.contactImage
              : `${id}.jpg`;

        name =
          window.FOTOGRAFIJE?._covers?.[
            name
              .replace(/\.[^.]+$/, '')
              .toLowerCase()
          ] || name;

        const stem =
          name.replace(
            /\.[^.]+$/,
            ''
          );

        const candidates = [
          ...new Set([
            name,

            ...[
              'jpg',
              'png',
              'jpeg',
              'JPG',
              'PNG',
              'JPEG'
            ].map(
              ext =>
                `${stem}.${ext}`
            ),

            ...(id === 'zivotinje'
              ? [
                  'zivotinja.jpg',
                  'zivotinja.png',
                  'zivotinja.jpeg'
                ]
              : [])
          ])
        ].map(file => new URL(
  `${id === 'kontakt' ? 'slike/cover' : 'slike/cover/thumbs'}/${encodeURIComponent(file)}`,
  document.baseURI
).href);

        const fallback =
          albums.find(
            a => a.id === id
          )?.photos[0]?.src;

        if (fallback) {
          candidates.push(
            fallback
          );
        }

        /* ---------------------------------------------------
           ALT TEKST
           --------------------------------------------------- */

        if (id === 'index') {
          img.alt =
            config.heroAlt;
        } else if (id === 'kontakt') {
          img.alt =
            config.contactAlt;
        } else {
          const album =
            albums.find(
              a => a.id === id
            );

          img.alt =
            album?.socialAlt ||
            `${album?.title || id} — fotografska galerija`;
        }

        let index = 0;

        const next = () => {
          if (
            index <
            candidates.length
          ) {
            img.hidden =
              false;

            img.classList.add(
              'cover-pending'
            );

            img.src =
              candidates[index++];

          } else {
            img.hidden =
              true;

            img.removeAttribute(
              'src'
            );
          }
        };

        img.addEventListener(
          'error',
          next
        );

        img.addEventListener(
          'load',
          () => {
            img.hidden =
              false;

            img.classList.remove(
              'cover-pending'
            );
          }
        );

        img.hidden =
          !img.getAttribute(
            'src'
          );

        next();
      });
  }

  /* ---------------------------------------------------------
     SPA / HISTORY SEO OSVEŽAVANJE
     --------------------------------------------------------- */

  function refreshSEOFromURL() {
    const params =
      new URLSearchParams(
        location.search
      );

    const album =
      params.get('galerija') ||
      params.get('album');

    let currentRoute;

    if (album) {
      currentRoute = {
        type: 'gallery',
        id:
          album === 'priroda'
            ? 'pejzazi'
            : album
      };
    } else if (
      params.get('stranica') ===
      'kontakt'
    ) {
      currentRoute = {
        type: 'contact'
      };
    } else if (
      params.has('stranica')
    ) {
      currentRoute = {
        type: 'invalid'
      };
    } else {
      currentRoute = {
        type: 'home'
      };
    }

    applySEO(
      currentRoute
    );
  }

  const originalPushState =
    history.pushState;

  history.pushState =
    function () {
      originalPushState.apply(
        history,
        arguments
      );

      refreshSEOFromURL();
    };

  const originalReplaceState =
    history.replaceState;

  history.replaceState =
    function () {
      originalReplaceState.apply(
        history,
        arguments
      );

      refreshSEOFromURL();
    };

  window.addEventListener(
    'popstate',
    refreshSEOFromURL
  );

  /* ---------------------------------------------------------
     JAVNO DOSTUPAN OBJEKAT
     --------------------------------------------------------- */

  window.PH = {
    readSettings,
    publicBase,
    config,
    route,
    albums,
    galleryHref,
    pageHref,
    applySEO,
    configureCovers,
    refreshSEOFromURL
  };

  /* ---------------------------------------------------------
     INIT
     --------------------------------------------------------- */

  applySEO(
    route
  );

  configureCovers();

})();
