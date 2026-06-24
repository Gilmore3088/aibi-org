import { generatePdfFromRoute } from '@/lib/pdf/generate';
import type { CertificateRow } from './issue';

export async function buildCertificatePdfBuffer(
  cert: CertificateRow,
  origin: string,
): Promise<Buffer> {
  return generatePdfFromRoute({
    origin,
    path: `/verify/${encodeURIComponent(cert.certificate_id)}/print`,
    viewport: { width: 1600, height: 1200 },
    pdf: {
      format: 'Letter',
      landscape: true,
      printBackground: true,
      margin: { top: '0in', right: '0in', bottom: '0in', left: '0in' },
      preferCSSPageSize: true,
    },
  });
}
