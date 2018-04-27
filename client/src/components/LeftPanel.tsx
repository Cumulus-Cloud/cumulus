import * as React from "react"
import * as styles from "./LeftPanel.css"
import classNames from "utils/ClassNames"

export interface Link {
  active?: boolean,
  disable?: boolean,
  href: string,
  title: string,
}

interface Props {
  links: Link[]
}

const activeStyle = classNames({
  [styles.link]: true,
  [styles.active]: true,
})

const LeftPanel: React.SFC<Props> = ({ links }) => {
  return (
    <div className={styles.leftPanel}>
      <div className={styles.appTitle}>
        {Messages("ui.appName")}
      </div>
      <ul className={styles.menu}>
        {links.map(({ href, title, active, disable }) =>
          <li className={styles.menuitem}>
            {disable
              ? <div className={styles.disable}>{title}</div>
              : <a className={active === true ? activeStyle : styles.link} href={href}>{title}</a>
            }
          </li>
        )}
      </ul>
    </div>
  )
}

export default LeftPanel
