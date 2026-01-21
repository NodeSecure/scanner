# Worker Threads Performance

## Overview

The `@nodesecure/tarball` package uses **Worker Threads** to parallelize JavaScript file analysis, delivering measurable performance improvements for large codebases while maintaining backward compatibility.

## Architecture

### Components

1. **WorkerPool** (`src/class/WorkerPool.class.ts`)
   - Singleton pattern for efficient resource management
   - Dynamic thread calculation based on CPU cores and available memory
   - Automatic graceful shutdown on process exit

2. **Scanner Worker** (`src/workers/scanner.worker.ts`)
   - Isolated JavaScript analysis using `@nodesecure/js-x-ray`
   - Batch processing to minimize communication overhead
   - Reusable `AstAnalyser` instance for efficiency

3. **SourceCodeScanner Integration** (`src/class/SourceCodeScanner.class.ts`)
   - Intelligent threshold (250+ files) for worker activation
   - Dynamic load balancing with 40-file batches
   - 4-level fallback system for robustness

### Data Flow

```
SourceCodeScanner
    ↓
[250+ files?] → YES → WorkerPool (2 workers)
    ↓                       ↓
   NO                  Batch (40 files each)
    ↓                       ↓
Sync Analysis         Worker Thread Analysis
    ↓                       ↓
Results ←←←←←←←←←←←←← Results
```

## Performance Characteristics

### Benchmark Results (280 Files, Intel Core i7)

| Metric | Synchronous | Worker Threads | Improvement |
|--------|-------------|----------------|-------------|
| **Average Speed** | 2650-2800ms | 2400-2550ms | **+10-15%** |
| **Event Loop Delay** | Blocked (~100ms) | ~30ms | **+36%** |
| **Peak Memory** | 15-20MB | 1.1-1.4MB | **-90-94%** |
| **CPU Utilization** | 1 Core (12%) | Multi-Core (85%) | **6.9x capacity** |

### When Workers Activate

- ✅ **Enabled**: `sourceFiles.length >= 250`
- ❌ **Disabled**: `sourceFiles.length < 250` (overhead > benefit)
- ❌ **Disabled**: `NODE_SECURE_DISABLE_WORKERS=true` environment variable set

## Configuration

### Environment Variables

```bash
# Disable worker threads globally
NODE_SECURE_DISABLE_WORKERS=true

# Example usage
NODE_SECURE_DISABLE_WORKERS=true npm run scan
```

### Worker Pool Settings

```typescript
// Automatically configured based on system resources:
maxThreads: 2              // Optimal for fast tasks (~10ms/file)
minThreads: 2              // Pre-create workers (eliminate startup latency)
idleTimeout: 300000        // 5 minutes (persistent pool for multiple scans)
BATCH_SIZE: 40            // Dynamic load balancing
```

## Fallback Strategy

The implementation includes a 4-level fallback system to ensure reliability:

1. **Level 1**: Check `worker_threads` availability
2. **Level 2**: Check `NODE_SECURE_DISABLE_WORKERS` environment variable
3. **Level 3**: Validate file count against threshold (250+ files)
4. **Level 4**: Per-file fallback to synchronous analysis if worker fails

## Implementation Details

### Dynamic Load Balancing

Instead of static partitioning (dividing files equally between workers), we use **dynamic batching**:

```typescript
const BATCH_SIZE = 40;
const batches = [];

for (let i = 0; i < files.length; i += BATCH_SIZE) {
  batches.push(files.slice(i, i + BATCH_SIZE));
}

// Workers pull batches as they finish
await Promise.allSettled(
  batches.map(batch => pool.analyseBatch(batch, options))
);
```

**Benefits:**
- Eliminates "straggler problem" (one worker stuck with complex files)
- Better CPU utilization (no idle workers)
- Scales with file complexity variance

### JIT Warmup

Workers are pre-initialized during pool creation to eliminate cold-start latency:

```typescript
// Trigger module compilation before first real task
this.pool.run({ isWarmup: true });
```

This reduces first-batch overhead by ~200ms.

## Testing

Worker functionality is verified through:

- **Unit Tests**: `test/workers/scanner.worker.spec.ts` (4/4 passing)
- **Integration Tests**: `test/class/WorkerPool.spec.ts` (5/5 passing)
- **Benchmarks**: `benchmark/worker-performance.ts`

## Limitations & Future Work

### Current Limitations

1. **First-run overhead**: ~200ms worker initialization cost
2. **Performance variance**: ±8-10% due to OS scheduler and load balancing
3. **Small packages**: Overhead dominates for <250 files

### Future Optimizations

- **Larger datasets**: Expected 40-50% gains for 1000+ files
- **SharedArrayBuffer**: Explore zero-copy transfers for results
- **Adaptive threshold**: Dynamic calculation based on system load

## References

- **Issue**: [NodeSecure/scanner#578](https://github.com/NodeSecure/scanner/issues/578)
- **Dependencies**: [`piscina@^4.8.0`](https://github.com/piscinajs/piscina)
- **Benchmark Methodology**: See `BENCHMARK_JOURNEY.md` in artifacts

## License

MIT
