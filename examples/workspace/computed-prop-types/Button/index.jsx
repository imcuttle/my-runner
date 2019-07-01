/**
 * @file index
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/7/1
 *
 */

import style from './style.less'
import * as React from 'react'
import * as PropTypes from 'prop-types'

const types = ['one'].concat('two', 'tree')
if (window.__button) {
  types.push('button')
}
export default class Button extends React.PureComponent {
  componentWillMount() {
    style.use()
  }
  componentWillUnmount() {
    style.unuse()
  }
  static propTypes = {
    type: PropTypes.oneOf(types)
  }
  static defaultProps = {}

  render() {
    return <div>I'm Button</div>
  }
}
