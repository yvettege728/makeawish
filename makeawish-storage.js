function sanitizeFileName(fileName = 'upload') {
  const trimmed = String(fileName).trim().toLowerCase();
  const collapsed = trimmed
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return collapsed || 'upload';
}

function buildStorageObjectPath(source, fileName, now = new Date()) {
  const safeSource = source === 'on_site' ? 'on-site' : 'remote';
  const isoStamp = now.toISOString().replace(/[-:]/g, '').replace(/\./g, '');
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${safeSource}/${year}/${month}/${day}/${isoStamp}-${sanitizeFileName(fileName)}`;
}

function buildPublicStorageUrl(baseUrl, bucketName, objectPath) {
  return `${baseUrl}/storage/v1/object/public/${bucketName}/${objectPath}`;
}

const storageHelpers = {
  sanitizeFileName,
  buildStorageObjectPath,
  buildPublicStorageUrl
};

if (typeof window !== 'undefined') {
  window.MakeAWishStorage = storageHelpers;
}

export { buildPublicStorageUrl, buildStorageObjectPath, sanitizeFileName };
