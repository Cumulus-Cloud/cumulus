import * as React from "react"
import * as styles from "./RightPanel.css"
import NewFolderContainer from "newFolder/NewFolderContainer"
import UploadContainer from "upload/UploadContainer"

export default class RightPanel extends React.PureComponent<{}> {
  render() {
    return (
      <div className={styles.rightPanel}>
        <UploadContainer />
        <NewFolderContainer />
      </div>
    )
  }
}
