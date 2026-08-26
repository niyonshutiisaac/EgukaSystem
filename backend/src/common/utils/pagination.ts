export interface Paginated<T> {
  data: T[];
  meta: {
    total?: number;
    nextCursor?: string | null;
    hasMore: boolean;
  };
}

export interface PaginationParams {
  /** Keyset cursor — opaque base64 of the last row's (createdAt, id). */
  cursor?: string;
  limit: number;
}

export function parsePagination(cursor?: string, limitRaw?: string): PaginationParams {
  const limit = Math.min(Math.max(parseInt(limitRaw ?? '20', 10) || 20, 1), 100);
  return { cursor, limit };
}

export function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(`${createdAt.toISOString()}|${id}`).toString('base64url');
}

export function decodeCursor(cursor?: string): { createdAt: Date; id: string } | null {
  if (!cursor) return null;
  try {
    const [iso, id] = Buffer.from(cursor, 'base64url').toString('utf8').split('|');
    const createdAt = new Date(iso);
    if (Number.isNaN(createdAt.getTime()) || !id) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}

/** Builds a keyset where condition for (createdAt, id) ordering. */
export function keysetWhere<T extends Record<string, unknown>>(
  decoded: { createdAt: Date; id: string } | null,
  where: T,
): T {
  if (!decoded) return where;
  return {
    AND: [
      where,
      {
        OR: [
          { createdAt: { lt: decoded.createdAt } },
          { createdAt: decoded.createdAt, id: { lt: decoded.id } },
        ],
      },
    ],
  } as unknown as T;
}
