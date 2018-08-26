import * as React from 'react'

import { withStore } from '../..'

interface Props {
  authenticated: JSX.Element
  fallback: JSX.Element
  loader: JSX.Element
}

interface ContextProps {
  onLoad: () => void
  connected: boolean
  loading: boolean
}

class WithAuthenticationElement extends React.Component<Props & ContextProps, {}> {

  componentDidMount() {
    this.props.onLoad()
  }

  render() {
    const { connected, loading, authenticated, fallback, loader } = this.props


    if(connected)
      return authenticated
    else if(loading)
      return loader
    else
      return fallback
  }

}

const WithAuthentication = (props: Props) => (
  withStore(ctx => (
    <WithAuthenticationElement
      {...props}
      onLoad={() => ctx.actions.testUserAuth()}
      connected={ctx.state.auth.connected}
      loading={ctx.state.auth.loading}
    />
  ))
)

export default WithAuthentication
