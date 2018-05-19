import * as React from "react"
import * as styles from "./RecoveryContainer.css"

import LeftPanel, { Link } from "components/LeftPanel"

const links: Link[] = []

interface Stack {
  className: string
  methodName: string
  fileName: string
  lineNumber: string
}

interface Error {
  message: string
  stacks: Stack[]
}

export default class RecoveryContainer extends React.PureComponent {
  render() {
    // tslint:disable-next-line:no-any
    const errors = ((window as any).cumulusErrors as Error[])
    return (
      <div className={styles.recoveryContainer}>
        <LeftPanel links={links} />
        <div className={styles.mainContainer}>
          <div className={styles.content}>
            <h1 className={styles.title}>Oh no, an error occurred! 😢</h1>
            <p className={styles.message}>
                An error preventing the Cumulus server to start has occurred. The server is now started in
                recovery mode to show you what went wrong.<br/><br/>
                Errors usually come from configuration error such as an unreachable database.<br/><br/>
                Use the stack trace below to see what when wrong. In futures versions, Cumulus will try to
                guess what went wrong.
            </p>
            <div className={styles.stacks}>
              {errors.map(error => {
                return (
                  <div>
                    <h1 className={styles.errorMessage}>{error.message}</h1>
                    {error.stacks.map(stack => {
                      return (
                        <div className={styles.stack}>
                          {stack.className}
                          <span className={styles.sep}>.</span>
                          {stack.methodName}
                          <span className={styles.sep}>(</span>
                          {stack.fileName}
                          <span className={styles.sep}>:</span>
                          <span className={styles.highlight}>{stack.lineNumber}</span>
                          <span className={styles.sep}>)</span>
                        </div>
                      )
                    }) }
                  </div>
                )
              })}
            </div>
          </div>
          <div className={styles.actions}>
            <button>lol</button>
          </div>
        </div>
      </div>
    )
  }
}
