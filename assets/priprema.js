(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const ids = window.GALERIJE.map(album => album.id);
  let manifest = window.FOTOGRAFIJE;
  let photosText = '';
  let selection = 0;
  const encode = text => new TextEncoder().encode(text);
  function download(name, data, type = 'text/plain;charset=utf-8') {
    const blob = new Blob([data], {type});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = name;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  function dimensions(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file); const image = new Image();
      image.onload = () => { URL.revokeObjectURL(url); resolve({width:image.naturalWidth,height:image.naturalHeight}); };
      image.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Ne mogu da pročitam ${file.name}`)); };
      image.src = url;
    });
  }
  async function makeManifest(files, report = () => {}) {
    const result = Object.fromEntries(ids.map(id => [id, []])); result._covers = {};
    const pending = [];
    for (const file of files) {
      const parts = file.webkitRelativePath.split('/');
      const folder = parts.at(-2)?.toLowerCase();
      if (!/\.(jpe?g|png)$/i.test(file.name)) continue;
      if (folder === 'cover') {
        const key = file.name.replace(/\.[^.]+$/, '').toLowerCase();
        result._covers[key === 'zivotinja' ? 'zivotinje' : key] = file.name;
      } else if (ids.includes(folder)) pending.push({file,folder});
    }
    if (!pending.length && !Object.keys(result._covers).length) throw new Error('Izaberi folder slike koji sadrži podfoldere galerija i cover.');
    // Limit simultaneous image decoding so large camera files do not exhaust memory.
    let cursor = 0; let done = 0;
    async function worker() {
      while (cursor < pending.length) {
        const {file,folder} = pending[cursor++];
        const size = await dimensions(file);
        result[folder].push({file:file.name,...size,alt:`Fotografija iz galerije ${window.GALERIJE.find(a => a.id === folder).title}`});
        report(++done, pending.length);
      }
    }
    await Promise.all([worker(),worker()]);
    for (const id of ids) result[id].sort((a,b) => a.file.localeCompare(b.file,'sr',{numeric:true}));
    return result;
  }
  $('#photo-folder').addEventListener('change', async event => {
    const ticket = ++selection; $('#download-photos').disabled = true;
    const output = $('#photo-result'); output.className = ''; output.textContent = 'Čitanje fotografija…';
    try {
      const next = await makeManifest([...event.target.files], (done,total) => {
        if (ticket === selection) output.textContent = `Pročitano ${done} / ${total} fotografija.`;
      });
      if (ticket !== selection) return;
      manifest = next;
      photosText = '// Automatski napravljen spisak. Naslovi i alt opisi mogu se menjati ručno.\nwindow.FOTOGRAFIJE = ' + JSON.stringify(manifest,null,2) + ';\n';
      output.textContent = window.GALERIJE.map(a => `${a.title}: ${manifest[a.id].length}`).join('\n') + '\n\nPreuzmi fajl i zameni assets/fotografije.js. Slike ostaju u svojim folderima.';
      $('#download-photos').disabled = false;
    } catch (error) { if (ticket === selection) {output.className = 'error'; output.textContent = error.message;} }
  });
  $('#download-photos').addEventListener('click', () => download('fotografije.js', photosText, 'text/javascript;charset=utf-8'));

  // Small, dependency-free ZIP writer (stored entries; no server or install).
  function zipFiles(files) {
    const local = [], central = []; let offset = 0;
    const crc = bytes => {
      let value = 0xffffffff;
      for (const byte of bytes) { value ^= byte; for (let i=0;i<8;i++) value=(value>>>1)^((value&1)?0xedb88320:0); }
      return (value ^ 0xffffffff) >>> 0;
    };
    for (const [name,text] of Object.entries(files)) {
      const filename=encode(name), data=encode(text), checksum=crc(data);
      const header=new Uint8Array(30+filename.length), h=new DataView(header.buffer);
      h.setUint32(0,0x04034b50,true); h.setUint16(4,20,true); h.setUint16(6,0x800,true);
      h.setUint16(12,33,true); h.setUint32(14,checksum,true); h.setUint32(18,data.length,true); h.setUint32(22,data.length,true); h.setUint16(26,filename.length,true); header.set(filename,30);
      const record=new Uint8Array(46+filename.length), c=new DataView(record.buffer);
      c.setUint32(0,0x02014b50,true); c.setUint16(4,20,true); c.setUint16(6,20,true); c.setUint16(8,0x800,true); c.setUint16(14,33,true);
      c.setUint32(16,checksum,true); c.setUint32(20,data.length,true); c.setUint32(24,data.length,true); c.setUint16(28,filename.length,true); c.setUint32(42,offset,true); record.set(filename,46);
      local.push(header,data); central.push(record); offset+=header.length+data.length;
    }
    const size=central.reduce((sum,part)=>sum+part.length,0); const end=new Uint8Array(22), e=new DataView(end.buffer);
    e.setUint32(0,0x06054b50,true); e.setUint16(8,central.length,true); e.setUint16(10,central.length,true); e.setUint32(12,size,true); e.setUint32(16,offset,true);
    return new Blob([...local,...central,end],{type:'application/zip'});
  }
  const xml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  function makeSeoFiles(indexText, siteURL, photos) {
    const doc = new DOMParser().parseFromString(indexText,'text/html');
    if (!doc.querySelector('meta[name="site:name"]')) throw new Error('Izaberi index.html iz ove verzije sajta.');
    const config = window.PH.readSettings(doc);
    const base = window.PH.publicBase({...config,url:siteURL},'file:///index.html');
    if (!base) throw new Error('Upiši punu javnu https:// adresu sajta.');
    const set = (name,value,property=false) => {
      const attribute = property ? 'property' : 'name';
      let element = doc.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {element=doc.createElement('meta');element.setAttribute(attribute,name);doc.head.append(element);}
      element.content=value;
    };
    set('site:url',base); doc.title=config.title; set('author',config.name);
    const social = new URL(config.socialImage || `slike/cover/${config.hero}`,base).href;
    set('site:social-image',social); set('og:image',social,true); set('og:url',new URL('index.html',base).href,true);
    set('twitter:title',config.title);set('twitter:description',config.description);set('twitter:image',social);set('twitter:image:alt',config.socialAlt);
    if (config.verification) set('google-site-verification',config.verification);
    // Canonical is set per query route at runtime; never bake a home canonical into every album.
    doc.querySelectorAll('link[rel="canonical"]').forEach(element=>element.remove());
    let schema=doc.querySelector('#structured-data');
    if (!schema) {schema=doc.createElement('script');schema.id='structured-data';schema.type='application/ld+json';doc.head.append(schema);}
    schema.textContent=JSON.stringify({'@context':'https://schema.org','@graph':[
      {'@type':'Person','@id':base+'#person',name:config.name,url:base,description:config.bio,email:config.email,
        homeLocation:{'@type':'Place',name:config.city+', '+config.country},sameAs:config.instagram?[config.instagram]:[]},
      {'@type':'WebSite','@id':base+'#website',url:base,name:config.brand,inLanguage:'sr-Latn',publisher:{'@id':base+'#person'}},
    ]}).replace(/</g,'\\u003c');
    const routes=[{path:'index.html',images:[`slike/cover/${config.hero}`]},{path:'index.html?stranica=kontakt',images:[`slike/cover/${config.contactImage}`]},
      ...window.GALERIJE.map(album=>({path:`index.html?galerija=${album.id}`,images:(photos[album.id]||[]).map(p=>`slike/${album.id}/${encodeURIComponent(typeof p==='string'?p:p.file)}`)}))];
    const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'+routes.map(route=>
      '  <url><loc>'+xml(new URL(route.path,base).href)+'</loc>'+route.images.slice(0,1000).map(image=>'<image:image><image:loc>'+xml(new URL(image,base).href)+'</image:loc></image:image>').join('')+'</url>').join('\n')+'\n</urlset>\n';
    return {'index.html':'<!doctype html>\n'+doc.documentElement.outerHTML+'\n','sitemap.xml':sitemap,'robots.txt':`User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap.xml',base).href}\n`};
  }
  $('#download-seo').addEventListener('click', async () => {
    const output=$('#seo-result');output.className='';
    try {
      const file=$('#index-file').files[0]; if(!file)throw new Error('Prvo izaberi svoj index.html.');
      const files=makeSeoFiles(await file.text(),$('#site-url').value.trim(),manifest);
      download('seo-za-sajt.zip',zipFiles(files),'application/zip');
      output.textContent='Raspakuj ZIP u glavni folder sajta i zameni ta tri fajla. Zatim postavi ceo sajt na GitHub Pages.';
    } catch(error){output.className='error';output.textContent=error.message;}
  });
  window.PHPreparation={makeManifest,makeSeoFiles,zipFiles};
})();
