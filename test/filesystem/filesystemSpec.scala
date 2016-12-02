package filesystem

import org.scalatest.BeforeAndAfterAll
import org.scalatestplus.play.{OneAppPerSuite, PlaySpec}

import play.api.db.Database
import play.api.db.evolutions._
import play.api.inject.guice.GuiceApplicationBuilder

import repositories.AccountRepository
import repositories.filesystem.DirectoryRepository
import models.{Account, Directory}
import utils.EitherUtils._

class filesystemSpec extends PlaySpec with OneAppPerSuite with BeforeAndAfterAll {
  implicit override lazy val app = new GuiceApplicationBuilder()
    .configure(Map(
      "db.default.url" -> "jdbc:postgresql://localhost/cumulus"
    ))
    .build()

  override def beforeAll {
    val database = app.injector.instanceOf[Database]
    Evolutions.cleanupEvolutions(database)
    Evolutions.applyEvolutions(database)
  }

  def testDirectory(path: String, test: Directory => Unit = (dir) => {})(implicit account: Account, directoryRepo: DirectoryRepository): Unit = {
    directoryRepo.getByPath(path) match {
      case Right(Some(dir)) =>
        assert(dir.node.location.toString == path)
        assert(dir.node.isDirectory)
        test(dir)
      case Right(None) => fail(s"fetch failed (fetching of $path return no directory)")
      case Left(e) => fail(s"fetch failed (fetching of $path failed)")
    }
  }

  "File system" should {
    "create multiple directories and subdirectories" in {
      implicit val accountRepo = app.injector.instanceOf[AccountRepository]
      implicit val directoryRepo = app.injector.instanceOf[DirectoryRepository]

      // Admin user should get created with the database
      implicit val admin = accountRepo.getByLogin("admin").get

      //
      // Create the following directory structure (root is already created) :
      //
      //    "/"
      //   /   \
      // "b"   "a"
      //       /  \
      //     "a1" "b1"
      //     /  \   \
      //   "a2" "b2" "a3"
      val a = Directory.initFrom("/a", admin)
      val b = Directory.initFrom("/b", admin)
      val a1 = Directory.initFrom("/a/a1", admin)
      val b1 = Directory.initFrom("/a/b1", admin)
      val a2 = Directory.initFrom("/a/a1/a2", admin)
      val b2 = Directory.initFrom("/a/a1/b2", admin)
      val a3 = Directory.initFrom("/a/b1/a3", admin)

      // Insert everything...
      (for {
        r <- directoryRepo.insert(a)(admin)
        r <- directoryRepo.insert(b)(admin)
        r <- directoryRepo.insert(a1)(admin)
        r <- directoryRepo.insert(b1)(admin)
        r <- directoryRepo.insert(a2)(admin)
        r <- directoryRepo.insert(b2)(admin)
        r <- directoryRepo.insert(a3)(admin)
      } yield r) match {
        case Right(_) =>
          testDirectory("/", { dir =>
            assert(dir.node.isRoot)
          })
          testDirectory("/a/a1", { dir =>
            assert(dir.content.length == 2)
          })
          testDirectory("/a/a1/a2")
          testDirectory("/a/a1/b2")
        case Left(e) => fail("Insert failed")
      }
    }

    "move directories and subdirectories" in {
      implicit val accountRepo = app.injector.instanceOf[AccountRepository]
      implicit val directoryRepo = app.injector.instanceOf[DirectoryRepository]

      implicit val admin = accountRepo.getByLogin("admin").get

      //
      // Move a1 to b, resulting in the following directory structure :
      //
      //        "/"
      //       /   \
      //     "b"   "a"
      //     /        \
      //   "a1"       "b1"
      //   /  \         \
      // "a2" "b2"      "a3"
      testDirectory("/a/a1", { dir =>
        directoryRepo.move(dir, "/b/a1") match {
          case Right(_) =>
            testDirectory("/b/a1")
            testDirectory("/b/a1/a2")
            testDirectory("/b/a1/b2")
            testDirectory("/a/b1/a3")
          case _ => fail("move failed")
        }
      })

    }

    "delete directories and subdirectories" in {
      implicit val accountRepo = app.injector.instanceOf[AccountRepository]
      implicit val directoryRepo = app.injector.instanceOf[DirectoryRepository]

      implicit val admin = accountRepo.getByLogin("admin").get

      //
      // Delete b, resulting in the following directory structure :
      //
      //        "/"
      //           \
      //           "a"
      //              \
      //              "b1"
      //                 \
      //                "a3"
      testDirectory("/b", { dir =>
        directoryRepo.delete(dir) match {
          case Right(_) =>
            testDirectory("/a/b1")
            testDirectory("/a/b1/a3")

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

          case _ => fail("delete failed")
        }
      })
    }
  }
}
