import * as React from "react"
import * as styles from "inAppNotif/InAppNotifContainer.css"
import { connect, Dispatch } from "react-redux"
import { GlobalState } from "store"
import { InAppNotif } from "inAppNotif/InAppNotif"
import { InAppNotifActions } from "inAppNotif/InAppNotifActions"
import classNames from "utils/ClassNames"

interface PropsState {
  inAppNotif?: InAppNotif
}

interface DispatchProps {
  onHide(): void
}

type Props = PropsState & DispatchProps

class InAppNotifContainer extends React.PureComponent<Props> {
  render() {
    const { inAppNotif, onHide } = this.props
    if (inAppNotif) {
      const classes = classNames({
        [styles.inAppNotif]: true,
        [styles.error]: inAppNotif.type === "error"
      })
      return (
        <div onClick={onHide} className={classes}>
          {inAppNotif.message}
        </div>
      )
    } else {
      return null
    }
  }
}

const mapStateToProps = (state: GlobalState): PropsState => {
  return {
    inAppNotif: state.inAppNotif.inAppNotif,
  }
}

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>): DispatchProps => {
  return {
    onHide: () => dispatch(InAppNotifActions.hideInAppNotif())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InAppNotifContainer)
