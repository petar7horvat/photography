(function(){
// A new album visit gets a random order. Reload and Back restore that same order.
function orderAlbumPhotos(album, browser = window, random = Math.random) {
  const photos = [...album.photos];
  if (!album.shuffle || photos.length < 2) return photos;
  const signature = JSON.stringify(photos.map(photo => [photo.file, photo.src]));
  const saved = browser.history.state?.phPhotoOrder;
  const byFile = new Map(photos.map(photo => [photo.file, photo]));
  if (saved?.album === album.id && saved.signature === signature && Array.isArray(saved.files)
      && saved.files.length === photos.length && new Set(saved.files).size === photos.length
      && saved.files.every(file => byFile.has(file))) {
    return saved.files.map(file => byFile.get(file));
  }
  for (let i = photos.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [photos[i], photos[j]] = [photos[j], photos[i]];
  }
  try {
    browser.history.replaceState({
      ...browser.history.state,
      phPhotoOrder: { album: album.id, signature, files: photos.map(photo => photo.file) },
    }, '');
  } catch {
    // Preserve stable viewer indexes if history persistence is unavailable.
    return [...album.photos];
  }
  return photos;
}

window.PH.orderAlbumPhotos=orderAlbumPhotos;
})();
