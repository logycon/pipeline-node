# pipeline-node

A simple pipeline runner for Node.js tasks that allows you to define and execute a series of tasks in sequence.

## Installation

```bash
npm install pipeline-node
```

## Usage

1. Create a pipeline specification file (e.g., `pipeline.json`):

```json
{
  "name": "my-pipeline",
  "version": "1.0.0",
  "description": "My awesome pipeline",
  "tasks": [
    {
      "name": "task1",
      "script": "./scripts/task1.js",
      "env": {
        "CUSTOM_VAR": "value"
      }
    },
    {
      "name": "task2",
      "script": "./scripts/task2.js"
    }
  ]
}
```

2. Use the pipeline in your code:

```typescript
import { Pipeline } from 'pipeline-node';

async function main() {
  const pipeline = new Pipeline('./pipeline.json');
  try {
    const results = await pipeline.run();
    console.log('Pipeline completed successfully:', results);
  } catch (error) {
    console.error('Pipeline failed:', error);
  }
}

main();
```

## Task Scripts

Each task script should be a Node.js script that:
1. Performs the required operations
2. Outputs its result as a JSON string on the last line of stdout
3. Returns 0 on success, non-zero on failure

Example task script:

```javascript
// scripts/task1.js
async function main() {
  // Do something
  const result = { status: 'success', data: 'some data' };
  console.log(JSON.stringify(result));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
```

## API

### Pipeline

The main class for running pipelines.

#### Constructor

```typescript
constructor(specPath: string)
```

Creates a new pipeline instance from a specification file.

#### Methods

```typescript
async run(): Promise<TaskResult[]>
```

Runs all tasks in the pipeline and returns an array of results.

### Types

```typescript
interface Task {
  name: string;
  script: string;
  env?: Record<string, string>;
}

interface PipelineSpec {
  name: string;
  version: string;
  description: string;
  tasks: Task[];
}

interface TaskResult {
  task: string;
  success: boolean;
  data?: any;
  error?: string;
}
```

## License

MIT 