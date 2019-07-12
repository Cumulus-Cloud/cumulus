package io.cumulus.controllers.utils

import io.cumulus.core.controllers.utils.api2.{ErrorSupport, JsonSerializationSupport}
import io.cumulus.core.controllers.utils.bodyParser.{BodyParserJson, BodyParserStream}
import play.api.mvc.{AbstractController, ControllerComponents}


/** Common class extended by all the API controllers of the app. */
abstract class Api(cc: ControllerComponents)
  extends AbstractController(cc)
    with UserAuthenticationSupport // User authentication capabilities
    with JsonSerializationSupport  // JSON serialization
    with BodyParserJson            // JSON body parser
    with BodyParserStream          // Also handle raw body
    with ErrorSupport              // Error handling
