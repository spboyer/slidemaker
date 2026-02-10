import fs from "fs/promises";
import path from "path";
import type { Presentation } from "./types";

export interface PresentationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  slideCount: number;
}

export interface StorageProvider {
  savePresentation(userId: string, slug: string, data: Presentation): Promise<void>;
  getPresentation(userId: string, slug: string): Promise<Presentation | null>;
  listPresentations(userId: string): Promise<PresentationSummary[]>;
  deletePresentation(userId: string, slug: string): Promise<boolean>;
}

// --- Local File Storage ---

const PRESENTATIONS_DIR = path.join(process.cwd(), "presentations");

export class LocalFileStorage implements StorageProvider {
  private async ensureDir(): Promise<void> {
    await fs.mkdir(PRESENTATIONS_DIR, { recursive: true });
  }

  async savePresentation(_userId: string, slug: string, data: Presentation): Promise<void> {
    await this.ensureDir();
    const filePath = path.join(PRESENTATIONS_DIR, `${slug}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async getPresentation(_userId: string, slug: string): Promise<Presentation | null> {
    try {
      const filePath = path.join(PRESENTATIONS_DIR, `${slug}.json`);
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data) as Presentation;
    } catch {
      return null;
    }
  }

  async listPresentations(_userId: string): Promise<PresentationSummary[]> {
    await this.ensureDir();
    const files = await fs.readdir(PRESENTATIONS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const presentations = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(PRESENTATIONS_DIR, file);
        const data = JSON.parse(await fs.readFile(filePath, "utf-8")) as Presentation;
        return {
          id: data.id,
          title: data.title,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          slideCount: data.slides.length,
        };
      })
    );

    return presentations;
  }

  async deletePresentation(_userId: string, slug: string): Promise<boolean> {
    try {
      const filePath = path.join(PRESENTATIONS_DIR, `${slug}.json`);
      await fs.access(filePath);
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// --- Azure Blob Storage ---

export class BlobStorage implements StorageProvider {
  private containerName = "presentations";
  private clientPromise: Promise<import("@azure/storage-blob").ContainerClient>;

  constructor() {
    this.clientPromise = this.createClient();
  }

  private async createClient(): Promise<import("@azure/storage-blob").ContainerClient> {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (connectionString) {
      const { BlobServiceClient } = await import("@azure/storage-blob");
      const service = BlobServiceClient.fromConnectionString(connectionString);
      const container = service.getContainerClient(this.containerName);
      await container.createIfNotExists();
      return container;
    }

    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    if (accountName) {
      const { BlobServiceClient } = await import("@azure/storage-blob");
      const { DefaultAzureCredential } = await import("@azure/identity");
      const service = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential()
      );
      const container = service.getContainerClient(this.containerName);
      await container.createIfNotExists();
      return container;
    }

    throw new Error(
      "BlobStorage requires AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT_NAME"
    );
  }

  private blobName(userId: string, slug: string): string {
    return `${userId}/${slug}.json`;
  }

  async savePresentation(userId: string, slug: string, data: Presentation): Promise<void> {
    const container = await this.clientPromise;
    const blob = container.getBlockBlobClient(this.blobName(userId, slug));
    const content = JSON.stringify(data, null, 2);
    await blob.upload(content, Buffer.byteLength(content), {
      blobHTTPHeaders: { blobContentType: "application/json" },
    });
  }

  async getPresentation(userId: string, slug: string): Promise<Presentation | null> {
    try {
      const container = await this.clientPromise;
      const blob = container.getBlockBlobClient(this.blobName(userId, slug));
      const response = await blob.download(0);
      const body = await streamToString(response.readableStreamBody!);
      return JSON.parse(body) as Presentation;
    } catch (error: unknown) {
      if (error && typeof error === "object" && "statusCode" in error && (error as { statusCode: number }).statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async listPresentations(userId: string): Promise<PresentationSummary[]> {
    const container = await this.clientPromise;
    const prefix = `${userId}/`;
    const results: PresentationSummary[] = [];

    for await (const blob of container.listBlobsFlat({ prefix })) {
      if (!blob.name.endsWith(".json")) continue;
      try {
        const blobClient = container.getBlockBlobClient(blob.name);
        const response = await blobClient.download(0);
        const body = await streamToString(response.readableStreamBody!);
        const data = JSON.parse(body) as Presentation;
        results.push({
          id: data.id,
          title: data.title,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          slideCount: data.slides.length,
        });
      } catch {
        // Skip malformed blobs
      }
    }

    return results;
  }

  async deletePresentation(userId: string, slug: string): Promise<boolean> {
    try {
      const container = await this.clientPromise;
      const blob = container.getBlockBlobClient(this.blobName(userId, slug));
      const response = await blob.deleteIfExists();
      return response.succeeded;
    } catch {
      return false;
    }
  }
}

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

// --- Factory ---

let _storage: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (!_storage) {
    if (process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.AZURE_STORAGE_ACCOUNT_NAME) {
      _storage = new BlobStorage();
    } else {
      _storage = new LocalFileStorage();
    }
  }
  return _storage;
}
