const DURATION_SECONDS = 10;
const EVENTS_PER_DURATION = 2;
const MAX_EVENTS = 5;

const RateLimiting = require('./rate-limiting');
const rateLimiter = new RateLimiting.RateLimiter(DURATION_SECONDS, EVENTS_PER_DURATION);

for (let i = 0; i < MAX_EVENTS; i++) {
  const ts = new Date();
  const result = rateLimiter.processEvent('123', ts);
  console.log(`${ts.getTime()}: ${result}`);
}
