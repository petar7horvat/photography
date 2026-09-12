# Petar Horvat Photography — lokalna / GitHub verzija

Raspakuj ceo ZIP i dvoklikom otvori **index.html** u Chrome-u, Brave-u, Edge-u ili Firefox-u. Ostavi `assets/` i `slike/` pored njega. Nisu potrebni Python, Node.js, instalacija, internet niti lokalni server. CSS, JavaScript, PhotoSwipe i fotografije nalaze se u paketu.

## Galerije i fotografije

Redosled: **Automobili → Portreti → Životinje → Dron → Pejzaži → Hrana → Enterijeri**.

| Galerija | Fotografije | Naslovnica |
|---|---|---|
| Automobili | `slike/automobili/` | `slike/cover/automobili.jpg` |
| Portreti | `slike/portreti/` | `slike/cover/portreti.jpg` |
| Životinje | `slike/zivotinje/` | `slike/cover/zivotinje.jpg` |
| Dron | `slike/dron/` | `slike/cover/dron.jpg` |
| Pejzaži | `slike/pejzazi/` | `slike/cover/pejzazi.jpg` |
| Hrana | `slike/hrana/` | `slike/cover/hrana.jpg` |
| Enterijeri | `slike/enterijeri/` | `slike/cover/enterijeri.jpg` |

Sve galerije imaju shuffle. Novi ulazak pravi nasumičan raspored; osvežavanje iste stranice i Back/Forward čuvaju raspored. Link otvorene fotografije pamti naziv fajla, pa je ista fotografija prepoznatljiva i uz drugačiji shuffle.

Fotografije **ne moraš da preimenuješ**. Podržani su JPG, JPEG i PNG, uključujući velika slova u ekstenziji i razmake u nazivu. Na GitHub-u je bitno da slova u spisku tačno odgovaraju fajlu. Enterijeri i Hrana čekaju tvoje fotografije.

### Dodavanje slika bez kucanja spiska

1. Ubaci svoje fotografije u odgovarajuće foldere iz tabele. Ukloni demo fotografije koje zamenjuješ.
2. Dvoklikom otvori **priprema.html**, pa izaberi **ceo folder slike**.
3. Klikni **PREUZMI FOTOGRAFIJE.JS**. Preuzeti fajl prebaci u `assets/` i zameni postojeći `fotografije.js`.
4. Ponovo otvori ili osveži `index.html`.

Alat čita nazive i dimenzije; ne šalje fotografije na internet i ne menja originalne fajlove. Uvek pravi nov kompletan spisak na osnovu izabranog foldera. Posle dodavanja, brisanja ili preimenovanja fotografija ponovi ta četiri koraka. Za sopstvene fotografije možeš dopuniti `alt` opise u generisanom fajlu.

**Samo kopiranje novih slika u folder nije dovoljno:** statički browser ne može sam da izlista sve fajlove sa proizvoljnim imenima. Zato se koristi lokalni spisak `assets/fotografije.js` koji ovaj alat pravi.

### Ručno, ako ti je lakše

Možeš u `assets/fotografije.js` umesto objekata koristiti i obična imena:

```js
window.FOTOGRAFIJE = {
  automobili: ["IMG_2048.JPG", "Porsche u gradu.png"],
  portreti: ["DSC_1001.jpg"],
  zivotinje: [],
  dron: [],
  pejzazi: [],
  hrana: [],
  enterijeri: []
};
```

Browser tada sam očitava proporcije tokom učitavanja. Alat `priprema.html` upisuje dimenzije unapred, što smanjuje pomeranje rasporeda dok se slike učitavaju. U galerijama su sačuvani masonry raspored, prevlačenje levo/desno, zatvaranje povlačenjem, zumiranje i Back/Forward.

## Početna i kontakt fotografija

- **Početna:** `slike/cover/index.jpg`
- **Kontakt:** `slike/cover/kontakt.jpg`

Zameni ta dva fajla svojim slikama. Imena i njihove alt opise možeš promeniti na vrhu `index.html`, u poljima `site:hero`, `site:contact-image`, `site:hero-alt` i `site:contact-alt`.

Naslovnice galerija mogu biti i `.png` ili `.jpeg`. Sajt pokušava i te ekstenzije; alat dodatno upisuje tačne nazive. Za Životinje radi i `zivotinja.jpg` / `zivotinja.png`. Ako postoji više naslovnica istog imena sa različitim ekstenzijama, ostavi samo onu koju želiš da koristiš. Naslovnice ne ulaze u albume. Bez naslovnice kategorija koristi prvu sliku iz albuma, a prazna kategorija ostaje bez fotografije dok je ne dodaš.

## Boje i osnovni podaci

**Boje:** `assets/theme.css`. U VS Code-u klikni kvadratić pored HEX vrednosti. `--accent` je glavni akcenat, `--accent-hover` stanje na prelazak mišem, a `--on-accent` tekst na akcentnoj pozadini.

**Lični i SEO podaci:** blok **TVOJA PODEŠAVANJA** na početku `index.html`. Menjaj vrednosti `content="..."`:

- `site:name`, `site:brand`, `site:title` i `description`;
- `site:email`, `site:instagram`, `site:city`, `site:country`, `site:bio`;
- `site:url` — puna javna adresa sa završnom `/`;
- `site:social-image`, `site:social-alt` — slika i opis za deljenje;
- `site:verification` — Google Search Console kod, ako ga dobiješ.

Isti podaci ažuriraju prikaz imena, kontakta, metapodatke i strukturirane podatke. Ne moraš da menjaš JavaScript. Ako u vrednosti koristiš navodnik, napiši `&quot;`.

Oprema se menja u kontakt šablonu pri dnu istog `index.html`. Kontakt se otvara preko `index.html?stranica=kontakt`, a galerije preko `index.html?galerija=automobili` i ostalih naziva.

## SEO i objavljivanje

Uključeni su opisni naslovi, meta opisi, robots oznaka, Open Graph / X podaci za deljenje, kanonske adrese bez oznake otvorene fotografije, alt opisi, pravi linkovi ka galerijama i JSON-LD (`Person`, `WebSite`, stranica, galerija, putanja navigacije i fotografije). Tekst koristi Beograd, fotografiju i fotografisanje prirodno, bez gomilanja skrivenih ključnih reči.

Google može da obradi naslove, opise i kanonske adrese koje postavlja JavaScript; nisu svi servisi za deljenje sposobni da izvrše JavaScript. Zato alat ispod upisuje javnu adresu i podatke za deljenje direktno u HTML. Na linkovima kategorija servisi koji ne izvršavaju JavaScript mogu prikazati zajedničku karticu portfolija. [Google: JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)

### Kada znaš javnu adresu

1. Podesi tekstove na vrhu `index.html` i sačuvaj fajl.
2. Otvori `priprema.html`. Ako si menjao slike, prvo izaberi njihov folder.
3. U delu **Priprema za objavljivanje** izaberi taj `index.html` i upiši adresu, npr. `https://TVOJE-IME.github.io/fotografija/`.
4. Preuzmi SEO ZIP. Raspakuj ga u glavni folder sajta i zameni `index.html`, `sitemap.xml` i `robots.txt`.
5. Postavi ažurirani sadržaj sajta na GitHub Pages.

Sitemap sadrži početnu, kontakt, svih sedam galerija i adrese fotografija. Nema izmišljene javne adrese u isporučenom sajtu; sitemap nastaje kada uneseš stvarnu adresu. Bez njenog unosa stranica na internetu sama određuje adresu za dinamičke metapodatke. Lokalni `file://` pregled ne objavljuje i ne indeksira sajt.

SEO kod ne prijavljuje automatski nalog na Search Console i ne garantuje poziciju u pretrazi. Posle objave možeš verifikovati domen ili URL prefix, upisati dobijeni kod u `site:verification`, ponoviti SEO pripremu i poslati adresu `sitemap.xml` kroz Search Console. Na GitHub projektnom sajtu `/ime-repozitorijuma/robots.txt` nije robots fajl za ceo domen; sitemap možeš poslati direktno kroz Search Console.

Google ne koristi `meta keywords` za rangiranje; zato ta oznaka nije dodata. [Google: podržane meta oznake](https://developers.google.com/search/docs/crawling-indexing/special-tags)

## GitHub Pages

U repozitorijum postavi **sadržaj raspakovanog foldera**, tako da `index.html`, `assets/`, `slike/` i `.nojekyll` budu u korenu. U **Settings → Pages → Build and deployment** izaberi objavljivanje sa grane, zatim svoju granu i **/(root)**. Sajt koristi relativne putanje i radi i kada je objavljen u podfolderu repozitorijuma. Nisu potrebni GitHub Actions niti komanda za build. [GitHub Pages dokumentacija](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

Postavi ceo sajt, ne samo index.html. GitHub nalog, repozitorijum i javni sajt nisu kreirani ovim paketom; sadržaj je pripremljen da ga postaviš na svoj nalog.

## Fotografije i provera

Priložene demo fotografije ostaju primeri; zameni ih svojim radovima pre predstavljanja portfolija kao sopstvene galerije. Autori su navedeni u `IZVORI-FOTOGRAFIJA.md` i na `izvori/index.html`. Naslovnice koriste iste već priložene fotografije.

Nema spoljnih CDN zavisnosti, server poziva niti učitavanja ES modula. Lokalni klasični skriptovi izbegavaju ograničenje modula pri otvaranju `file://` stranice. [MDN: JavaScript moduli](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

Provere obuhvataju JavaScript sintaksu, lokalne resurse, SEO podatke, redosled galerija, shuffle i istoriju pregleda. Prikaz u pravom browseru/telefonu nije testiran u ovom okruženju.
