export function createCursorFromDoc(doc) {
  if (!doc) return null;
  return `${doc.createdAt.toISOString()}::${doc._id}`;
}

export function parseCursor(cursor) {
  if (!cursor) return null;
  const [iso, id] = cursor.split('::');
  return { createdAt: new Date(iso), id };
}
