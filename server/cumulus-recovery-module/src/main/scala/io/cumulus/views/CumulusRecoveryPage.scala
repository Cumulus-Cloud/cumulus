package io.cumulus.views
import play.api.i18n.Messages
import scalatags.Text
import scalatags.Text.all._

case class CumulusRecoveryPage(error: Throwable)(implicit messages: Messages) extends CumulusStaticTemplate {

  override protected lazy val pageHead: Seq[Tag] =
    super.pageHead ++
      Seq(
        script(
          src                 := "https://code.jquery.com/jquery-3.2.1.slim.min.js",
          attr("integrity")   := "sha256-k2WSCIexGzOj3Euiig+TlR8gA0EmPjuc79OEeY5L45g=",
          attr("crossorigin") := "anonymous"
        ),
        script(raw(
          """
            $(document).ready(() => {
              const reload = $('#reload')
              const stop   = $('#stop')

              reload.click(() => {
                reload.attr('disabled', 'disabled')
                reload.attr('value', 'Server reloading...')

                fetch('/api/admin/management/reload', {
                  method: 'GET'
                }).then((response) => {
                  setTimeout(() => {
                    location.reload();
                  }, 8000)
                })
              })

              stop.click(() => {
                stop.attr('disabled', 'disabled')
                stop.attr('value', 'Server stopping...')

                fetch('/api/admin/management/stop', {
                  method: 'GET'
                }).then((response) => {
                  setTimeout(() => {
                    alert("Server stopped")
                      location.reload();
                    }, 8000)
                 })
              })
            })
          """
        ))
      )

  override protected lazy val pageContent: Seq[Text.all.Tag] =
    Seq(
      h1("Oh no, an error occurred! \uD83D\uDE22"), // TODO internationalization
      p("""
          An error preventing the Cumulus server to start has occurred. The server is now started in
          recovery mode to show you what went wrong.
        """, // TODO internationalization
        br,br,
        """
          Errors usually come from configuration error such as an unreachable database.
        """, // TODO internationalization
        br,br,
        """
          Use the stack trace below to see what when wrong. In futures versions, Cumulus will try to
          guess what went wrong.
        """ // TODO internationalization
      ),
      ul(
        error.getStackTrace.toList.map { trace =>
          li(
            trace.getClassName,
            span(`class` := "sep", "."),
            trace.getMethodName,
            span(`class` := "sep", "("),
            trace.getFileName,
            span(`class` := "sep", ":"),
            span(`class` := "highlight", trace.getLineNumber),
            span(`class` := "sep", ")")
          )
        }
      )
    )

  override protected lazy val pageRightPanel: Seq[Text.all.Tag] =
    Seq(
      input(id := "reload", `type` := "button", `class` := "button", value := "Reload the server"),
      input(id := "stop", `type` := "button", `class` := "button", value := "Stop the server"),
      input(disabled := "disabled", `type` := "button", `class` := "button", value := "Update the configuration")
    ) // TODO internationalization

}
