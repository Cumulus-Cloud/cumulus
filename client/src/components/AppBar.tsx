import * as React from "react"
import * as styles from "./AppBar.css"
import IconButton from "components/buttons/IconButton"
import Dropdown, { DropdownItem } from "components/menus/Dropdown"
import MoreVertiIcon from "components/icons/MoreVertiIcon"
import LogoutIcon from "components/icons/LogoutIcon"
import * as Api from "services/Api"

export default class AppBar extends React.PureComponent<{}> {
  render() {
    return (
      <div className={styles.appBar}>
        <div className={styles.appTitle}>{Messages("ui.appName")}</div>
        <div className={styles.actions}>
          <Dropdown right renderAction={() => <IconButton><MoreVertiIcon color="#FFFFFF" /></IconButton>}>
            <DropdownItem name={Messages("ui.auth.logout")} icon={<LogoutIcon />} onClick={this.handleOnLogout} />
          </Dropdown>
        </div>
      </div>
    )
  }

  handleOnLogout = () => Api.logout()
}
