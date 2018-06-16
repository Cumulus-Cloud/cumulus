import * as React from 'react'
import { Dispatch, connect } from 'react-redux'

import UserState from '../../actions/user/userState'
import { UserActions, testSignedIn } from '../../actions/user/userActions'
import GlobalState from '../../actions/state';

interface Props {
  onLoad: () => void
  connected: boolean
  loading: boolean
  element: JSX.Element
  login: JSX.Element
  loader: JSX.Element
}

class WithAuthenticationElement extends React.Component<Props, {}> {

  componentDidMount() {
    this.props.onLoad()
  }

  render() {
    const { connected, loading, element, login, loader } = this.props

    if(connected)
      return element
    else if(loading)
      return loader
    else
      return login
  }

}


function mapStateToProps(state: GlobalState) {
  console.log(state)
  return {
    connected: !!state.user.signIn.user,
    loading: state.user.loading
  }
}

function mapDispatchToProps(dispatch: Dispatch<UserActions>) {
  return {
    onLoad: () => {
      dispatch(testSignedIn())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WithAuthenticationElement)
