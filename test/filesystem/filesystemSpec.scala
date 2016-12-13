package filesystem

import org.scalatest.BeforeAndAfterAll
import org.scalatestplus.play.{OneAppPerSuite, PlaySpec}
import play.api.db.Database
import play.api.db.evolutions._
import play.api.inject.guice.GuiceApplicationBuilder
import repositories.AccountRepository
import repositories.filesystem.{DirectoryRepository, FileRepository}
import models.{Account, Directory, File}
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
      implicit val accountRepo = app.injector.instanceOf[AccountRepository]
      implicit val directoryRepo = app.injector.instanceOf[DirectoryRepository]
      implicit val fileRepo = app.injector.instanceOf[FileRepository]

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
