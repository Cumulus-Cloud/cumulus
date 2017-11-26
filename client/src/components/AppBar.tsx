import * as React from "react"
import * as styles from "./AppBar.css"
import IconButton from "components/buttons/IconButton"
import Dropdown, { DropdownItem } from "components/Dropdown"
import MoreHorizIcon from "components/icons/MoreHorizIcon"
import LogoutIcon from "components/icons/LogoutIcon"
import * as Api from "services/Api"

interface Props {

}

export default class AppBar extends React.PureComponent<Props> {
  render() {
    return (
      <div className={styles.appBar}>
        <div className={styles.appTitle}>Cumulus</div>
        <div className={styles.actions}>
          <Dropdown right renderAction={() => <IconButton><MoreHorizIcon color="#FFFFFF" /></IconButton>}>
            <DropdownItem name="Profile" icon={<MoreHorizIcon />} onClick={() => { console.log("DropdownItem.Profile") }} />
            <DropdownItem name="Parameters" icon={<MoreHorizIcon />} onClick={() => { console.log("DropdownItem.Parameters") }} />
            <DropdownItem name="Logout" icon={<LogoutIcon />} onClick={this.handleOnLogout} />
          </Dropdown>
        </div>
      </div>
    )
  }

  handleOnLogout = () => Api.logout()
}
