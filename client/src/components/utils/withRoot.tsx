import CssBaseline from '@material-ui/core/CssBaseline'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import  React from 'react'


// A theme with custom primary and secondary color.
const theme = createMuiTheme({
  palette: {
    //type: 'dark',
    primary: {
      main: '#29A7A0',
      contrastText: '#FFF',
    },
    secondary: {
      main: '#78909c',
      contrastText: '#FFF',
    },
    error: {
      main: '#f44336',
      contrastText: '#FFF'
    }
  }
})

function withRoot<P>(Component: React.ComponentType<P>) {
  function WithRoot(props: object) {

    const ComponentFix = Component as React.ComponentType<any> // TODO remove when React is fixed

    // MuiThemeProvider makes the theme available down the React tree
    // thanks to React context.
    return (
      <MuiThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <ComponentFix {...props} />
      </MuiThemeProvider>
    )
  }

  return WithRoot
}

export default withRoot
