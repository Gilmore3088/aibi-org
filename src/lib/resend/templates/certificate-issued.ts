// Email 4: Certificate issued after course completion.

import { emailShell, escapeHtml, kicker, heading, body, ctaButton, divider } from './base';

export interface CertificateIssuedVars {
  holderName: string;
  designation: string;
  certificateId: string;
  issuedDate: string;
  verifyUrl: string;
  downloadUrl: string;
}

export function certificateIssuedHtml(v: CertificateIssuedVars): string {
  const holderName = escapeHtml(v.holderName);
  const bodyContent = `
    ${kicker('Certificate issued')}
    ${heading(`Congratulations, ${holderName}.`)}
    ${body(`Your <strong>${v.designation}</strong> certificate has been issued and is ready to download. Share the verification link with anyone who needs to confirm your credential.`)}
    ${ctaButton('Download certificate →', v.downloadUrl)}
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#637083">
      Public verification link:<br/>
      <a href="${v.verifyUrl}" style="color:#9A7A2F;word-break:break-all">${v.verifyUrl}</a>
    </p>
    ${divider()}
    <p style="margin:0;font-size:13px;line-height:1.6;color:#637083">
      <strong style="color:#071A2F">Certificate details:</strong><br/>
      Holder: ${holderName}<br/>
      Designation: ${v.designation}<br/>
      Certificate ID: <code style="font-family:monospace;font-size:12px;color:#071A2F">${v.certificateId}</code><br/>
      Issued: ${v.issuedDate}
    </p>
  `;

  return emailShell({
    preheader: `Your ${v.designation} certificate is ready — download and share`,
    body: bodyContent,
  });
}

export function certificateIssuedText(v: CertificateIssuedVars): string {
  return `Congratulations, ${v.holderName}.

Your ${v.designation} certificate has been issued.

Download certificate:
${v.downloadUrl}

Public verification link:
${v.verifyUrl}

Certificate details:
Holder: ${v.holderName}
Designation: ${v.designation}
Certificate ID: ${v.certificateId}
Issued: ${v.issuedDate}

— The AI Banking Institute
aibankinginstitute.com`;
}
