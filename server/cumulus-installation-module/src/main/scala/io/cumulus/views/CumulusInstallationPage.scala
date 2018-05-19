package io.cumulus.views
import play.api.i18n.Messages
import scalatags.Text
import scalatags.Text.all._

case class CumulusInstallationPage(implicit
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
      h1("Installation page \uD83D\uDEE0")
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
      )
    )

}
