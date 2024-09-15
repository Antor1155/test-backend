async function backoff(options) {
  const {
    maxAttempts = 5,
    initialDelay = 1000,
    maxDelay = 10000,
    onAttempt = () => {},
    onRetry = () => {},
    onMaxAttempts = () => {},
    operation,
  } = options

  const retry = async (attempt) => {
    if (attempt > maxAttempts) {
      onMaxAttempts()
      return
    }

    const delay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay)

    onAttempt(attempt, delay)
    await new Promise((resolve) => setTimeout(resolve, delay))

    try {
      const result = await operation(attempt)
    } catch (error) {
      onRetry(attempt, error)
      return retry(attempt + 1)
    }
  }

  retry(1)
}

;(async () => {
  await backoff({
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 5000,
    onAttempt: (attempt, delay) =>
      console.log(`Attempt ${attempt} in ${delay}ms`),
    onRetry: (attempt, error) =>
      console.error(`Attempt ${attempt} failed with error: ${error.message}`),
    onMaxAttempts: () => console.error("Max attempts reached"),
    operation: async (attempt) => {
      console.log(`Attempting custom operation at attempt ${attempt}`)
      throw new Error("Operation failed")
    },
  })
})()

module.exports = {
  backoff,
}
