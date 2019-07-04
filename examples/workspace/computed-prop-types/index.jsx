/**
 * @file index
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/7/4
 *
 */
import React from 'react'
import ReactDOM from 'react-dom'
import Button from './Button'

const div = document.createElement('div')
document.body.appendChild(div)

ReactDOM.render(
  <div>
    <Button>click</Button>
  </div>,
  div
)

console.log(div.innerHTML)
