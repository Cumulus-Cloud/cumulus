import * as React from "react"
import * as styles from "components/inputs/Input.css"

type InputType = "text" | "email" | "password"

interface Props {
  label: string
  value: string
  error?: string
  type?: InputType
  onChange(value: string): void
}

export default class Input extends React.PureComponent<Props> {
  render() {
    const { label, error, value, type } = this.props
    return (
      <div className={styles.inputContainer}>
        <label className={styles.label}>{label}</label>
        <input
          className={styles.input}
          type={type || "text"}
          value={value}
          onChange={this.handleOnChange}
        />
        {error ? <div className={styles.error}>{error}</div> : null}
      </div>
    )
  }

  handleOnChange = (event: React.FormEvent<HTMLInputElement>) => this.props.onChange(event.currentTarget.value)
}
