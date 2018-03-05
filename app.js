const DURATION_SECONDS = 10;
const EVENTS_PER_DURATION = 2;
const MAX_EVENTS = 5;

const RateLimiting = require('./rate-limiting');
const rateLimiter = new RateLimiting.RateLimiter(DURATION_SECONDS, EVENTS_PER_DURATION);

// First 2 results should return as 'OK", the next 3 should be "Rate Limited"
for (let i = 0; i < MAX_EVENTS; i++) {
  const ts = new Date();
  const result = rateLimiter.processEvent('123', ts);
  console.log(`User 123 - ${ts.getTime()}: ${result}`);
}

// This user should not be rate limited
const ts = new Date();
const result = rateLimiter.processEvent('456', ts);
console.log(`User 456 - ${ts.getTime()}: ${result}`);
