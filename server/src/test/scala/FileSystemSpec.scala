import cats.data.EitherT
import io.cumulus.models.User
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{BeforeAndAfterAll, MustMatchers}
import org.scalatestplus.play.{BaseOneAppPerSuite, PlaySpec}
import play.api.db.evolutions.Evolutions
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.language.postfixOps

import cats.instances.future._
import io.cumulus.core.persistence.query.QueryPagination
import io.cumulus.models.fs.{Directory, File}
import io.cumulus.persistence.storage.StorageReference
import org.scalatest.concurrent.PatienceConfiguration.Timeout
import org.scalatest.time.Span._

class FileSystemSpec extends PlaySpec
  with BeforeAndAfterAll
  with ScalaFutures
  with MustMatchers
  with CumulusAppTest
  with BaseOneAppPerSuite {

  override def beforeAll {
    val database = cumulusComponents.database
    Evolutions.cleanupEvolutions(database)
    Evolutions.applyEvolutions(database)
  }

  // TODO use the test DB
  /*
  implicit override lazy val app = new GuiceApplicationBuilder()
    .configure(Map(
      "db.default.url" -> "jdbc:postgresql://postgres-test/cumulus"
    ))
    .build()
  */

  val defaultPatience = Timeout(10 second)

  implicit val user = User("test@test.tld", "test", "test")

  "File system" should {

    "create an user and its root directory" in {

      implicit val fsNodeService = cumulusComponents.fsNodeService
      implicit val userService   = cumulusComponents.userService

      val r = for {
        _           <- EitherT(userService.createUser(user))
        createdUser <- EitherT(userService.findByLogin("test"))
        root        <- EitherT(fsNodeService.findDirectory("/", QueryPagination(99))(user))
      } yield (createdUser, root)

      whenReady(r.value, defaultPatience) {
        case Right((createdUser, directory)) =>
          createdUser.login mustBe "test"
          directory.path.toString mustBe "/"
          directory.owner mustBe createdUser.id
        case Left(e) =>
          fail(s"User could not be created: $e")
      }
    }

    "create multiple directories, subdirectories and files" in {

      implicit val fsNodeService = cumulusComponents.fsNodeService

      //
      // Create the following directory structure (root is already created) :
      //
      //    "/"
      //   /   \
      // "b"   "a"_____________
      //       /         \     \
      //     "a1"_____  "b1"  "f1"
      //     /  \     \    \
      //   "a2" "b2" "f2"   "a3"
      val a  = Directory.create(user.id, "/a")
      val f1 = File.create(user.id, "/a/f1", "application/octet-stream", StorageReference())
      val b  = Directory.create(user.id, "/b")
      val a1 = Directory.create(user.id, "/a/a1")
      val b1 = Directory.create(user.id, "/a/b1")
      val f2 = File.create(user.id, "/a/a1/f2")
      val a2 = Directory(user.id, "/a/a1/a2")
      val b2 = Directory(user.id, "/a/a1/b2")
      val a3 = Directory(user.id, "/a/b1/a3")

      (for {
        _ <- EitherT(fsNodeService.createDirectory(a))
        _ <- EitherT(fsNodeService.createFile(f1))
        _ <- EitherT(fsNodeService.createDirectory(b))
        _ <- EitherT(fsNodeService.createDirectory(a1))
        _ <- EitherT(fsNodeService.createDirectory(b1))
        _ <- EitherT(fsNodeService.createFile(f2))
        _ <- EitherT(fsNodeService.createDirectory(a2))
        _ <- EitherT(fsNodeService.createDirectory(b2))
        _ <- EitherT(fsNodeService.createDirectory(a3))
      } yield ())

    }

    /*
    "create multiple directories, subdirectories and files" in {

      implicit val fsNodeService = cumulusComponents.fsNodeService

      //
      // Create the following directory structure (root is already created) :
      //
      //    "/"
      //   /   \
      // "b"   "a"_____________
      //       /         \     \
      //     "a1"_____  "b1"  "f1"
      //     /  \     \    \
      //   "a2" "b2" "f2"   "a3"
      val a  = Directory(user.id, "/a")
      val f1 = File(user.id, "/a/f1")
      val b  = Directory(user.id, "/b")
      val a1 = Directory(user.id, "/a/a1")
      val b1 = Directory(user.id, "/a/b1")
      val f2 = File(user.id, "/a/a1/f2")
      val a2 = Directory(user.id, "/a/a1/a2")
      val b2 = Directory(user.id, "/a/a1/b2")
      val a3 = Directory(user.id, "/a/b1/a3")

      (for {
        _ <- EitherT(fsNodeService.createDirectory(a))
        _ <- EitherT(fsNodeService.createFile(f1))
        _ <- EitherT(fsNodeService.createDirectory(b))
        _ <- EitherT(fsNodeService.createDirectory(a1))
        _ <- EitherT(fsNodeService.createDirectory(b1))
        _ <- EitherT(fsNodeService.createFile(f2))
        _ <- EitherT(fsNodeService.createDirectory(a2))
        _ <- EitherT(fsNodeService.createDirectory(b2))
        _ <- EitherT(fsNodeService.createDirectory(a3))
      } yield ()).map { _ =>


        ()
      }

      // Insert everything...
      (for {
        r <- directoryRepo.insert(a)(admin)
        r <- fileRepo.insert(f1)(admin)
        r <- directoryRepo.insert(b)(admin)
        r <- directoryRepo.insert(a1)(admin)
        r <- directoryRepo.insert(b1)(admin)
        r <- fileRepo.insert(f2)(admin)
        r <- directoryRepo.insert(a2)(admin)
        r <- directoryRepo.insert(b2)(admin)
        r <- directoryRepo.insert(a3)(admin)
      } yield r) match {
        case Right(_) =>
          testDirectory("/", { dir =>
            assert(dir.node.isRoot)
          })
          testFile("/a/f1")
          testDirectory("/a/a1", { dir =>
            assert(dir.content.length == 3)
          })
          testFile("/a/a1/f2")
          testDirectory("/a/a1/a2")
          testDirectory("/a/a1/b2")
        case Left(e) => fail("Insert failed")
      }

      // Should fail
      directoryRepo.getByPath("/a/f1") match {
        case Left(error) => assert(error.field == "type")
        case _ => assert(false)
      }

      // Should fail too
      fileRepo.getByPath("/a/a1") match {
        case Left(error) => assert(error.field == "type")
        case _ => assert(false)
      }
    }
    */

  }

}

  /*
  override def beforeAll {
    val database = app.injector.instanceOf[Database]
    Evolutions.cleanupEvolutions(database)
    Evolutions.applyEvolutions(database)
  }

  def testDirectory(path: String, test: Directory => Unit = (dir) => {})(implicit user: User, fsNodeService: FsNodeService): Unit = {
    directoryRepo.getByPath(path) match {
      case Right(Some(dir)) =>
        assert(dir.node.location.toString == path)
        assert(dir.node.isDirectory)
        test(dir)
      case Right(None) => fail(s"fetch failed (fetching of $path return no directory)")
      case Left(e) => fail(s"fetch failed (fetching of $path failed)")
    }
  }

  def testFile(path: String, test: File => Unit = (dir) => {})(implicit account: Account, fileRepo: FileRepository): Unit = {
    fileRepo.getByPath(path) match {
      case Right(Some(dir)) =>
        assert(dir.node.location.toString == path)
        assert(dir.node.isFile)
        test(dir)
      case Right(None) => fail(s"fetch failed (fetching of $path return no file)")
      case Left(e) => fail(s"fetch failed (fetching of $path failed)")
    }
  }

  "File system" should {

    "create multiple directories, subdirectories and files" in {



      // Admin user should get created with the database
      implicit val admin = accountRepo.getByLogin("admin").get

      //
      // Create the following directory structure (root is already created) :
      //
      //    "/"
      //   /   \
      // "b"   "a"_____________
      //       /         \     \
      //     "a1"_____  "b1"  "f1"
      //     /  \     \    \
      //   "a2" "b2" "f2"   "a3"
      val a = Directory.initFrom("/a", admin)
      val f1 = File.initFrom("/a/f1", admin)
      val b = Directory.initFrom("/b", admin)
      val a1 = Directory.initFrom("/a/a1", admin)
      val b1 = Directory.initFrom("/a/b1", admin)
      val f2 = File.initFrom("/a/a1/f2", admin)
      val a2 = Directory.initFrom("/a/a1/a2", admin)
      val b2 = Directory.initFrom("/a/a1/b2", admin)
      val a3 = Directory.initFrom("/a/b1/a3", admin)

      // Insert everything...
      (for {
        r <- directoryRepo.insert(a)(admin)
        r <- fileRepo.insert(f1)(admin)
        r <- directoryRepo.insert(b)(admin)
        r <- directoryRepo.insert(a1)(admin)
        r <- directoryRepo.insert(b1)(admin)
        r <- fileRepo.insert(f2)(admin)
        r <- directoryRepo.insert(a2)(admin)
        r <- directoryRepo.insert(b2)(admin)
        r <- directoryRepo.insert(a3)(admin)
      } yield r) match {
        case Right(_) =>
          testDirectory("/", { dir =>
            assert(dir.node.isRoot)
          })
          testFile("/a/f1")
          testDirectory("/a/a1", { dir =>
            assert(dir.content.length == 3)
          })
          testFile("/a/a1/f2")
          testDirectory("/a/a1/a2")
          testDirectory("/a/a1/b2")
        case Left(e) => fail("Insert failed")
      }

      // Should fail
      directoryRepo.getByPath("/a/f1") match {
        case Left(error) => assert(error.field == "type")
        case _ => assert(false)
      }

      // Should fail too
      fileRepo.getByPath("/a/a1") match {
        case Left(error) => assert(error.field == "type")
        case _ => assert(false)
      }
    }

    "move directories and subdirectories" in {
      implicit val accountRepo = app.injector.instanceOf[AccountRepository]
      implicit val directoryRepo = app.injector.instanceOf[DirectoryRepository]
      implicit val fileRepo = app.injector.instanceOf[FileRepository]

      implicit val admin = accountRepo.getByLogin("admin").get

      //
      // Move a1 to b, resulting in the following directory structure :
      //
      //        "/"
      //       /   \
      //     "b"   "a"___________
      //     /             \     \
      //   "a1"_____       "b1"  "f1"
      //   /  \     \        \
      // "a2" "b2"  "f2"     "a3"
      testDirectory("/a/a1", { dir =>
        directoryRepo.move(dir, "/b/a1") match {
          case Right(_) =>
            testDirectory("/b/a1")
            testDirectory("/b/a1/a2")
            testDirectory("/b/a1/b2")
            testDirectory("/a/b1/a3")
            testFile("/b/a1/f2")
            testFile("/a/f1")
          case _ => fail("move failed")
        }
      })

    }

    "delete directories and subdirectories" in {
      implicit val accountRepo = app.injector.instanceOf[AccountRepository]
      implicit val directoryRepo = app.injector.instanceOf[DirectoryRepository]
      implicit val fileRepo = app.injector.instanceOf[FileRepository]

      implicit val admin = accountRepo.getByLogin("admin").get

      //
      // Delete b, resulting in the following directory structure :
      //
      //        "/"
      //           \
      //           "a"______
      //              \     \
      //              "b1" "f1"
      //                 \
      //                "a3"
      testDirectory("/b", { dir =>
        directoryRepo.delete(dir) match {
          case Right(_) =>
            testDirectory("/a/b1")
            testDirectory("/a/b1/a3")
            testFile("/a/f1")

            directoryRepo.getByPath("/b/a1/a2") match {
              case Right(Some(_)) => fail("delete failed")
              case Right(None) =>
              case Left(e) => fail("delete failed")
            }

            directoryRepo.getByPath("/b/a1") match {
              case Right(Some(_)) => fail("delete failed")
              case Right(None) =>
              case Left(e) => fail("delete failed")
            }

            directoryRepo.getByPath("/b") match {
              case Right(Some(_)) => fail("delete failed")
              case Right(None) =>
              case Left(e) => fail("delete failed")
            }

            fileRepo.getByPath("/b/a1/f2") match {
              case Right(Some(_)) => fail("delete failed")
              case Right(None) =>
              case Left(e) => fail("delete failed")
            }

          case _ => fail("delete failed")
        }
      })
    }
  }
}
*/