import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import store from './actions/store'

import { CircularProgress } from '@material-ui/core'
import WithAuthenticationContainer from './elements/utils/WithAuthentication'

import LoginApp from './pages/LoginPageContainer'
import MainApp from './pages/AppPageContainer'
import AppBackground from './elements/utils/AppBackground'

const loader = (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <CircularProgress size={100} style={{ color: 'white' }}/>
  </div>
)

ReactDOM.render(
  <Provider store={store} >
    <AppBackground>
      <WithAuthenticationContainer
        element={<MainApp/>}
        login={<LoginApp/>}
        loader={loader}
      />
    </AppBackground>
  </Provider>,
  document.querySelector('#app')
)
