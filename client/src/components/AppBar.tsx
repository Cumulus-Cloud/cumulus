import * as React from "react"
import * as styles from "./AppBar.css"
import IconButton from "components/buttons/IconButton"
import Dropdown, { DropdownItem } from "components/Dropdown"
import MoreHorizIcon from "components/icons/MoreHorizIcon"

interface Props {

}

export default class AppBar extends React.PureComponent<Props> {
  render() {
    return (
      <div className={styles.appBar}>
        <div className={styles.appTitle}>Cumulus</div>
        <Dropdown renderAction={() => <IconButton><MoreHorizIcon color="#FFFFFF" /></IconButton>}>
          <DropdownItem name="Profile" icon={<MoreHorizIcon />} onClick={() => { console.log("DropdownItem.Profile") }} />
          <DropdownItem name="Parameters" icon={<MoreHorizIcon />} onClick={() => { console.log("DropdownItem.Parameters") }} />
          <DropdownItem name="Logout" icon={<MoreHorizIcon />} onClick={() => { console.log("DropdownItem.Logout") }} />
        </Dropdown>
      </div>
    )
  }
}
