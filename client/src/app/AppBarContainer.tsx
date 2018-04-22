import * as React from "react"
import { Dispatch, connect } from "react-redux"
import { GlobalState } from "store"
import * as AuthActions from "auth/AuthActions"
import AppBar from "components/AppBar"
import { User } from "models/User"

interface DispatchProps {
  onLogout(): void
}

interface PropsState {
  user?: User
}

type Props = PropsState & DispatchProps

class AppBarContainer extends React.PureComponent<Props> {
  render() {
    const { onLogout } = this.props
    return <AppBar onLogout={onLogout} />
  }
}

const mapStateToProps = (state: GlobalState): PropsState => {
  return {
    user: state.auth.user
  }
}
const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onLogout: () => dispatch(AuthActions.logout())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppBarContainer)
