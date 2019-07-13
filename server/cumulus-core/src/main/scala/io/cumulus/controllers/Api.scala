package io.cumulus.controllers

import io.cumulus.controllers.bodyParsers.{BodyParserJson, BodyParserStream}
import play.api.mvc.{AbstractController, ControllerComponents}


/** Common class extended by all the API controllers of the app. */
abstract class Api(cc: ControllerComponents)
  extends AbstractController(cc)
    with UserAuthenticationSupport // User authentication capabilities
    with JsonSerializationSupport  // JSON serialization
    with BodyParserJson            // JSON body parser
    with BodyParserStream          // Also handle raw body
    with ErrorSupport              // Error handling
