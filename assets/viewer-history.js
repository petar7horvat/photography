(function(){
// One history entry per viewer, not per photograph.
// Browser Back closes the viewer; Forward restores the selected photograph.
function createViewerHistory({ browser, getIndex, onNavigate, getKey = index => String(index + 1) }) {
  const token = `ph-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const clean = () => { const u = new URL(browser.location.href); u.hash = ''; return u; };
  const urlFor = index => { const u = clean(); u.hash = 'foto=' + encodeURIComponent(getKey(index)); return u; };
  function enter(index, push = true) {
    if (push) browser.history.pushState({ ...browser.history.state, phViewer: token }, '', urlFor(index));
    else browser.history.replaceState({ ...browser.history.state, phViewer: token }, '', urlFor(index));
  }
  function change(index) {
    if (browser.history.state?.phViewer === token)
      browser.history.replaceState({ ...browser.history.state }, '', urlFor(index));
  }
  function close() {
    if (browser.history.state?.phViewer === token) browser.history.back();
  }
  function prepareDirectLink() {
    const index = getIndex();
    if (index !== null) {
      const state = { ...browser.history.state }; delete state.phViewer;
      browser.history.replaceState(state, '', clean());
    }
    return index;
  }
  function popstate() { onNavigate(getIndex()); }
  browser.addEventListener('popstate', popstate);
  return { enter, change, close, prepareDirectLink, dispose: () => browser.removeEventListener('popstate', popstate) };
}

window.PH.createViewerHistory=createViewerHistory;
})();
