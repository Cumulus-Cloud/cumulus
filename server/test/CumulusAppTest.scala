import org.scalatestplus.play.FakeApplicationFactory
import play.api._
import play.api.inject.DefaultApplicationLifecycle
import play.core.DefaultWebCommands

trait CumulusAppTest extends FakeApplicationFactory {

  protected var cumulusComponents: CumulusComponents = _

  override def fakeApplication: Application = {
    val env = Environment.simple()
    val configuration = Configuration.load(env)
    val context = ApplicationLoader.Context(
      environment = env,
      sourceMapper = None,
      webCommands = new DefaultWebCommands(),
      initialConfiguration = configuration,
      lifecycle = new DefaultApplicationLifecycle()
    )
    cumulusComponents = new CumulusComponents(context)
    cumulusComponents.application
  }

}

