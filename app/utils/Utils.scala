package utils

import models.Directory

object Utils {

  def prettyPrint(dir: Directory) = {
    print(prettyPrintInternal(dir, 0))
  }

  private def prettyPrintInternal(dir: Directory, level: Int): String = {

    val dec = (0 until level).map(_ => "    ").mkString

    s"""${dec}${dir.node.nodeType} {
$dec  name         : ${dir.node.name}
$dec  location     : ${dir.node.location}
$dec  modification : ${dir.node.modification.toString}
$dec  creation     : ${dir.node.creation.toString}
$dec  owner        : ${dir.node.creator.login}
$dec  content      : [
${/*dir.content.map(prettyPrintInternal(_, level + 1)).mkString*/}
$dec    ]
${dec}}
"""
  }

}
