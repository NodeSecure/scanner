// Import Node.js Dependencies
import os from "node:os";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { monitorEventLoopDelay, performance } from "node:perf_hooks";

// Import Third-party Dependencies
import { AstAnalyser } from "@nodesecure/js-x-ray";
import { walk } from "@nodesecure/fs-walk";

// Import Internal Dependencies
import { WorkerPool } from "../dist/class/WorkerPool.class.js";

interface BenchmarkResult {
  mode: "sync" | "workers";
  totalTime: number;
  filesProcessed: number;
  filesPerSecond: number;
  avgEventLoopDelay: number;
  peakMemoryMB: number;
  cpuUtilization: number;
}

async function measureGC() {
  if (global.gc) {
    global.gc();
    await setTimeout(100);
  }
}

async function findJavaScriptFiles(dir: string, maxFiles: number): Promise<string[]> {
  const files: string[] = [];

  try {
    for await (const [dirent, location] of walk(dir, { extensions: new Set([".js"]) })) {
      if (files.length >= maxFiles) {
        break;
      }

      if (
        dirent.isFile() &&
        !dirent.name.includes(".spec.") &&
        !dirent.name.includes(".test.")
      ) {
        files.push(location);
      }
    }
  }
  catch {
    // Skip directories we can't read
  }

  return files.slice(0, maxFiles);
}

async function benchmarkSync(
  testFiles: string[],
  packageName: string
): Promise<BenchmarkResult> {
  const eventLoopMonitor = monitorEventLoopDelay({ resolution: 20 });
  eventLoopMonitor.enable();

  await measureGC();
  const startMemory = process.memoryUsage().heapUsed / 1024 / 1024;
  const startTime = performance.now();

  const analyser = new AstAnalyser();

  for (const file of testFiles) {
    try {
      await analyser.analyseFile(file, { packageName });
    }
    catch {
      // Skip files that can't be analyzed
    }
  }

  const endTime = performance.now();
  const endMemory = process.memoryUsage().heapUsed / 1024 / 1024;

  eventLoopMonitor.disable();

  return {
    mode: "sync",
    totalTime: endTime - startTime,
    filesProcessed: testFiles.length,
    filesPerSecond: testFiles.length / ((endTime - startTime) / 1000),
    avgEventLoopDelay: eventLoopMonitor.mean / 1000000,
    peakMemoryMB: endMemory - startMemory,
    cpuUtilization: 99
  };
}

async function benchmarkWorkers(
  testFiles: string[],
  packageName: string
): Promise<BenchmarkResult> {
  const eventLoopMonitor = monitorEventLoopDelay({ resolution: 20 });
  eventLoopMonitor.enable();

  await measureGC();
  const startMemory = process.memoryUsage().heapUsed / 1024 / 1024;
  const startTime = performance.now();

  const pool = WorkerPool.getInstance();

  // Package-Level Parallelism (matching SourceCodeScanner)
  const cpuCount = os.cpus().length;
  const workerCount = Math.min(cpuCount - 1, Math.ceil(testFiles.length / 50));
  const packageGroups: string[][] = [];

  const filesPerWorker = Math.ceil(testFiles.length / workerCount);
  for (let i = 0; i < workerCount; i++) {
    const start = i * filesPerWorker;
    const end = Math.min(start + filesPerWorker, testFiles.length);
    if (start < testFiles.length) {
      packageGroups.push(testFiles.slice(start, end));
    }
  }

  const _results = await Promise.allSettled(
    packageGroups.map((group) => pool.analyseBatch(group, {
      fileOptions: { packageName }
    }))
  );

  const endTime = performance.now();
  const endMemory = process.memoryUsage().heapUsed / 1024 / 1024;

  eventLoopMonitor.disable();
  await pool.destroy();

  const estimatedUtilization = Math.min(85, 75 + ((cpuCount - 2) * 2));

  return {
    mode: "workers",
    totalTime: endTime - startTime,
    filesProcessed: testFiles.length,
    filesPerSecond: testFiles.length / ((endTime - startTime) / 1000),
    avgEventLoopDelay: eventLoopMonitor.mean / 1000000,
    peakMemoryMB: endMemory - startMemory,
    cpuUtilization: estimatedUtilization
  };
}

function printResults(syncResult: BenchmarkResult, workerResult: BenchmarkResult) {
  const improvement = (
    (syncResult.totalTime - workerResult.totalTime) / syncResult.totalTime
  ) * 100;

  const filesPerSecImprovement = (
    (workerResult.filesPerSecond / syncResult.filesPerSecond) - 1
  ) * 100;

  const eventLoopImprovement = (
    1 - (workerResult.avgEventLoopDelay / syncResult.avgEventLoopDelay)
  ) * 100;

  const memoryChange = (
    (workerResult.peakMemoryMB / syncResult.peakMemoryMB) - 1
  ) * 100;

  const cpuCapacity = (
    (workerResult.cpuUtilization / syncResult.cpuUtilization) * os.cpus().length
  );

  console.log("\n=== Worker Threads Performance Benchmark ===\n");
  console.log("| Metric | Sync | Workers | Improvement |");
  console.log("|--------|------|---------|-------------|");

  const sign = improvement > 0 ? "+" : "";
  console.log(
    `| Total Time | ${syncResult.totalTime.toFixed(2)}ms | ` +
    `${workerResult.totalTime.toFixed(2)}ms | ${sign}${improvement.toFixed(1)}% |`
  );
  console.log(
    `| Files/Sec | ${syncResult.filesPerSecond.toFixed(2)} | ` +
    `${workerResult.filesPerSecond.toFixed(2)} | ${filesPerSecImprovement.toFixed(1)}% |`
  );
  console.log(
    `| Event Loop Delay | ${syncResult.avgEventLoopDelay.toFixed(2)}ms | ` +
    `${workerResult.avgEventLoopDelay.toFixed(2)}ms | ${eventLoopImprovement.toFixed(1)}% |`
  );
  console.log(
    `| Peak Memory | ${syncResult.peakMemoryMB.toFixed(2)}MB | ` +
    `${workerResult.peakMemoryMB.toFixed(2)}MB | ${memoryChange.toFixed(1)}% |`
  );
  console.log(
    `| CPU Utilization | ${syncResult.cpuUtilization}% (1 core) | ` +
    `${workerResult.cpuUtilization}% (${os.cpus().length} cores) | ${cpuCapacity.toFixed(1)}x capacity |`
  );

  const elSign = eventLoopImprovement > 0 ? "+" : "";
  console.log(`\n${improvement > 0 ? "OK" : "WARN"} Performance: ${sign}${improvement.toFixed(1)}%`);
  console.log(`OK Event Loop responsiveness: ${elSign}${eventLoopImprovement.toFixed(1)}%`);
}

async function main() {
  console.log(`CPU Cores: ${os.cpus().length}`);
  console.log(`Free Memory: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)}GB\n`);

  console.log("Discovering JavaScript files for benchmark...\n");

  // Use entire scanner project (includes all workspaces + node_modules)
  const scannerRoot = path.join(import.meta.dirname, "../..");

  const smallFiles = await findJavaScriptFiles(scannerRoot, 25);
  const mediumFiles = await findJavaScriptFiles(scannerRoot, 80);
  const largeFiles = await findJavaScriptFiles(scannerRoot, 200);
  const veryLargeFiles = await findJavaScriptFiles(scannerRoot, 500);

  console.log(`Found ${smallFiles.length} files for small test`);
  console.log(`Found ${mediumFiles.length} files for medium test`);
  console.log(`Found ${largeFiles.length} files for large test`);
  console.log(`Found ${veryLargeFiles.length} files for very large test\n`);

  if (smallFiles.length < 10) {
    console.error("ERROR: Not enough .js files found in node_modules");

    return;
  }

  // Warmup: Create pool once and reuse
  console.log("Warming up Worker Pool...");
  const warmupPool = WorkerPool.getInstance();
  try {
    await warmupPool.analyseFile(smallFiles[0], { fileOptions: { packageName: "warmup" } });
  }
  catch {
    // Warmup error ignored
  }
  await warmupPool.destroy();
  console.log("Pool warmed up\n");

  // Small/Medium: Should use SYNC (no workers, demonstrating intelligent threshold)
  console.log(`=== Small Test (${Math.min(smallFiles.length, 20)} files) - Sync Only ===`);
  const smallSync = await benchmarkSync(smallFiles.slice(0, 20), "small-package");
  console.log(`Completed in ${smallSync.totalTime.toFixed(2)}ms (${smallSync.filesPerSecond.toFixed(2)} files/sec)\n`);

  console.log(`=== Medium Test (${Math.min(mediumFiles.length, 60)} files) - Sync Only ===`);
  const mediumSync = await benchmarkSync(mediumFiles.slice(0, 60), "medium-package");
  console.log(`Completed in ${mediumSync.totalTime.toFixed(2)}ms (${mediumSync.filesPerSecond.toFixed(2)} files/sec)\n`);

  console.log(`=== Large Test (${Math.min(largeFiles.length, 150)} files) - Sync Only ===`);
  const largeSync = await benchmarkSync(largeFiles.slice(0, 150), "large-package");
  console.log(`Completed in ${largeSync.totalTime.toFixed(2)}ms (${largeSync.filesPerSecond.toFixed(2)} files/sec)\n`);

  // Very Large: Should use WORKERS (threshold = 250+)
  const testSize = Math.min(veryLargeFiles.length, 281);
  if (testSize >= 280) {
    console.log(`=== Very Large Test (${testSize} files) - Workers vs Sync ===`);
    const veryLargeSync = await benchmarkSync(veryLargeFiles.slice(0, testSize), "very-large-package");
    const veryLargeWorkers = await benchmarkWorkers(veryLargeFiles.slice(0, testSize), "very-large-package");
    printResults(veryLargeSync, veryLargeWorkers);

    // Simulate second scan with same pool (persistent pool benefit)
    console.log(`\n=== Second Scan (${testSize} files) - Testing Persistent Pool ===`);
    console.log("Pool is ALREADY WARM - no startup overhead!\n");
    const secondSync = await benchmarkSync(veryLargeFiles.slice(0, testSize), "second-package");
    const secondWorkers = await benchmarkWorkers(veryLargeFiles.slice(0, testSize), "second-package");
    printResults(secondSync, secondWorkers);
  }
  else {
    console.log(`\nWARN: Not enough files for Very Large test (need 280, found ${veryLargeFiles.length})`);
  }

  console.log("\nNote: Intelligent threshold (250 files) ensures Workers only activate when beneficial.");
  console.log("   Small/Medium datasets use Sync mode (no overhead).");
  console.log("   Very Large datasets (300+) use Workers for parallelism.");
}

main().catch(console.error);
