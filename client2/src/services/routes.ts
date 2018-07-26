
const Routes = {
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    signInConfirmation: '/auth/sign-up-confirmation',
    emailConfirmation: '/auth/email-confirmation'
  },
  app: {
    fs: '/app/fs',
    fs_matcher: '/app/fs:path(.+)',
    search: 'app/search',
    search_matcher: '/app/search:path(.+)',
    createDirectory_matcher: '/app/fs/:path(.+#action=create-directory)'
  }
}


export default Routes
