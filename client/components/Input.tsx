import * as React from "react"
import "./input.css"

type InputType = "text" | "email" | "password"

interface Props {
  label: string
  error?: string[]
  value: string
  type?: InputType
  require?: boolean
  onChange: (event: React.FormEvent<HTMLInputElement>) => void
}

export default function Input(props: Props) {
  const { label, error, value, type, require, onChange } = props
  return (
    <div className="group">
      <label className="label">{label}</label>
      <input className="input"
        required={require || false}
        type={type || "text"}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}
