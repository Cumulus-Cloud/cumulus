import * as React from 'react'

import { withStore } from 'store/store'
import { testUserAuth } from 'store/actions/authentication'


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

class WithAuthentication extends React.Component<Props & ContextProps, {}> {

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

export default withStore(WithAuthentication, (state, dispatch) => ({
  onLoad: () => dispatch(testUserAuth()),
  connected: state.auth.connected,
  loading: state.auth.loading
}))
