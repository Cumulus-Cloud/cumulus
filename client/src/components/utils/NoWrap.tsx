import  React from 'react'


function NoWrap(props: { children?: React.ReactNode }) {
  return <span style={ { wordBreak: 'break-all' } }>{ props.children }</span>
}

export default NoWrap
