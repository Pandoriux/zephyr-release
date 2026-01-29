This documentation outlines the architectural pattern for implementing a **Stateful Platform Provider** using a factory function and closures.

> [!IMPORTANT]
> **Implementation Note:** The code snippets provided below are **illustrative examples**. They are intended to demonstrate the pattern's structure. You should adapt these examples to fit your project’s specific naming conventions, error-handling strategies, and existing type definitions.

---

```markdown
# Implementation Guide: Stateful Platform Provider Pattern

To simplify method signatures and encapsulate sensitive credentials (like GitHub tokens), this project utilizes a **Stateful Factory Pattern**. This approach allows the provider to "remember" its configuration and API client after an initial setup phase, removing the need to pass tokens or inputs into every subsequent function call.

---

## 1. The Provider Interface

The `PlatformProvider` interface defines the contract for any platform-specific implementation. It includes a primary initialization method that captures the environment's state.

```typescript
export interface PlatformProvider {
  /**
   * Orchestrates the retrieval of platform-specific inputs (e.g., via GitHub Actions core)
   * and initializes internal API clients (e.g., Octokit).
   * * This should be called once during the initial "Get Inputs" phase of the workflow.
   * Returns the retrieved inputs for use in platform-agnostic logic.
   */
  getInputs: () => Promise<ProviderInputs>;

  // API methods are defined with clean signatures, as they access
  // credentials internally via the factory's closure.
  manageConcurrency: () => Promise<void>;
  getTextFileOrThrow: (filePath: string) => Promise<string>;
  
  // ... other methods
}
```

---

## 2. Implementing the Factory (Closure Approach)

Instead of using a class, use a factory function. This keeps implementation details like the `Octokit` instance private within the function's scope (closure).

```typescript
/**
 * EXAMPLE: GitHub Implementation
 * Adapt this logic to handle your specific input-fetching and client-setup needs.
 */
export function createGitHubProvider(logger: CoreLogger): PlatformProvider {
  // Private state variables held in the closure
  let _octokit: any | undefined;
  let _inputs: ProviderInputs | undefined;

  // Internal helper to ensure the client is ready before use
  const getClient = () => {
    if (!_octokit) {
      throw new Error("Provider client not initialized. Ensure 'getInputs()' is called first.");
    }
    return _octokit;
  };

  return {
    async getInputs() {
      // 1. Fetch data from the environment (e.g., GITHUB_TOKEN, config-path)
      _inputs = await fetchEnvironmentInputs(); 

      // 2. Initialize the API client once
      _octokit = initializeOctokitClient(_inputs.token);

      return _inputs;
    },

    async manageConcurrency() {
      const client = getClient();
      // Implementation logic using the internal client...
    },

    async getTextFileOrThrow(filePath: string) {
      const client = getClient();
      // Implementation logic...
    }
    
    // ... implement remaining interface methods
  };
}
```

---

## 3. Workflow Integration

Integrate the provider into your main execution flow. This pattern preserves granular logging while allowing platform-agnostic logic to access the shared input state.

### Step A: Instantiation

The entry point should determine which platform to use and create the uninitialized provider instance.

```typescript
export async function getProviderOrThrow(): Promise<PlatformProvider> {
  if (isGitHubActions()) {
    const { createGitHubProvider } = await import("./github/github-provider.ts");
    return createGitHubProvider(taskLogger);
  }
  // ... handle other platforms
  throw new Error("Unsupported platform");
}
```

### Step B: Execution Flow

The `run` function executes the `getInputs` method to "prime" the provider before performing API-heavy operations.

```typescript
export async function run(provider: PlatformProvider) {
  // 1. Setup Phase
  logger.stepStart("Starting: Setup operation");
  setupInitialEnvironment();
  logger.stepFinish("Finished: Setup operation");

  // 2. Input & Initialization Phase
  logger.stepStart("Starting: Get inputs");
  // This call populates the provider's internal state and returns data for the main script
  const inputs = await provider.getInputs(); 
  logger.stepFinish("Finished: Get inputs");

  // 3. Agnostic Logic
  // Functions that don't need the GitHub API use the returned 'inputs'
  const config = await loadConfig(inputs.configPath);

  // 4. Provider Logic
  logger.stepStart("Starting: Manage concurrency");
  // The provider already 'knows' the token and repo details
  await provider.manageConcurrency(); 
  logger.stepFinish("Finished: Manage concurrency");
}
```

---

## Summary of Benefits

* **Encapsulation:** Sensitive tokens are stored in a private scope, not passed around as function arguments.
* **Readability:** Method calls like `provider.manageConcurrency()` are concise and focus on the action rather than the authentication.
* **Testability:** Implementation details are decoupled from the main execution flow, allowing for easier mocking of the `PlatformProvider` interface in unit tests.

```
