import React from 'react'
import ReactDOM from 'react-dom'
import Typography from '@material-ui/core/Typography'
import { DraggingInfo } from 'components/utils/DragAndDrop'
import Fade from '@material-ui/core/Fade'
import Paper from '@material-ui/core/Paper'

import { FsNode } from 'models/FsNode'
import NodeIcon, { NodesIcon } from 'components/fs/NodeIcon'


// Root element for the dragging placeholder
const draggedElementRoot = document.getElementById('app-dragged')

// Dragging placeholder static component
function DraggedElement(dragInfo: DraggingInfo<FsNode[]>): React.ReactNode {
  if(draggedElementRoot) {
    const { x, y, value: nodes } = dragInfo

    // TODO style from a style element
    return (
      // Note: we need to a use a portal because material UI animations
      // use the transform CSS properties and break the fixed position
      ReactDOM.createPortal(
        <Fade in timeout={800} unmountOnExit={false} >
          <Paper
            style={{
              maxWidth: 225,
              padding: 8,
              paddingRight: 15,
              position: 'fixed',
              alignItems: 'center',
              pointerEvents: 'none',
              display: 'flex',
              zIndex: 9999,
              transform: `translate(${x}px, ${y}px)`,
              top: 0,
              left: 0
            }}
            key="dragged"
          >
            {
              nodes.length === 1 ? (
                <>
                  <NodeIcon node={ nodes[0] } />
                  <Typography variant="body1" noWrap style={{ flex: 1 }} >
                    { nodes[0].name }
                  </Typography>
                </>
              ): (
                <>
                  <NodesIcon />
                  <Typography variant="body1" noWrap style={{ flex: 1 }} >
                    { `${nodes.length} éléments` }
                  </Typography>
                </>
              )
            }
          </Paper>
        </Fade>,
        draggedElementRoot
      )
    )
  } else
    return null
}

export default DraggedElement
