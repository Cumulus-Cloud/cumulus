import React from 'react'
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles'
import Paper from '@material-ui/core/Paper'
import { FixedSizeList as List, ListChildComponentProps } from 'react-window'
import Resize from 'components/utils/Resize'

import styles from './styles'


interface Props<T> {

  /** Header of the table */
  header: JSX.Element

  /** Row renderer. */
  renderRow: (element: T, style: React.CSSProperties, isScrolling: boolean, index: number) => JSX.Element

  /** Heigh of a row. Used for the infinite loading. */
  rowHeight: number

  /** Loading row renderer. */
  renderLoadingRow: (style: React.CSSProperties, isScrolling: boolean, index: number) => JSX.Element

  elementKey: (element: T) => string

  /** When more content needs to be loaded. */
  onLoadMoreElements: (offset: number) => void
  
  /** If more content is loading. */
  loading: boolean

  /** Currently loaded rows. */
  elements: T[]

  /** Maximum number of rows. */
  elementsSize: number

}

type PropsWithStyle<T> = Props<T> & WithStyles<typeof styles>


class InfiniteScrollTableBase<T> extends React.Component<PropsWithStyle<T>, {}> {

  loadMoreElements() {
    const { loading, onLoadMoreElements, elements } = this.props

    if(!loading)
      onLoadMoreElements(elements.length)

    return Promise.resolve()
  }

  renderRow = (props: ListChildComponentProps): React.ReactElement<{}> => {
    const { elements, renderLoadingRow, renderRow } = this.props
    const { index, isScrolling, style } = props as ListChildComponentProps & { isScrolling: boolean }

    if(index >= elements.length)
      return renderLoadingRow(style, isScrolling, index)
    else
      return renderRow(elements[index], style, isScrolling, index)
  }

  render() {
    const { elements, elementsSize, classes, header, rowHeight } = this.props

    return (
      <Paper className={classes.root} >
        <div className={classes.contentTableHead}>
          <div className={classes.contentHeadRow} >
            { header }
          </div>
        </div>
        <div className={classes.contentTableBody}>
          <Resize style={{ flex: 1 }} >
            { ({ height }) =>
              <List
                height={ height }
                width="inherit"
                useIsScrolling
                itemCount={ elements.length + (elementsSize === elements.length ? 0 : 1) }
                itemSize={ rowHeight }
                overscanCount={ 15 }
                itemKey={(index) => {
                  const { elements, elementKey } = this.props
                  return index >= elements.length ? 'loading' : elementKey(elements[index])
                }}
                onItemsRendered={({ visibleStopIndex }) => {
                  const { elementsSize, elements } = this.props
                  const loadedContentSize = elements.length

                  // Load when more than 75% is shown
                  if((visibleStopIndex > loadedContentSize * 0.7) && loadedContentSize < elementsSize ) {
                    this.loadMoreElements()
                  }
                }}
              >
                { this.renderRow }
              </List>
            }
          </Resize>
        </div>
      </Paper>
    )
  }

}

const InfiniteScrollTableWithStyle = withStyles(styles)(InfiniteScrollTableBase)

export default function InfiniteScrollTable<T>(props: Props<T>) {
  return <InfiniteScrollTableWithStyle {...props as any} />
}

