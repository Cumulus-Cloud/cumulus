package io.cumulus.views
import play.api.i18n.Messages
import scalatags.Text
import scalatags.Text.all._

case class CumulusInstallationPage(

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
            |$(document).ready(() => {
            |
            |    function getConfig(configHandler) {
            |        const getEndpoint = configHandler.get
            |
            |        if(getEndpoint) {
            |            return fetch(
            |                getEndpoint,
            |                { method: 'GET' }
            |            )
            |            .then((response) => response.json())
            |        } else {
            |            return Promise.resolve({})
            |        }
            |    }
            |
            |    function testConfig(configHandler, config) {
            |        const testEndpoint = configHandler.test
            |
            |        if(testEndpoint) {
            |            return fetch(
            |                testEndpoint,
            |                {
            |                   method: 'POST',
            |                   body: JSON.stringify(config),
            |                   headers: {
            |                     'Accept': 'application/json',
            |                     'Content-Type': 'application/json'
            |                   }
            |                }
            |            )
            |            .then((response) => response.json())
            |            .then((json) => {
            |                if(json.success)
            |                    return json
            |                else
            |                    throw json
            |            })
            |        } else {
            |            return Promise.resolve({})
            |        }
            |    }
            |
            |    function updatedConfig(configHandler, config) {
            |        const configureEndpoint = configHandler.configure
            |
            |        if(configureEndpoint) {
            |            return fetch(
            |                configureEndpoint,
            |                {
            |                   method: 'POST',
            |                   body: JSON.stringify(config),
            |                   headers: {
            |                     'Accept': 'application/json',
            |                     'Content-Type': 'application/json'
            |                   }
            |                }
            |            )
            |            .then((response) => response.json())
            |            .then((json) => {
            |                if(json.success)
            |                    return json
            |                else
            |                    throw json
            |            })
            |        } else {
            |            return Promise.resolve({})
            |        }
            |    }
            |
            |    const databaseConfigHandler = {
            |        get: '/api/configuration/database',
            |        test: '/api/configuration/database/test',
            |        configure: '/api/configuration/database/configure'
            |    }
            |
            |    const emailConfigHandler = {
            |        get: '/api/configuration/email',
            |        test: '/api/configuration/email/test',
            |        configure: '/api/configuration/email/configure'
            |    }
            |
            |    const adminConfigHandler = {
            |        configure: '/api/configuration/admin/configure'
            |    }
            |
            |    // -- Database configuration
            |
            |    function getDatabaseConf() {
            |        return {
            |            hostname: $('#database-hostname').val(),
            |            username: $('#database-username').val(),
            |            password: $('#database-password').val(),
            |            database: $('#database-database').val(),
            |            port: Number($('#database-port').val())
            |        }
            |    }
            |
            |    function setDatabaseConf(conf) {
            |        $('#database-hostname').val(conf.hostname)
            |        $('#database-username').val(conf.username)
            |        $('#database-password').val(conf.password)
            |        $('#database-database').val(conf.database)
            |        $('#database-port').val(conf.port)
            |    }
            |
            |    $('#database-load').click(() => {
            |        getConfig(databaseConfigHandler).then((conf) => setDatabaseConf(conf))
            |    })
            |
            |    $('#database-test').click(() => {
            |        testConfig(databaseConfigHandler, getDatabaseConf())
            |        .then((conf) => {
            |            console.log(conf)
            |            $('#database-error').text(JSON.stringify(conf, null, 2))
            |        })
            |        .catch((error) => {
            |            console.error(error)
            |            $('#database-error').text(JSON.stringify(error, null, 2))
            |        })
            |    })
            |
            |    $('#database-configure').click(() => {
            |        updatedConfig(databaseConfigHandler, getDatabaseConf())
            |        .then((conf) => {
            |            console.log(conf)
            |            $('#database-error').text(JSON.stringify(conf, null, 2))
            |        })
            |        .catch((error) => {
            |            console.error(error)
            |            $('#database-error').text(JSON.stringify(error, null, 2))
            |        })
            |    })
            |
            |
            |    // -- Email configuration
            |
            |    function getEmailConf() {
            |        return {
            |            host: $('#email-host').val(),
            |            port: Number($('#email-port').val()),
            |            ssl: $('#email-ssl').is(':checked'),
            |            tls: $('#email-tls').is(':checked'),
            |            tlsRequired: $('#email-tlsRequired').is(':checked'),
            |            user: $('#email-user').val(),
            |            password: $('#email-password').val(),
            |            from: $('#email-from').val()
            |        }
            |    }
            |
            |    function setEmailConf(conf) {
            |        $('#email-host').val(conf.host)
            |        $('#email-port').val(conf.port)
            |        $('#email-ssl').val(conf.ssl)
            |        $('#email-tls').val(conf.tls)
            |        $('#email-tlsRequired').val(conf.tlsRequired)
            |        $('#email-user').val(conf.user)
            |        $('#email-password').val(conf.password)
            |        $('#email-from').val(conf.from)
            |    }
            |
            |    $('#email-load').click(() => {
            |        getConfig(emailConfigHandler).then((conf) => setEmailConf(conf))
            |    })
            |
            |    $('#email-test').click(() => {
            |        testConfig(emailConfigHandler, getEmailConf())
            |        .then((conf) => {
            |            console.log(conf)
            |            $('#email-error').text(JSON.stringify(conf, null, 2))
            |        })
            |        .catch((error) => {
            |            console.error(error)
            |            $('#email-error').text(JSON.stringify(error, null, 2))
            |        })
            |    })
            |
            |    $('#email-configure').click(() => {
            |        updatedConfig(emailConfigHandler, getEmailConf())
            |        .then((conf) => {
            |            console.log(conf)
            |            $('#email-error').text(JSON.stringify(conf, null, 2))
            |        })
            |        .catch((error) => {
            |            console.error(error)
            |            $('#email-error').text(JSON.stringify(error, null, 2))
            |        })
            |    })
            |
            |    // -- Admin configuration
            |
            |    function getAdminConf() {
            |        return {
            |            login: $('#admin-login').val(),
            |            email: $('#admin-email').val(),
            |            password: $('#admin-password').val()
            |        }
            |    }
            |
            |    function setAdminConf(conf) {
            |        $('#admin-login').val(conf.login)
            |        $('#admin-email').val(conf.email)
            |        $('#admin-password').val(conf.password)
            |    }
            |
            |    $('#admin-configure').click(() => {
            |        updatedConfig(adminConfigHandler, getAdminConf())
            |        .then((conf) => {
            |            console.log(conf)
            |            $('#admin-error').text(JSON.stringify(conf, null, 2))
            |        })
            |        .catch((error) => {
            |            console.error(error)
            |            $('#admin-error').text(JSON.stringify(error, null, 2))
            |        })
            |    })
            |
            |    // Final validation
            |
            |    $('#validate').click(() => {
            |        fetch(
            |            '/api/configuration/validate',
            |            { method: 'POST' }
            |        )
            |        .then((response) => alert("Ok"))
            |        .catch((error) => console.error(error))
            |    })
            |
            |    const reload = $('#reload')
            |
            |    reload.click(() => {
            |        reload.attr('disabled', 'disabled')
            |        reload.attr('value', 'Server reloading...')
            |
            |        fetch('/api/admin/management/reload', {
            |            method: 'GET'
            |        }).then((response) => {
            |            setTimeout(() => {
            |            location.reload();
            |            }, 8000)
            |        })
            |    })
            |
            |})
          """.stripMargin
        ))
      )

  override protected lazy val pageContent: Seq[Text.all.Tag] =
    Seq(
      h1("Installation page \uD83D\uDEE0"),
      div(
        h1("Database configuration"),
        label(`for` := "database-hostname", "Hostname (or ip) of the database"),
        input(`type` := "text", name := "database-hostname", id := "database-hostname"),
        br(),
        label(`for` := "database-username", "Username"),
        input(`type` := "text", name := "database-username", id := "database-username"),
        br(),
        label(`for` := "database-password", "Password"),
        input(`type` := "text", name := "database-password", id := "database-password"),
        br(),
        label(`for` := "database-database", "Database name"),
        input(`type` := "text", name := "database-database", id := "database-database"),
        br(),
        label(`for` := "database-port", "Port (5432) (optional)"),
        input(`type` := "text", name := "database-port", id := "database-port"),
        br(),
        pre(id := "database-error"),
        input(`type` := "button", value := "Load", id := "database-load"),
        input(`type` := "button", value := "Test", id := "database-test"),
        input(`type` := "button", value := "Configure", id := "database-configure")
      ),
      hr(),
      div(
        h1("Email configuration"),
        label(`for` := "email-host", "Hostname (or ip) of the SMTP server"),
        input(`type` := "text", name := "email-host", id := "email-host"),
        br(),
        label(`for` := "email-port", "SMTP Port"),
        input(`type` := "text", name := "email-port", id := "email-port"),
        br(),
        label(`for` := "email-ssl", "SSL"),
        input(`type` := "checkbox", name := "email-ssl", id := "email-ssl"),
        br(),
        label(`for` := "email-tls", "TLS"),
        input(`type` := "checkbox", name := "email-tls", id := "email-tls"),
        br(),
        label(`for` := "email-tlsRequired", "TLS required"),
        input(`type` := "checkbox", name := "email-tlsRequired", id := "email-tlsRequired"),
        br(),
        label(`for` := "email-user", "SMTP User (optional)"),
        input(`type` := "text", name := "email-user", id := "email-user"),
        br(),
        label(`for` := "email-password", "SMTP Password (optional)"),
        input(`type` := "text", name := "email-password", id := "email-password"),
        br(),
        label(`for` := "email-from", "From field for cumulus mails"),
        input(`type` := "text", name := "email-from", id := "email-from"),
        br(),
        pre(id := "email-error"),
        input(`type` := "button", value := "Load", id := "email-load"),
        input(`type` := "button", value := "Test", id := "email-test"),
        input(`type` := "button", value := "Configure", id := "email-configure")
      ),
      hr(),
      div(
        h1("Admin creation"),
        label(`for` := "admin-login", "Login"),
        input(`type` := "text", name := "admin-login", id := "admin-login"),
        br(),
        label(`for` := "admin-email", "Email"),
        input(`type` := "text", name := "admin-email", id := "admin-email"),
        br(),
        label(`for` := "admin-password", "Password"),
        input(`type` := "text", name := "admin-password", id := "admin-password"),
        br(),
        pre(id := "admin-error"),
        input(`type` := "button", value := "Configure", id := "admin-configure")
      ),
      hr(),
      div(
        h1("Finish the installation") ,
        input(`type` := "button", value := "Validate", id := "validate")
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
      )
    )

}
