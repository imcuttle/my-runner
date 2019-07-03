const propTypes = myRunner.requireActual('prop-types')

const mockPropTypes = overwriteMap(propTypes)

function wrapCheckFunc(name, fn, argv, parent) {
  if (typeof fn === 'function') {
    let self = function(...argv) {
      return wrapCheckFunc(name, fn.apply(this, argv), argv)
    }
    Object.assign(self, {
      parent,
      fnName: name,
      parameter: argv && argv[0],
      isRequired: wrapCheckFunc('isRequired', fn.isRequired, null, self),
      toJSON() {
        let par = this.parent
        while (true) {
          if (!par || !par.parent) {
            break
          }
          par = par.parent
        }

        return {
          name: par ? par.fnName : this.fnName,
          isRequired: this.fnName === 'isRequired',
          parameter: par ? par.parameter : this.parameter
        }
      }
    })
    return self
  }

  return fn
}

function overwriteMap(propTypes, trackMap = new WeakMap()) {
  if (!propTypes) {
    return propTypes
  }

  // Circular
  if (trackMap.has(propTypes)) {
    return trackMap.get(propTypes)
  }

  let newMap = {}
  trackMap.set(propTypes, newMap)
  Object.keys(propTypes).forEach(key => {
    const fn = propTypes[key]
    if (typeof fn === 'function') {
      newMap[key] = wrapCheckFunc(key, fn)
    } else {
      newMap[key] = overwriteMap(fn, trackMap)
    }
  })

  return newMap
}

module.exports = mockPropTypes
