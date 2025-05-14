// Import Node.js Dependencies
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export class TempDirectory {
  location: string;
  id: string;

  constructor(
    location: string,
    id: string
  ) {
    this.location = location;
    this.id = id;
  }

  static async create() {
    const location = await fs.mkdtemp(
      path.join(os.tmpdir(), "/")
    );

    return new TempDirectory(
      location,
      location.slice(-6)
    );
  }

  async clear() {
    await fs.rm(
      this.location,
      { recursive: true, force: true }
    );

    return this;
  }
}
