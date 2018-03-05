# Simple Rate Limiter

Simple rate limiter example, based on a sliding scale time window

`node app.js` to run (built and tested against node v9.7.1)

## Overview

Imagine a rate limiting of 4 events per 5 seconds:

```
Time (seconds):  | 1   2   3   4   5 | 6   7*  8   9  10 |
                 -----------------------------------------
Events:          | x |   | x | x | x | x | x | x | x |   |
                 -----------------------------------------
Fixed Window:    |   -------->       |    -------->      |
                 -----------------------------------------
Sliding Window:          |     -------->     |
                 -----------------------------------------
```

* Should we allow the event at second 7?  
- Fixed Window: Yes, because we only have one previous event in the second window
- Sliding Window: No, because we already have 4 events in the previous 5 seconds

## Implementing a sliding scale window

The way the sliding window is implemented here is via a hash table storing up to `$DURATION * 2` time slices.  Each time slice holds a timestamp in seconds ( `floor( now / 1000)`, where `now` is the number of milliseconds since 1970/01/01 ), and an array of event IDs.

After adding an event, the rate limiter then looks at the current time window as well as the previous N windows to get the total number of event IDs found matching our current event ID.  If that number exceeds the max event amount, we start rate limiting.

By using a circular buffer of events, indexed by `timestamp % MAX_TIME_SLICES`, we can ensure fairly low memory usage by reusing older entries in the buffer.
