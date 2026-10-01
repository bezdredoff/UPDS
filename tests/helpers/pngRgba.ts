import { createHash } from "node:crypto";
import { inflateSync } from "node:zlib";

export type FaceROI = readonly [number, number, number, number];

export function decodeRgbaPng(buffer: Buffer): { width: number; height: number; pixels: Buffer } {
  if (
    buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" ||
    buffer[24] !== 8 ||
    buffer[25] !== 6 ||
    buffer[28] !== 0
  ) {
    throw new Error("Expected non-interlaced 8-bit RGBA PNG");
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const chunks: Buffer[] = [];
  for (let offset = 8; offset < buffer.length; ) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    if (type === "IDAT") chunks.push(buffer.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
    if (type === "IEND") break;
  }
  const raw = inflateSync(Buffer.concat(chunks));
  const stride = width * 4;
  if (raw.length !== (stride + 1) * height) throw new Error("Unexpected PNG payload length");
  const pixels = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    if (filter > 4) throw new Error("Unsupported PNG filter");
    for (let x = 0; x < stride; x += 1) {
      const i = y * stride + x;
      const a = x >= 4 ? pixels[i - 4] : 0;
      const b = y > 0 ? pixels[i - stride] : 0;
      const c = y > 0 && x >= 4 ? pixels[i - stride - 4] : 0;
      const p = a + b - c;
      const pa = Math.abs(p - a);
      const pb = Math.abs(p - b);
      const pc = Math.abs(p - c);
      const predictor = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      const correction = [0, a, b, Math.floor((a + b) / 2), predictor][filter];
      pixels[i] = (raw[y * (stride + 1) + 1 + x] + correction) & 255;
    }
  }
  return { width, height, pixels };
}

export function preservationSignatures(buffer: Buffer, rois: readonly FaceROI[]) {
  const { width, height, pixels } = decodeRgbaPng(buffer);
  const alpha = Buffer.alloc(width * height);
  const outside = Buffer.from(pixels);
  for (let i = 0; i < alpha.length; i += 1) alpha[i] = pixels[i * 4 + 3];
  for (const [x, y, w, h] of rois) {
    if (x < 0 || y < 0 || w <= 0 || h <= 0 || x + w > width || y + h > height) {
      throw new Error("Face ROI outside canvas");
    }
    for (let row = y; row < y + h; row += 1) {
      outside.fill(0, (row * width + x) * 4, (row * width + x + w) * 4);
    }
  }
  const sha256 = (value: Buffer) => createHash("sha256").update(value).digest("hex");
  return { width, height, alphaSHA256: sha256(alpha), outsideROISHA256: sha256(outside) };
}
