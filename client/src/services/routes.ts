
const Routes = {
  auth: {
    signIn:             '/auth/sign-in',
    signUp:             '/auth/sign-up',
    signInConfirmation: '/auth/sign-up-confirmation',
    emailConfirmation:  '/auth/email-confirmation'
  },
  app: {
    fs:             '/app/fs',
    fs_matcher:     '/app/fs:path(.+)',
    events:         '/app/events',
    events_matcher: '/app/events(.*)'
  },
  api: {
    management: {
      reload: '/api/admin/management/reload',
      stop:   '/api/admin/management/stop',
    },
    users: {
      base:             '/api/users',
      me:               '/api/users/me',
      login:            '/api/users/login',
      signUp:           '/api/users/signup',
      signOut:          '/api/users/logout',
      setFirstPassword: '/api/users/firstPassword',
      changeLang:       '/api/users/lang',
      changePassword:   '/api/users/password',
      events:           '/api/users/events',
      sessions: {
        all:                     '/api/users/sessions',
        get:    (ref: string) => `/api/users/sessions/${ref}`,
        revoke: (ref: string) => `/api/users/sessions/${ref}/revoke`,
      }
    },
    fs: {
      base:                             '/api/fs',
      get:        (id: string)       => `/api/fs/${id}`,
      getContent: (id: string)       => `/api/fs/${id}/content`,
      search:                           '/api/fs/search',
      upload:     (parentId: string) => `/api/fs/${parentId}/upload`,
      tumbnail:   (id: string)       => `/api/fs/${id}/thumbnail`,
      download:   (id: string)       => `/api/fs/${id}/download`,
      create:                           '/api/fs',
      delete:     (id: string)       => `/api/fs/${id}`,
    }
  }
}


export default Routes
