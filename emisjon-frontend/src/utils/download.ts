export async function downloadPdf(url: string, filename: string) {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/pdf' } });
    if (!res.ok) throw new Error(`Failed: ${res.status} ${res.statusText}`);

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    // Fallback for Cloudinary (fl_attachment)
    try {
      let dl = url;
      if (dl.includes('cloudinary.com') && dl.includes('/raw/upload/')) {
        dl = dl.replace('/raw/upload/', '/raw/upload/fl_attachment/');
      }
      window.open(dl, '_blank');
    } catch {
      throw err;
    }
  }
}