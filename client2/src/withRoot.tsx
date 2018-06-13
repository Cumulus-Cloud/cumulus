import CssBaseline from '@material-ui/core/CssBaseline'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import * as React from 'react'

// A theme with custom primary and secondary color.
// It's optional.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#29A7A0',
      contrastText: '#FFF',
    },
    secondary: {
      main: '#6200EE',
      contrastText: '#FFF',
    },
    error: {
      main: '#C51162',
      contrastText: '#FFF'
    }
  }
})

function withRoot<P>(Component: React.ComponentType<P>) {
  function WithRoot(props: object) {
    // MuiThemeProvider makes the theme available down the React tree
    // thanks to React context.
    return (
      <MuiThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Component {...props} />
      </MuiThemeProvider>
    )
  }

  return WithRoot
}

export default withRoot
