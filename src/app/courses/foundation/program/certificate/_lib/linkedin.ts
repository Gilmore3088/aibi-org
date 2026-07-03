// LinkedIn "Add to profile" deep link for the AiBI-Foundation credential.
// Docs: https://addtoprofile.linkedin.com/ — the profile/add endpoint accepts
// certification fields via query params; LinkedIn prefills the certification
// form for the signed-in member.

export interface LinkedInCertificateParams {
  readonly name: string;
  readonly organizationName: string;
  /** ISO timestamp the certificate was issued (certificates.issued_at). */
  readonly issuedAt: string;
  readonly certUrl: string;
  readonly certId: string;
}

export function buildLinkedInAddToProfileUrl({
  name,
  organizationName,
  issuedAt,
  certUrl,
  certId,
}: LinkedInCertificateParams): string {
  const issued = new Date(issuedAt);
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name,
    organizationName,
    issueYear: String(issued.getUTCFullYear()),
    issueMonth: String(issued.getUTCMonth() + 1),
    certUrl,
    certId,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}
