const RateLimiterResults = {
  OK: 'OK',
  RateLimited: 'Rate Limited'
}

class RateLimiterWindow {
  constructor(timestamp, id) {
    this.timestamp = timestamp;
    this.ids = (id instanceof Array) ? id : [ id ];
  }

  addId(id) {
    this.ids.push(id);
  }

  idCount(id) {
    return this.ids.filter(x => id === x).length;
  }
}

class RateLimiter {
  constructor(durationSeconds, eventsPerDuration) {
    this.eventWindows = {};
    this.durationSeconds = durationSeconds;
    this.eventsPerDuration = eventsPerDuration;
    this.maxSeconds = durationSeconds * 2;
  }

  processEvent(id, timestamp = new Date()) {
    if (timestamp instanceof Date) { timestamp = timestamp.getTime(); }

    const ts = Math.floor( timestamp / 1000 );
    const evt = { id, ts };
    let idx = ts % this.maxSeconds;
    const eventWindow = this.eventWindows[idx];

    // Insert event into already open timeslot or make a new one
    if (eventWindow && eventWindow.timestamp === ts) {
      eventWindow.addId(id);
    }
    else {
      this.eventWindows[idx] = new RateLimiterWindow(ts, id);
    }

    // Get number of processed events
    const numEvents = this.windows(idx).reduce((count, window) => {
      if (window) { count += window.idCount(id); }
      return count;
    }, 0);

    return numEvents <= this.eventsPerDuration ? RateLimiterResults.OK : RateLimiterResults.RateLimited;
  }

  // Return all time windows
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