
import { copyArr } from '@digitalbranch/u'

const _private = new WeakMap()

export default class Emitter {
  constructor () {
    _private.set(this, {
      events: {}
    })
  }

  on (event, listener) {
    // Added for use in mixin else undefined error
    if (!_private.get(this)) {
      _private.set(this, {
        events: {}
      })
    }

    let { events } = _private.get(this)

    if (typeof listener !== 'function') {
      throw new TypeError(listener + ' is not a function')
    }

    if (events[event] === undefined) {
      events[event] = [listener]
    } else if (events[event].every(fn => fn !== listener)) {
      events[event].push(listener)
    }

    return this
  }

  once (event, listener) {
    listener.once = true

    return this.on(event, listener)
  }

  removeListener (event, listener) {
    let { events } = _private.get(this)

    if (events[event] !== undefined) {
      events[event] = events[event].filter(fn => fn !== listener)
    }

    return this
  }

  emit (event) {
    // Added for use in mixin else undefined error
    if (!_private.get(this)) {
      _private.set(this, {
        events: {}
      })
    }

    let { events } = _private.get(this)

    if (events[event] && events.hasOwnProperty(event)) {
      events[event].forEach(listener => {
        try {
          listener.apply(this, [].slice.call(arguments, 1))
          if (listener.once) {
            this.removeListener(event, listener)
          }
        } catch (err) {
          if (events.error) {
            events.error.apply(this, [].slice.call(arguments, 1))
          } else {
            console.log(err)
          }
        }
      })
      return true
    } else {
      return false
    }
  }
  getEvent (event) {
    return _private.get(this).events[event]
  }
  listeners (event) {
    let events = _private.get(this).events
    let listeners = null

    if (events[event] !== undefined) {
      listeners = copyArr(events[event])
    }

    return listeners
  }
}
