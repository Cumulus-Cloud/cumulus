import * as React from "react"
import * as styles from "./Dropdown.css"
import classNames from "utils/ClassNames"

interface Props {
  right?: boolean
  renderAction: () => JSX.Element
}

interface State {
  open: boolean
}

export default class Dropdown extends React.Component<Props, State> {

  itemsRef: HTMLDivElement | null

  constructor(props: Props) {
    super(props)
    this.state = {
      open: false
    }
    document.addEventListener("click", this.handleOnOusideClick, false)
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleOnOusideClick, false)
  }

  handleOnOusideClick = (e: Event) => {
    const isContains = this.itemsRef && this.itemsRef.contains((e as any).target)
    if (!isContains) {
      this.onClose()
    }
  }

  render() {
    const { right = false, renderAction, children } = this.props
    const { open } = this.state
    const itemsClasses = classNames({
      [styles.items]: true,
      [styles.itemsRight]: right,
      [styles.itemsLeft]: !right,
    })
    return (
      <div className={styles.dropdown} ref={ref => this.itemsRef = ref}>
        <div onClick={this.onOpen}>
          {renderAction()}
        </div>
        {open ? <ul className={itemsClasses} onClick={this.onClose}>{children}</ul> : null}
      </div>
    )
  }

  onOpen = () => this.setState({ open: true })
  onClose = () => this.setState({ open: false })
}

interface DropdownItemProps {
  name: string,
  icon?: JSX.Element
  onClick?: () => void
  href?: string
}

export function DropdownItem(props: DropdownItemProps) {
  return (
    <li className={styles.item} onClick={props.onClick}>
      {props.icon}
      <div className={styles.label}>
        {props.name}
      </div>
    </li>
  )
}
