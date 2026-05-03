let _onUpdateReady = null

export function setOnUpdateReady(cb) {
  _onUpdateReady = cb
}

export function notifyUpdateReady(worker) {
  _onUpdateReady?.(worker)
}
