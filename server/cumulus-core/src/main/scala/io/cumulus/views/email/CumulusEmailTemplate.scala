package io.cumulus.views.email

import io.cumulus.core.Settings
import io.cumulus.views.View
import scalatags.Text.all._

trait CumulusEmailTemplate extends View {

  override lazy val content: Frag =
    raw(rawContent)

  protected def settings: Settings

  protected val mailTitle: String =
    "Cumulus" // TODO internationalization ?

  protected def mailContentTitle: String

  protected def mailContent: Seq[Tag]

  protected val mailFooter: Tag = {
    span(
      s"""
         This email was sent from ${settings.mail.from}. Cumulus is a free
         self-hosted solution for file sharing and storage. Feel free to
         contribute to the project on our Github.
       """ // TODO internationalization
    )
  }

  /**
    * Mail are an horrible format which can't really be used with scalatags, so the mail is instead
    * used as a large string..
    */
  protected lazy val rawContent: String =
    s"""
      |<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN"
      |    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      |<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"
      |      xmlns="http://www.w3.org/1999/xhtml">
      |<head>
      |  <!--[if gte mso 9]>
      |  <xml>
      |    <o:OfficeDocumentSettings>
      |      <o:AllowPNG/>
      |      <o:PixelsPerInch>96</o:PixelsPerInch>
      |    </o:OfficeDocumentSettings>
      |  </xml>
      |  <![endif]-->
      |
      |  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      |  <meta name="viewport" content="width=device-width">
      |  <!--[if !mso]><!-->
      |  <meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
      |  <title></title>
      |  <!--[if !mso]><!-- -->
      |  <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet" type="text/css">
      |  <link href="https://fonts.googleapis.com/css?family=Droid+Serif" rel="stylesheet" type="text/css">
      |  <link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet" type="text/css">
      |  <!--<![endif]-->
      |
      |  <style type="text/css" id="media-query">
      |    body {
      |      margin: 0;
      |      padding: 0;
      |    }
      |
      |    table, tr, td {
      |      vertical-align: top;
      |      border-collapse: collapse;
      |    }
      |
      |    .ie-browser table, .mso-container table {
      |      table-layout: fixed;
      |    }
      |
      |    * {
      |      line-height: inherit;
      |    }
      |
      |    a[x-apple-data-detectors=true] {
      |      color: inherit !important;
      |      text-decoration: none !important;
      |    }
      |
      |    [owa] .img-container div, [owa] .img-container button {
      |      display: block !important;
      |    }
      |
      |    [owa] .fullwidth button {
      |      width: 100% !important;
      |    }
      |
      |    [owa] .block-grid .col {
      |      display: table-cell;
      |      float: none !important;
      |      vertical-align: top;
      |    }
      |
      |    .ie-browser .num12, .ie-browser .block-grid, [owa] .num12, [owa] .block-grid {
      |      width: 640px !important;
      |    }
      |
      |    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {
      |      line-height: 100%;
      |    }
      |
      |    .ie-browser .mixed-two-up .num4, [owa] .mixed-two-up .num4 {
      |      width: 212px !important;
      |    }
      |
      |    .ie-browser .mixed-two-up .num8, [owa] .mixed-two-up .num8 {
      |      width: 424px !important;
      |    }
      |
      |    .ie-browser .block-grid.two-up .col, [owa] .block-grid.two-up .col {
      |      width: 320px !important;
      |    }
      |
      |    .ie-browser .block-grid.three-up .col, [owa] .block-grid.three-up .col {
      |      width: 213px !important;
      |    }
      |
      |    .ie-browser .block-grid.four-up .col, [owa] .block-grid.four-up .col {
      |      width: 160px !important;
      |    }
      |
      |    .ie-browser .block-grid.five-up .col, [owa] .block-grid.five-up .col {
      |      width: 128px !important;
      |    }
      |
      |    .ie-browser .block-grid.six-up .col, [owa] .block-grid.six-up .col {
      |      width: 106px !important;
      |    }
      |
      |    .ie-browser .block-grid.seven-up .col, [owa] .block-grid.seven-up .col {
      |      width: 91px !important;
      |    }
      |
      |    .ie-browser .block-grid.eight-up .col, [owa] .block-grid.eight-up .col {
      |      width: 80px !important;
      |    }
      |
      |    .ie-browser .block-grid.nine-up .col, [owa] .block-grid.nine-up .col {
      |      width: 71px !important;
      |    }
      |
      |    .ie-browser .block-grid.ten-up .col, [owa] .block-grid.ten-up .col {
      |      width: 64px !important;
      |    }
      |
      |    .ie-browser .block-grid.eleven-up .col, [owa] .block-grid.eleven-up .col {
      |      width: 58px !important;
      |    }
      |
      |    .ie-browser .block-grid.twelve-up .col, [owa] .block-grid.twelve-up .col {
      |      width: 53px !important;
      |    }
      |
      |    @media only screen and (min-width: 660px) {
      |      .block-grid {
      |        width: 640px !important;
      |      }
      |
      |      .block-grid .col {
      |        vertical-align: top;
      |      }
      |
      |      .block-grid .col.num12 {
      |        width: 640px !important;
      |      }
      |
      |      .block-grid.mixed-two-up .col.num4 {
      |        width: 212px !important;
      |      }
      |
      |      .block-grid.mixed-two-up .col.num8 {
      |        width: 424px !important;
      |      }
      |
      |      .block-grid.two-up .col {
      |        width: 320px !important;
      |      }
      |
      |      .block-grid.three-up .col {
      |        width: 213px !important;
      |      }
      |
      |      .block-grid.four-up .col {
      |        width: 160px !important;
      |      }
      |
      |      .block-grid.five-up .col {
      |        width: 128px !important;
      |      }
      |
      |      .block-grid.six-up .col {
      |        width: 106px !important;
      |      }
      |
      |      .block-grid.seven-up .col {
      |        width: 91px !important;
      |      }
      |
      |      .block-grid.eight-up .col {
      |        width: 80px !important;
      |      }
      |
      |      .block-grid.nine-up .col {
      |        width: 71px !important;
      |      }
      |
      |      .block-grid.ten-up .col {
      |        width: 64px !important;
      |      }
      |
      |      .block-grid.eleven-up .col {
      |        width: 58px !important;
      |      }
      |
      |      .block-grid.twelve-up .col {
      |        width: 53px !important;
      |      }
      |    }
      |
      |    @media (max-width: 660px) {
      |      .block-grid, .col {
      |        min-width: 320px !important;
      |        max-width: 100% !important;
      |        display: block !important;
      |      }
      |
      |      .block-grid {
      |        width: calc(100% - 40px) !important;
      |      }
      |
      |      .col {
      |        width: 100% !important;
      |      }
      |
      |      .col > div {
      |        margin: 0 auto;
      |      }
      |
      |      img.fullwidth, img.fullwidthOnMobile {
      |        max-width: 100% !important;
      |      }
      |
      |      .no-stack .col {
      |        min-width: 0 !important;
      |        display: table-cell !important;
      |      }
      |
      |      .no-stack.two-up .col {
      |        width: 50% !important;
      |      }
      |
      |      .no-stack.mixed-two-up .col.num4 {
      |        width: 33% !important;
      |      }
      |
      |      .no-stack.mixed-two-up .col.num8 {
      |        width: 66% !important;
      |      }
      |
      |      .no-stack.three-up .col.num4 {
      |        width: 33% !important;
      |      }
      |
      |      .no-stack.four-up .col.num3 {
      |        width: 25% !important;
      |      }
      |
      |      .mobile_hide {
      |        min-height: 0px;
      |        max-height: 0px;
      |        max-width: 0px;
      |        display: none;
      |        overflow: hidden;
      |        font-size: 0px;
      |      }
      |    }
      |
      |  </style>
      |</head>
      |
      |
      |<body class="clean-body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #F4F4F4">
      |<style type="text/css" id="media-query-bodytag">
      |  @media (max-width: 520px) {
      |    .block-grid {
      |      min-width: 320px !important;
      |      max-width: 100% !important;
      |      width: 100% !important;
      |      display: block !important;
      |    }
      |
      |    .col {
      |      min-width: 320px !important;
      |      max-width: 100% !important;
      |      width: 100% !important;
      |      display: block !important;
      |    }
      |
      |    .col > div {
      |      margin: 0 auto;
      |    }
      |
      |    img.fullwidth {
      |      max-width: 100% !important;
      |    }
      |
      |    img.fullwidthOnMobile {
      |      max-width: 100% !important;
      |    }
      |
      |    .no-stack .col {
      |      min-width: 0 !important;
      |      display: table-cell !important;
      |    }
      |
      |    .no-stack.two-up .col {
      |      width: 50% !important;
      |    }
      |
      |    .no-stack.mixed-two-up .col.num4 {
      |      width: 33% !important;
      |    }
      |
      |    .no-stack.mixed-two-up .col.num8 {
      |      width: 66% !important;
      |    }
      |
      |    .no-stack.three-up .col.num4 {
      |      width: 33% !important;
      |    }
      |
      |    .no-stack.four-up .col.num3 {
      |      width: 25% !important;
      |    }
      |
      |    .mobile_hide {
      |      min-height: 0px !important;
      |      max-height: 0px !important;
      |      max-width: 0px !important;
      |      display: none !important;
      |      overflow: hidden !important;
      |      font-size: 0px !important;
      |    }
      |  }
      |</style>
      |<!--[if IE]>
      |<div class="ie-browser"><![endif]-->
      |<!--[if mso]>
      |<div class="mso-container"><![endif]-->
      |<table class="nl-container"
      |       style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #F4F4F4;width: 100%"
      |       cellpadding="0" cellspacing="0">
      |  <tbody>
      |  <tr style="vertical-align: top">
      |    <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
      |      <!--[if (mso)|(IE)]>
      |      <table width="100%" cellpadding="0" cellspacing="0" border="0">
      |        <tr>
      |          <td align="center" style="background-color: #F4F4F4;"><![endif]-->
      |
      |      <div style="background-color:transparent;">
      |        <div style="Margin: 0 auto;min-width: 320px;max-width: 640px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f2fbfa;" class="block-grid ">
      |          <div style="border-collapse: collapse;display: table;width: 100%;background-color:#f2fbfa;">
      |            <!--[if (mso)|(IE)]>
      |            <table width="100%" cellpadding="0" cellspacing="0" border="0">
      |              <tr>
      |                <td style="background-color:transparent;" align="center">
      |                  <table cellpadding="0" cellspacing="0" border="0" style="width: 640px;">
      |                    <tr class="layout-full-width" style="background-color:#f2fbfa;">
      |            <![endif]-->
      |
      |            <!--[if (mso)|(IE)]>
      |            <td align="center" width="640" style=" width:640px; padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top">
      |            <![endif]-->
      |            <div class="col num12" style="min-width: 320px;max-width: 640px;display: table-cell;vertical-align: top;">
      |              <div style="background-color: transparent; width: 100% !important;">
      |                <!--[if (!mso)&(!IE)]><!-->
      |                <div
      |                    style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
      |                  <!--<![endif]-->
      |
      |
      |                  <div class="">
      |                    <!--[if mso]>
      |                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      |                      <tr>
      |                        <td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px;">
      |                    <![endif]-->
      |                    <div style="color:#3dc7be;line-height:120%;font-family:'Lato', Tahoma, Verdana, Segoe, sans-serif; padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px;">
      |                      <div style="font-size:12px;line-height:14px;font-family:Lato, Tahoma, Verdana, Segoe, sans-serif;color:#3dc7be;text-align:left;">
      |                        <p style="margin: 0;font-size: 14px;line-height: 17px">
      |                          <img border="0" src="${settings.host.url}/assets/cumulus-logo.png" alt="Logo" title="Logo" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline; border: 0; height: 25px; float: none; width: auto; padding-right: 7px;" height="25">
      |                          <span style="font-size: 20px; line-height: 24px;">$mailTitle</span>
      |                        </p>
      |                      </div>
      |                    </div>
      |                    <!--[if mso]></td></tr></table><![endif]-->
      |                  </div>
      |
      |                  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
      |              </div>
      |            </div>
      |            <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
      |          </div>
      |        </div>
      |      </div>
      |      <div style="background-color:transparent;">
      |        <div style="Margin: 0 auto;min-width: 320px;max-width: 640px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #FFFFFF;" class="block-grid ">
      |          <div style="border-collapse: collapse;display: table;width: 100%;background-color:#FFFFFF;">
      |            <!--[if (mso)|(IE)]>
      |            <table width="100%" cellpadding="0" cellspacing="0" border="0">
      |              <tr>
      |                <td style="background-color:transparent;" align="center">
      |                  <table cellpadding="0" cellspacing="0" border="0" style="width: 640px;">
      |                    <tr class="layout-full-width" style="background-color:#FFFFFF;"><![endif]-->
      |
      |            <!--[if (mso)|(IE)]>
      |            <td align="center" width="640"
      |                style=" width:640px; padding-right: 0px; padding-left: 0px; padding-top:0px; padding-bottom:0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;"
      |                valign="top"><![endif]-->
      |            <div class="col num12"
      |                 style="min-width: 320px;max-width: 640px;display: table-cell;vertical-align: top;">
      |              <div style="background-color: transparent; width: 100% !important;">
      |                <!--[if (!mso)&(!IE)]><!-->
      |                <div
      |                    style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:0px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;">
      |                  <!--<![endif]-->
      |
      |
      |                  <div align="center" class="img-container center  autowidth  fullwidth " style="padding-right: 0px;  padding-left: 0px;">
      |                    <!--[if mso]>
      |                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      |                      <tr style="line-height:0px;line-height:0px;">
      |                        <td style="padding-right: 0px; padding-left: 0px;" align="center">
      |                    <![endif]-->
      |                    <img class="center  autowidth  fullwidth" align="center" border="0"
      |                         src="${settings.host.url}/assets/mail.jpg" alt="Image" title="Image"
      |                         style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: 0;height: auto;float: none;width: 100%;max-width: 640px"
      |                         width="640">
      |                    <!--[if mso]></td></tr></table><![endif]-->
      |                  </div>
      |
      |
      |                  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="divider " style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 100%;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
      |                    <tbody>
      |                    <tr style="vertical-align: top">
      |                      <td class="divider_inner" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;padding-right: 10px;padding-left: 10px;padding-top: 10px;padding-bottom: 10px;min-width: 100%;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
      |                        <table class="divider_content" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 0px solid transparent;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
      |                          <tbody>
      |                          <tr style="vertical-align: top">
      |                            <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
      |                              <span></span>
      |                            </td>
      |                          </tr>
      |                          </tbody>
      |                        </table>
      |                      </td>
      |                    </tr>
      |                    </tbody>
      |                  </table>
      |
      |
      |                  <div class="">
      |                    <!--[if mso]>
      |                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      |                      <tr>
      |                        <td style="padding-right: 10px; padding-left: 10px; padding-top: 30px; padding-bottom: 20px;">
      |                    <![endif]-->
      |                    <div style="line-height:120%;color:#6f6f6f;font-family:'Lato', Tahoma, Verdana, Segoe, sans-serif; padding-right: 10px; padding-left: 10px; padding-top: 30px; padding-bottom: 20px;">
      |                      <div style="font-size:12px;line-height:14px;font-family:Lato, Tahoma, Verdana, Segoe, sans-serif;color:#6f6f6f;text-align:left;">
      |                        <p style="margin: 0;font-size: 14px;line-height: 17px;text-align: center">
      |                          <strong><span style="font-size: 48px; line-height: 57px;">$mailContentTitle</span></strong>
      |                        </p></div>
      |                    </div>
      |                    <!--[if mso]></td></tr></table><![endif]-->
      |                  </div>
      |
      |
      |                  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="divider " style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 100%;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
      |                    <tbody>
      |                    <tr style="vertical-align: top">
      |                      <td class="divider_inner" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;padding-right: 10px;padding-left: 10px;padding-top: 10px;padding-bottom: 10px;min-width: 100%;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
      |                        <table class="divider_content" height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #CFCFCF;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
      |                          <tbody>
      |                          <tr style="vertical-align: top">
      |                            <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
      |                              <span>&#160;</span>
      |                            </td>
      |                          </tr>
      |                          </tbody>
      |                        </table>
      |                      </td>
      |                    </tr>
      |                    </tbody>
      |                  </table>
      |
      |                  ${mailContent.map { c =>
                            s"""
                               | <div class="">
                               |   <!--[if mso]>
                               |   <table width="100%" cellpadding="0" cellspacing="0" border="0">
                               |     <tr>
                               |       <td style="padding-right: 35px; padding-left: 35px; padding-top: 20px; padding-bottom: 25px;">
                               |     <![endif]-->
                               |     <div style="line-height:180%;color:#555555;font-family:'Lato', Tahoma, Verdana, Segoe, sans-serif; padding-right: 35px; padding-left: 35px; padding-top: 20px; padding-bottom: 25px;">
                               |       <div style="font-size:12px;line-height:22px;font-family:Lato, Tahoma, Verdana, Segoe, sans-serif;color:#555555;text-align:left;">
                               |         <p style="margin: 0;font-size: 14px;line-height: 25px;text-align: justify">
                               |           <span style="font-size: 18px; line-height: 32px;">
                               |             ${c.render}
                               |           </span>
                               |         </p>
                               |     </div>
                               |   </div>
                               |   <!--[if mso]></td></tr></table><![endif]-->
                               | </div>
                             """.stripMargin
                          }.mkString("", " ", "")}
      |
      |                  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
      |              </div>
      |            </div>
      |            <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
      |          </div>
      |        </div>
      |      </div>
      |      <div style="background-color:transparent;">
      |        <div style="Margin: 0 auto;min-width: 320px;max-width: 640px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #FFFFFF; class="block-grid ">
      |          <div style="border-collapse: collapse;display: table;width: 100%;background-color:#FFFFFF;">
      |            <!--[if (mso)|(IE)]>
      |            <table width="100%" cellpadding="0" cellspacing="0" border="0">
      |              <tr>
      |                <td style="background-color:transparent;" align="center">
      |                  <table cellpadding="0" cellspacing="0" border="0" style="width: 640px;">
      |                    <tr class="layout-full-width" style="background-color:#FFFFFF;"><![endif]-->
      |
      |            <!--[if (mso)|(IE)]>
      |            <td align="center" width="640" style=" width:640px; padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><![endif]-->
      |            <div class="col num12" style="min-width: 320px;max-width: 640px;display: table-cell;vertical-align: top;">
      |              <div style="background-color: transparent; width: 100% !important;">
      |                <!--[if (!mso)&(!IE)]><!-->
      |                <div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
      |                  <!--<![endif]-->
      |
      |
      |                  <div class="">
      |                    <!--[if mso]>
      |                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      |                      <tr>
      |                        <td style="padding-right: 15px; padding-left: 15px; padding-top: 20px; padding-bottom: 15px;">
      |                    <![endif]-->
      |                    <div
      |                        style="line-height:120%;color:#0D0D0D;font-family:'Droid Serif', Georgia, Times, 'Times New Roman', serif; padding-right: 15px; padding-left: 15px; padding-top: 20px; padding-bottom: 15px;">
      |                      <div style="font-size:12px;line-height:14px;font-family:'Droid Serif',Georgia,Times,'Times New Roman',serif;color:#0D0D0D;text-align:left;">
      |                        <p style="margin: 0;font-size: 14px;line-height: 17px;text-align: center">
      |                          <span style="font-size: 12px; line-height: 14px;">
      |                             ${mailFooter.render}
      |                          </span>
      |                        </p>
      |                      </div>
      |                    </div>
      |                    <!--[if mso]></td></tr></table><![endif]-->
      |                  </div>
      |
      |
      |                  <div align="center" style="padding-right: 10px; padding-left: 10px; padding-bottom: 10px;" class="">
      |                    <div style="line-height:10px;font-size:1px">&#160;</div>
      |                    <div style="display: table; max-width:77px;">
      |                      <!--[if (mso)|(IE)]>
      |                      <table width="57" cellpadding="0" cellspacing="0" border="0">
      |                        <tr>
      |                          <td style="border-collapse:collapse; padding-right: 10px; padding-left: 10px; padding-bottom: 10px;"
      |                              align="center">
      |                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:57px;">
      |                              <tr>
      |                                <td width="32" style="width:32px; padding-right: 5px;" valign="top">
      |                      <![endif]-->
      |                      <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;Margin-right: 0">
      |                        <tbody>
      |                        <tr style="vertical-align: top">
      |                          <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
      |                            <a href="https://github.com/Cumulus-Cloud/cumulus" title="Github" target="_blank">
      |                              <img src="${settings.host.url}/assets/github-logo.png" alt="Github" title="Github" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
      |                            </a>
      |                            <div style="line-height:5px;font-size:1px">&#160;</div>
      |                          </td>
      |                        </tr>
      |                        </tbody>
      |                      </table>
      |                      <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
      |                    </div>
      |                  </div>
      |
      |                  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
      |              </div>
      |            </div>
      |            <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
      |          </div>
      |        </div>
      |      </div>
      |      <div style="background-color:transparent;">
      |        <div style="Margin: 0 auto;min-width: 320px;max-width: 640px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #FFFFFF;" class="block-grid ">
      |          <div style="border-collapse: collapse;display: table;width: 100%;background-color:#FFFFFF;">
      |            <!--[if (mso)|(IE)]>
      |            <table width="100%" cellpadding="0" cellspacing="0" border="0">
      |              <tr>
      |                <td style="background-color:transparent;" align="center">
      |                  <table cellpadding="0" cellspacing="0" border="0" style="width: 640px;">
      |                    <tr class="layout-full-width" style="background-color:#FFFFFF;"><![endif]-->
      |
      |            <!--[if (mso)|(IE)]>
      |            <td align="center" width="640" style=" width:640px; padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><![endif]-->
      |            <div class="col num12" style="min-width: 320px;max-width: 640px;display: table-cell;vertical-align: top;">
      |              <div style="background-color: transparent; width: 100% !important;">
      |                <!--[if (!mso)&(!IE)]><!-->
      |                <div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:5px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;">
      |                <!--<![endif]-->
      |
      |                  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="divider " style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 100%;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
      |                    <tbody>
      |                    <tr style="vertical-align: top">
      |                      <td class="divider_inner" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;padding-right: 0px;padding-left: 0px;padding-top: 0px;padding-bottom: 0px;min-width: 100%;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
      |                        <table class="divider_content" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 10px solid #3b3b3b;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
      |                          <tbody>
      |                          <tr style="vertical-align: top">
      |                            <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
      |                              <span></span>
      |                            </td>
      |                          </tr>
      |                          </tbody>
      |                        </table>
      |                      </td>
      |                    </tr>
      |                    </tbody>
      |                  </table>
      |
      |                  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
      |              </div>
      |            </div>
      |            <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
      |          </div>
      |        </div>
      |      </div>
      |      <div style="background-color:transparent;">
      |        <div style="Margin: 0 auto;min-width: 320px;max-width: 640px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;" class="block-grid ">
      |          <div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
      |            <!--[if (mso)|(IE)]>
      |            <table width="100%" cellpadding="0" cellspacing="0" border="0">
      |              <tr>
      |                <td style="background-color:transparent;" align="center">
      |                  <table cellpadding="0" cellspacing="0" border="0" style="width: 640px;">
      |                    <tr class="layout-full-width" style="background-color:transparent;"><![endif]-->
      |
      |            <!--[if (mso)|(IE)]>
      |            <td align="center" width="640" style=" width:640px; padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><![endif]-->
      |            <div class="col num12"
      |                 style="min-width: 320px;max-width: 640px;display: table-cell;vertical-align: top;">
      |              <div style="background-color: transparent; width: 100% !important;">
      |                <!--[if (!mso)&(!IE)]><!-->
      |                <div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
      |                <!--<![endif]-->
      |
      |                  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="divider " style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 100%;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
      |                    <tbody>
      |                    <tr style="vertical-align: top">
      |                      <td class="divider_inner"
      |                          style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;padding-right: 10px;padding-left: 10px;padding-top: 10px;padding-bottom: 10px;min-width: 100%;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
      |                        <table class="divider_content" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 0px solid transparent;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
      |                          <tbody>
      |                          <tr style="vertical-align: top">
      |                            <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
      |                              <span></span>
      |                            </td>
      |                          </tr>
      |                          </tbody>
      |                        </table>
      |                      </td>
      |                    </tr>
      |                    </tbody>
      |                  </table>
      |
      |                  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
      |              </div>
      |            </div>
      |            <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
      |          </div>
      |        </div>
      |      </div>
      |      <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
      |    </td>
      |  </tr>
      |  </tbody>
      |</table>
      |<!--[if (mso)|(IE)]></div><![endif]-->
      |
      |</body>
      |</html>
    """.stripMargin

}