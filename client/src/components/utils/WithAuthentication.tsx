import  React from 'react'

import { useAuthentication } from 'store/store'


interface Props {
  authenticated: JSX.Element
  fallback: JSX.Element
  loader: JSX.Element
}

function WithAuthentication(props: Props) {

  const [initialized, setInitialized] = React.useState(false)

  const { loading, connected, testUserAuth } = useAuthentication()

  const { authenticated, fallback, loader } = props

  React.useEffect(() => {
    if (!initialized) {
      testUserAuth()
      setInitialized(true)
    }
  })

  if(connected)
    return authenticated
  else if(loading)
    return loader
  else
    return fallback

}

export default WithAuthentication
