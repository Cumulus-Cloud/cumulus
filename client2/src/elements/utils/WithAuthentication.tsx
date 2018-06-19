import * as React from 'react'
import { Dispatch, connect } from 'react-redux'

import GlobalState from '../../actions/state'
import { AuthenticationActions, testSignedIn } from '../../actions/user/auth/authenticationActions'

interface Props {
  onLoad: () => void
  connected: boolean
  loading: boolean
  authenticated: JSX.Element
  fallback: JSX.Element
  loader: JSX.Element
}

class WithAuthenticationElement extends React.Component<Props, {}> {

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


function mapStateToProps(state: GlobalState) {
  console.log(state)
  return {
    connected: !!state.auth.connected,
    loading: state.auth.loading
  }
}

function mapDispatchToProps(dispatch: Dispatch<AuthenticationActions>) {
  return {
    onLoad: () => {
      dispatch(testSignedIn())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WithAuthenticationElement)
