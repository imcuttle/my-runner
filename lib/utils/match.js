/**
 * @file isMatched
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/6/26
 *
 */
const micromatch = require('micromatch')

function toRegExp(rule) {
  if (rule instanceof RegExp) {
    return rule
  }
  try {
    return new RegExp(rule)
  } catch (e) {
    return null
  }
}

function regExpMatch(value, rule) {
  rule = toRegExp(rule)
  return rule && value.match(rule)
}

function regExpReplace(value, rule, replacer) {
  rule = toRegExp(rule)
  return rule && value.replace(rule, replacer)
}

function match(value, rule) {
  // glob rule
  if (!micromatch.isMatch(value, rule)) {
    // regexp
    if (!regExpMatch(value, rule)) {
      return value.startsWith(rule)
    }
  }

  return true
}

function makeCheckArrify(checkFn) {
  return function(value, rule, ...argv) {
    if (Array.isArray(rule)) {
      return rule.find(eachRule => checkFn(value, eachRule, ...argv))
    }
    return checkFn(value, rule, ...argv)
  }
}

module.exports = {
  match: makeCheckArrify(match),
  regExpMatch,
  regExpReplace
}
