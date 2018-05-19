package io.cumulus.views
import play.api.i18n.Messages
import scalatags.Text
import scalatags.Text.all._

case class CumulusInstallationPage(
  error: Throwable
)(implicit
  val messages: Messages
) extends CumulusStaticTemplate {

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
      h1(messages("view.recovery.title")),
      p(
        messages("view.recovery.content-1"),
        br,br,
        messages("view.recovery.content-2"),
        br,br,
        messages("view.recovery.content-3")
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
      input(
        id      := "reload",
        `type`  := "button",
        `class` := "button",
        value   := messages("view.recovery.button.reload")
      ),
      input(
        id      := "stop",
        `type`  := "button",
        `class` := "button",
        value   := messages("view.recovery.button.stop")
      ),
      input(
        disabled := "disabled",
        `type`   := "button",
        `class`  := "button",
        value    :=  messages("view.recovery.button.update-conf")
      )
    )

}
