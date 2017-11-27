import * as React from "react"
import * as styles from  "./Button.css"
import LoaderIcon from "icons/LoaderIcon"
import classNames from "utils/ClassNames"

interface Props {
  label: string
  disable?: boolean
  loading?: boolean
  onClick: () => void
}

export default class Button extends React.PureComponent<Props> {
  render() {
    const { label, disable = false, loading = false } = this.props
    const inputClasses = classNames({
      [styles.button]: true,
      [styles.disable]: disable
    })
    return (
      <div className={inputClasses} onClick={this.handleOnClick}>
        {loading
          ? <LoaderIcon color="#FFFFFF" />
          : <label className={styles.label}>{label}</label>
        }
      </div>
    )
  }

  handleOnClick = () => {
    const { onClick, disable = false, loading = false } = this.props
    if (!disable && !loading) {
      onClick()
    }
  }
}
