import * as React from "react"
import * as styles from "./Button.css"
import LoaderIcon from "icons/LoaderIcon"
import classNames from "utils/ClassNames"
import BaseButton from "components/buttons/BaseButton"

interface Props {
  label: string
  disable?: boolean
  loading?: boolean
  className?: string
  large?: boolean
  onClick(): void
}

export default function Button({ label, onClick, disable = false, loading = false, large = false }: Props): JSX.Element {
  const inputClasses = classNames({
    [styles.button]: true,
    [styles.disable]: disable,
    [styles.large]: large,
  })
  return (
    <BaseButton
      className={inputClasses}
      onClick={onClick}
      disable={disable}
      loading={loading}
      renderLoader={() => <LoaderIcon color="#FFFFFF" />}
    >
      <label className={styles.label}>{label}</label>
    </BaseButton>
  )
}
