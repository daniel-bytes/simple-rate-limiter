const RateLimiterResults = {
  OK: 'OK',
  RateLimited: 'Rate Limited'
}

// A rate limiter window represents a single time slice window (1 second)
// A user can have multiple events in the same window
class RateLimiterWindow {
  constructor(timestamp, userId) {
    this.timestamp = timestamp;
    this.ids = (userId instanceof Array) ? userId : [ userId ];
  }

  // Add a user to this time window
  addId(userId) {
    this.ids.push(userId);
  }

  // Return how many instances of our ID exist in this window
  idCount(userId) {
    return this.ids.filter(x => userId === x).length;
  }
}

// A rate limiter, based on one-second time slice windows
class RateLimiter {
  constructor(durationSeconds, eventsPerDuration) {
    // The time slice winodws buffer
    this.eventWindows = {};

    // The number of seconds duration we are rate limiting against.
    // For example, if we are allowing 1000 events per minute, this would be set to 60.
    this.durationSeconds = durationSeconds;

    // The number of events allowed per user per duration.
    // For example, if we are allowing 1000 events per minute, this would be set to 1000.
    this.eventsPerDuration = eventsPerDuration;

    // The maximum size (in seconds) of our event windows buffer
    this.maxSeconds = durationSeconds * 2;
  }

  // Process a new event ID, returning a status indicating if the event should be rate limited or not.
  processEvent(userId, timestamp = new Date()) {
    if (timestamp instanceof Date) { timestamp = timestamp.getTime(); }

    // Convert milliseconds timestamp to seconds
    // Derive buffer index from seconds timestamp
    const ts = Math.floor( timestamp / 1000 );
    let idx = ts % this.maxSeconds;
    const eventWindow = this.eventWindows[idx];

    // Insert event into already open time window or make a new one
    if (eventWindow && eventWindow.timestamp === ts) {
      eventWindow.addId(userId);
    }
    else {
      this.eventWindows[idx] = new RateLimiterWindow(ts, userId);
    }

    // For all relevant windows, get the number of matching ids to determine number of requests/events
    const numEvents = this.windows(idx).reduce((count, window) => {
      if (window) { count += window.idCount(userId); }
      return count;
    }, 0);

    return numEvents <= this.eventsPerDuration ? RateLimiterResults.OK : RateLimiterResults.RateLimited;
  }

  // Return all time windows that should be counted towards the current user's quota
  windows(startIdx) {
    const result = [];

    for (let count = 0; count < this.durationSeconds; count++) {
      let idx = ( startIdx - count );
      if (idx < 0) { idx += this.maxSeconds };

      const window = this.eventWindows[idx];
      if (window) { result.push(window); }
    }

    return result;
  }
}

module.exports = {
  RateLimiterResults, RateLimiterWindow, RateLimiter
};