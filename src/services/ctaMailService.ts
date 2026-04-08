interface SendCtaEmailArgs {
  targetEmail: string;
  senderEmail: string;
}

export async function sendCtaEmail({ targetEmail, senderEmail }: SendCtaEmailArgs): Promise<void> {
  const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      name: 'Landing CTA Visitor',
      email: senderEmail,
      subject: `New CTA message from ${senderEmail}`,
      message: `A visitor requested contact from the landing page. Reply to ${senderEmail}.`,
      _subject: `MekeshBuilds CTA inquiry (${senderEmail})`,
      _replyto: senderEmail,
      _template: 'table',
      _captcha: 'false',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send CTA email');
  }
}
