// The Typesafe repository
resolvers += "Typesafe repository" at "https://repo.typesafe.com/typesafe/maven-releases/"


// Use the Play sbt plugin for Play projects
addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.6.13")

// Used to show dependency graphs between packages
addSbtPlugin("net.virtual-void" % "sbt-dependency-graph" % "0.9.0")

// Used to package the application
addSbtPlugin("com.typesafe.sbt" % "sbt-native-packager" % "1.3.4")
