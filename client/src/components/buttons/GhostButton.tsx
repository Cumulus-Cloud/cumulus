import * as React from "react"
import * as styles from "./GhostButton.css"
import LoaderIcon from "icons/LoaderIcon"
import BaseButton from "components/buttons/BaseButton"

interface Props {
  label: string
  loading?: boolean
  disable?: boolean
  matchParent?: boolean
  href?: string
  onClick?(): void
}

export default class GhostButton extends React.PureComponent<Props> {
  render() {
    const { label, href, onClick, matchParent, loading = false, disable = false } = this.props
    return (
      <BaseButton
        href={href}
        className={styles.ghostButton}
        disable={disable}
        loading={loading}
        renderLoader={() => <LoaderIcon />}
        onClick={onClick}
        matchParent={matchParent}
      >
        <div className={styles.label}>{label}</div>
      </BaseButton>
    )
  }
}
