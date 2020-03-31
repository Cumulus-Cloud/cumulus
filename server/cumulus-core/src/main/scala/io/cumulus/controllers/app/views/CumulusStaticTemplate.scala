package io.cumulus.controllers.app.views

import scalacss.ProdDefaults._
import scalacss.internal.mutable.StyleSheet
import scalatags.Text.all.Tag

import scala.language.postfixOps


/**
  * Base for all static pages. Static pages are not handled by react, and usually show some information with
  * limited interactions with the user.
  */
trait CumulusStaticTemplate extends CumulusTemplate {

  protected val pageStyle: StyleSheet.Standalone =
    new StyleSheet.Standalone {
      import dsl._
      import scalacss.DevDefaults._

      "body" - (
        fontFamily :=! "Lato, sans-serif",
        lineHeight.normal
      )

      "div" - (
        margin(0 px),
        padding(0 px),
        border(0 px),
        fontSize(100 %%),
        verticalAlign.baseline
      )

      "form" - (
        margin(0 px),
        padding(0 px)
      )

      "#app" - (
        display.flex,
        flexDirection.row
      )

      ".left-panel" - (
        width(240 px),
        minHeight(100 vh),
        backgroundColor :=! "var(--lightPrimary)",
        padding(24 px, 40 px)
      )

      ".title" - (
        color :=! "var(--darkPrimary)",
        fontSize(1.5 rem)
      )

       ".main-container" - (
        padding(20 px),
        display.flex,
        flex := "1"
      )

      ".main-container p" - (
         color :=! "var(--secondaryText)",
         paddingBottom(14 px)
      )

      ".main-container h1" - (
        paddingBottom(20 px),
        paddingTop(10 px),
        fontSize(1.7 em),
        color :=! "var(--secondaryText)"
      )

      ".main-container ul" - (
        minWidth(100 %%),
        width.maxContent,
        display.flex,
        flexDirection.column,
        backgroundColor :=! "var(--secondaryBg)"
      )

      ".main-container ul li" - (
        flex := "1",
        borderBottom(1 px, solid, Color("#EEE")),
        borderLeft(3 px, solid, transparent),
        color :=! "var(--primaryText)",
        padding(8 px)
      )

      ".main-container ul li:hover" - (
        borderLeftColor :=! "var(--darkPrimary)"
      )

      ".main-container ul li .sep" - (
        color :=! "var(--secondaryText)"
      )

      ".main-container ul li .highlight" - (
        color :=! "var(--darkPrimary)"
      )

      ".center" - (
        flex := "1"
      )

      ".right-panel" - (
        width(266 px),
        padding(10 px),
        paddingLeft(35 px)
      )

      ".button" - (
        padding(8 px, 25 px),
        border(1 px, solid, Color("var(--darkPrimary)")),
        borderRadius(3 px),
        background := "transparent",
        textAlign.center,
        cursor.pointer,
        color :=! "var(--darkPrimary)",
        fontSize(0.9 rem),
        marginBottom(10 px),
        width(100 %%)
      )

      ".button:hover" - (
        backgroundColor :=! "var(--lightPrimary)"
      )
    }

  override protected def pageHead: Seq[Tag] = {
    import scalatags.Text.all._

    super.pageHead :+
    tag("style")(tpe := "text/css", pageStyle.render[String])
  }

  protected def pageContent: Seq[Tag]

  protected def pageRightPanel: Seq[Tag]

  override protected lazy val pageBody: Seq[Tag] = {
    import scalatags.Text.all._

    Seq(
      div(
        id := "app",
        div(
          `class` := "left-panel",
          div(
            `class` := "title",
            pageTitle
          )
        ),
        div(
          `class` := "main-container",
          div(
            `class` := "center",
            pageContent
          ),
          div(
            `class` := "right-panel",
            pageRightPanel
          )
        )
      )
    )
  }

}
