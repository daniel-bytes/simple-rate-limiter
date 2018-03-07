import scala.collection.mutable.Map

case class RateLimiterOptions(durationSeconds: Long, requestsPerDuration: Long)

case class RateLimiterWindow(timestamp: Long = 0, ids: List[String] = List[String]()) {
  def copyWithId(userId: String) = copy(ids = ids :+ userId)
  def idCount(userId: String) = ids.count(_ == userId)
}

object RateLimiterResult extends Enumeration {
  val Allowed, RateLimited = Value
}

class RateLimiter(
  maxWindowSeconds: Long,
  defaultOptions: RateLimiterOptions,
  userOptions: Map[String, RateLimiterOptions] = Map[String, RateLimiterOptions]()
) {
  val windows = Map[Long, RateLimiterWindow]()

  def request(userId: String, timestamp: Long = System.currentTimeMillis) = {
    val timestampSeconds = timestamp / 1000
    val windowIndex = timestampSeconds % maxWindowSeconds
    val options = userOptions.getOrElse(userId, defaultOptions)

    setRequestEvent(timestampSeconds, windowIndex, userId)

    if (userRequestCount(timestampSeconds, windowIndex, userId) > options.requestsPerDuration) {
      RateLimiterResult.RateLimited
    } else {
      RateLimiterResult.Allowed
    }
  }

  private def setRequestEvent(timestamp: Long, index: Long, userId: String) {
    windows(index) = windows.getOrElse(
                            index, 
                            RateLimiterWindow(timestamp)
                          ).copyWithId(userId)
  }

  private def windowRange(startIndex: Long, numWindows: Long) = {
    val max = numWindows * -1

    (0L until max by -1L).map(x => {
      val idx = startIndex + x
      if (idx >= 0) { idx } else { idx + numWindows }
    })
  }

  private def userRequestCount(timestamp: Long, windowIndex: Long, userId: String) = {
    windows.get(windowIndex) match {
      case Some(window) if window.timestamp == timestamp => window.idCount(userId)
      case _ => 0
    }
  }
}

// Test
val DURATION_SECONDS = 10;
val EVENTS_PER_DURATION = 2;
val MAX_EVENTS = 5;

val rl = new RateLimiter(
           DURATION_SECONDS, 
           RateLimiterOptions(MAX_EVENTS, EVENTS_PER_DURATION))

(0 until MAX_EVENTS).foreach(x => {
  println(s"User 123 -  ${rl.request("123")}" )
})

println(s"User 456 -  ${rl.request("456")}" )