export const REDLOCK = 'REDLOCK_PROVIDER';

export const REDLOCK_TTL = 1000 * 30;

export const REDLOCK_OPTIONS = Object.freeze({
  // The expected clock drift; for more details see:
  // http://redis.io/topics/distlock
  driftFactor: 0.01, // multiplied by lock ttl to determine drift time

  // The max number of times Redlock will attempt to lock a resource
  // before erroring.
  retryCount: 5,

  // the time in ms between attempts
  retryDelay: 500, // time in ms

  // the max time in ms randomly added to retries
  // to improve performance under high contention
  // see https://www.awsarchitectureblog.com/2015/03/backoff.html
  retryJitter: 200, // time in ms

  // The minimum remaining time on a lock before an extension is automatically
  // attempted with the `using` API.
  automaticExtensionThreshold: 500, // time in ms
});
