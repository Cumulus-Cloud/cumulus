import * as React from "react"
import * as styles from "./Loader.css"
import LoaderIcon from "icons/LoaderIcon"

export default function Loader(props: {}): JSX.Element {
  return (
    <div className={styles.loader}>
      <LoaderIcon width={50} height={50} />
    </div>
  )
}
