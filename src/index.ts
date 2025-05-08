import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface Task {
    name: string;
    script: string;
    env?: Record<string, string>;
}

export interface PipelineSpec {
    name: string;
    version: string;
    description: string;
    tasks: Task[];
}

export interface TaskResult {
    task: string;
    success: boolean;
    data?: any;
    error?: string;
}

export class Pipeline {
    private spec: PipelineSpec;
    private tasks: Task[];
    private results: TaskResult[];

    constructor(specPath: string) {
        this.spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
        this.tasks = this.spec.tasks;
        this.results = [];
    }

    async run(): Promise<TaskResult[]> {
        console.log(`Starting pipeline: ${this.spec.name} v${this.spec.version}`);
        console.log(this.spec.description);
        
        for (const task of this.tasks) {
            console.log(`\nRunning task: ${task.name}`);
            
            try {
                const result = await this.executeTask(task);
                this.results.push({
                    task: task.name,
                    success: true,
                    data: result
                });
            } catch (error) {
                console.error(`Task ${task.name} failed:`, error);
                this.results.push({
                    task: task.name,
                    success: false,
                    error: error instanceof Error ? error.message : String(error)
                });
                throw error; // Stop pipeline on first error
            }
        }

        return this.results;
    }

    private executeTask(task: Task): Promise<any> {
        return new Promise((resolve, reject) => {
            const env = {
                ...process.env,
                ...task.env
            };

            const childProcess: ChildProcess = spawn('node', [task.script], {
                env,
                stdio: ['inherit', 'pipe', 'inherit']
            });

            let output = '';
            let error = '';

            childProcess.stdout?.on('data', (data: Buffer) => {
                output += data.toString();
            });

            childProcess.stderr?.on('data', (data: Buffer) => {
                error += data.toString();
            });

            childProcess.on('close', (code: number | null) => {
                if (code === 0) {
                    try {
                        // Try to parse the last line as JSON
                        const lines = output.trim().split('\n');
                        const lastLine = lines[lines.length - 1];
                        const result = JSON.parse(lastLine);
                        resolve(result);
                    } catch (e) {
                        resolve({ output: output.trim() });
                    }
                } else {
                    reject(new Error(`Task failed with code ${code}: ${error}`));
                }
            });
        });
    }
} 