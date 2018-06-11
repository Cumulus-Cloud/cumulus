import CssBaseline from '@material-ui/core/CssBaseline'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import * as React from 'react'

// A theme with custom primary and secondary color.
// It's optional.
const theme = createMuiTheme({
    /*
  palette: {
    primary: {
      light: '#FFC533',
      main: '#FFC533',
      dark: '#FFC533',
      contrastText: '#000',
    },
    secondary: {
      light: '#495057',
      main: '#495057',
      dark: '#495057',
      contrastText: '#FFF',
    }
  }*/
})

function withRoot(Component: React.ComponentType) {
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
