(function(){
// Source order stays unchanged; each next photograph fills the shortest column.
function packPhotos(ratios, width, columns, gap) {
  const columnWidth = (width - gap * (columns - 1)) / columns;
  const bottoms = Array(columns).fill(0);
  const positions = ratios.map(ratio => {
    const column = bottoms.indexOf(Math.min(...bottoms));
    const height = columnWidth * ratio;
    const position = { left: column * (columnWidth + gap), top: bottoms[column], width: columnWidth, height };
    bottoms[column] += height + gap;
    return position;
  });
  return { positions, height: ratios.length ? Math.max(...bottoms) - gap : 0 };
}

function setupMasonry(grid) {
  if (!grid.children.length || grid.classList.contains('is-masonry')) return;
  const items = [...grid.children];
  let previous = '';
  const layout = () => {
    const style = getComputedStyle(grid);
    const width = grid.getBoundingClientRect().width;
    if (!width) return;
    const columns = Number(style.getPropertyValue('--gallery-columns')) || 1;
    const gap = parseFloat(style.getPropertyValue('--gallery-gap')) || 0;
    const ratios = items.map(item => { const img = item.querySelector('img'); return (Number(img.getAttribute('height')) || 1200) / (Number(img.getAttribute('width')) || 1600); });
    const stamp = `${width}:${columns}:${gap}:${ratios.join(',')}`;
    if (stamp === previous) return;
    previous = stamp;
    const result = packPhotos(ratios, width, columns, gap);
    grid.classList.add('is-masonry');
    result.positions.forEach((position, i) => {
      Object.assign(items[i].style, {
        width: `${position.width}px`, height: `${position.height}px`,
        left: `${position.left}px`, top: `${position.top}px`,
      });
    });
    grid.style.height = `${result.height + parseFloat(style.paddingBottom)}px`;
  };
  items.forEach(item => {
    const img = item.querySelector('img');
    img.addEventListener('load', () => {
      if (img.naturalWidth) { img.width = img.naturalWidth; img.height = img.naturalHeight; }
      layout();
    });
  });
  layout();
  if ('ResizeObserver' in window) new ResizeObserver(layout).observe(grid);
  else window.addEventListener('resize', layout, { passive: true });
}

Object.assign(window.PH,{packPhotos,setupMasonry});
})();
