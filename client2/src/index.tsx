import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import { store } from './actions/user/userStore'

import AppPage from './pages/AppPage'
import { CircularProgress } from '@material-ui/core'
import WithAuthenticationContainer from './elements/utils/WithAuthentication'

import LoginApp from './pages/LoginContainer'
import AppBackground from './elements/utils/AppBackground'

ReactDOM.render(
  <Provider store={store} >
    <AppBackground>
      <WithAuthenticationContainer
        element={<AppPage/>}
        login={<LoginApp/>}
        loader={<CircularProgress size={100} style={{ color: 'white' }}/>}
      />
    </AppBackground>
  </Provider>,
  document.querySelector('#app')
)
