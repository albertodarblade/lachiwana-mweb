// Navigate programmatically using the same view lookup F7's click handler uses.
// Calling router methods on the f7router prop or f7.views.main causes errors
// because those references don't have router.view set. Looking up the View
// from the DOM element (where F7 stores it as .f7View) always returns the
// fully initialized instance.

function getMainView() {
  const el = document.querySelector('.view-main')
  return el?.f7View ?? null
}

export function navigate(url, options) {
  const view = getMainView()
  if (view?.router) view.router.navigate(url, options)
}

export function navigateBack() {
  const view = getMainView()
  if (view?.router) view.router.back()
}
