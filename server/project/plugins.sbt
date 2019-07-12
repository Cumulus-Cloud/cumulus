// The Typesafe repository
resolvers += "Typesafe repository" at "https://repo.typesafe.com/typesafe/maven-releases/"

// Use the Play sbt plugin for Play projects
addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.7.1")

// Used to show dependency graphs between packages
addSbtPlugin("net.virtual-void" % "sbt-dependency-graph" % "0.9.2")

// Used to package the application
addSbtPlugin("com.typesafe.sbt" % "sbt-native-packager" % "1.3.25")

// Linter
addSbtPlugin("org.wartremover" % "sbt-wartremover" % "2.4.2")
