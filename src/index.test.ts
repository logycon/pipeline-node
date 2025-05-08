import { Pipeline } from './index';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

jest.mock('fs');
jest.mock('child_process');

describe('Pipeline', () => {
    const mockSpec = {
        name: 'test-pipeline',
        version: '1.0.0',
        description: 'Test pipeline',
        tasks: [
            {
                name: 'task1',
                script: './task1.js'
            }
        ]
    };

    const mockChildProcess = {
        stdout: {
            on: jest.fn((event, callback) => {
                if (event === 'data') {
                    callback(Buffer.from('{"status": "success"}\n'));
                }
            })
        },
        stderr: {
            on: jest.fn()
        },
        on: jest.fn((event, callback) => {
            if (event === 'close') {
                callback(0);
            }
        })
    };

    beforeEach(() => {
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockSpec));
        (spawn as jest.Mock).mockReturnValue(mockChildProcess);
    });

    it('should create a pipeline instance from spec file', () => {
        const pipeline = new Pipeline('pipeline.json');
        expect(pipeline).toBeInstanceOf(Pipeline);
    });

    it('should run tasks and return results', async () => {
        const pipeline = new Pipeline('pipeline.json');
        const results = await pipeline.run();
        expect(results).toHaveLength(1);
        expect(results[0].task).toBe('task1');
        expect(results[0].success).toBe(true);
        expect(results[0].data).toEqual({ status: 'success' });
    });
}); 