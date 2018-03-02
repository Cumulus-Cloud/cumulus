import * as React from "react"
import * as styles from "./AppBar.css"
import IconButton from "components/buttons/IconButton"
import Dropdown, { DropdownItem } from "components/menus/Dropdown"
import MoreVertiIcon from "icons/MoreVertiIcon"
import LogoutIcon from "icons/LogoutIcon"
import * as Api from "services/Api"
import SearchContainer from "files/search/SearchContainer"

export default class AppBar extends React.PureComponent<{}> {
  render() {
    return (
      <div className={styles.appBar}>
        <SearchContainer />
        <div className={styles.actions}>
          <Dropdown right renderAction={() => <IconButton><MoreVertiIcon /></IconButton>}>
            <DropdownItem name={Messages("ui.auth.logout")} icon={<LogoutIcon />} onClick={this.handleOnLogout} />
          </Dropdown>
        </div>
      </div>
    )
  }

  handleOnLogout = () => Api.logout()
}
