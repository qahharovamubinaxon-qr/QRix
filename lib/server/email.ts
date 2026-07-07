/**
 * Transactional email abstraction. EMAIL_DRIVER: console (default, logs the
 * message — perfect for dev/mock), resend (RESEND_API_KEY) or smtp
 * (EMAIL_SERVER). Templates cover the full lifecycle. SERVER ONLY.
 */
import { serverConfig } from "./config";
import { escapeHtml } from "./security";

export interface Mail { to: string; subject: string; html: string; text?: string }

async function sendViaResend(mail: Mail): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${serverConfig.email.resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: serverConfig.email.from, ...mail }),
  });
  return res.ok;
}

async function sendViaMailgun(mail: Mail): Promise<boolean> {
  const domain = process.env.MAILGUN_DOMAIN?.trim();
  const key = process.env.MAILGUN_API_KEY?.trim();
  if (!domain || !key) return false;
  const form = new URLSearchParams({ from: serverConfig.email.from, to: mail.to, subject: mail.subject, html: mail.html, ...(mail.text ? { text: mail.text } : {}) });
  const res = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`api:${key}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  return res.ok;
}

/** Minimal SMTP over implicit TLS (port 465) — zero-dependency.
    EMAIL_SERVER=smtps://user:pass@host:465 */
async function sendViaSmtp(mail: Mail): Promise<boolean> {
  const url = serverConfig.email.smtp;
  if (!url) return false;
  try {
    const u = new URL(url);
    const tls = await import("tls");
    const sock = tls.connect({ host: u.hostname, port: Number(u.port || 465), servername: u.hostname });
    const read = () => new Promise<string>((res, rej) => {
      sock.once("data", (d) => res(d.toString()));
      sock.once("error", rej);
      setTimeout(() => rej(new Error("smtp_timeout")), 10_000);
    });
    const send = async (line: string) => { sock.write(line + "\r\n"); return read(); };
    await new Promise<void>((res, rej) => { sock.once("secureConnect", () => res()); sock.once("error", rej); });
    await read(); // banner
    await send(`EHLO qrix`);
    await send(`AUTH LOGIN`);
    await send(Buffer.from(decodeURIComponent(u.username)).toString("base64"));
    const auth = await send(Buffer.from(decodeURIComponent(u.password)).toString("base64"));
    if (!auth.startsWith("235")) throw new Error("smtp_auth_failed");
    const fromAddr = serverConfig.email.from.match(/<(.+)>/)?.[1] || serverConfig.email.from;
    await send(`MAIL FROM:<${fromAddr}>`);
    await send(`RCPT TO:<${mail.to}>`);
    await send(`DATA`);
    const body = [
      `From: ${serverConfig.email.from}`, `To: ${mail.to}`, `Subject: ${mail.subject}`,
      `MIME-Version: 1.0`, `Content-Type: text/html; charset=utf-8`, ``,
      mail.html.replace(/^\./gm, ".."), `.`,
    ].join("\r\n");
    const done = await send(body);
    sock.end();
    return done.startsWith("250");
  } catch (e) {
    console.error("[email:smtp]", e);
    return false;
  }
}

export async function sendMail(mail: Mail): Promise<boolean> {
  switch (serverConfig.email.driver) {
    case "resend": return sendViaResend(mail);
    case "mailgun": return sendViaMailgun(mail);
    case "smtp": return sendViaSmtp(mail);
    default:
      console.log(`[email] → ${mail.to}\n  ${mail.subject}`);
      return true;
  }
}

/** Health flag for monitoring. */
export const emailReady = () =>
  serverConfig.email.driver !== "console" &&
  (serverConfig.email.driver !== "resend" || !!serverConfig.email.resendKey) &&
  (serverConfig.email.driver !== "mailgun" || (!!process.env.MAILGUN_DOMAIN && !!process.env.MAILGUN_API_KEY)) &&
  (serverConfig.email.driver !== "smtp" || !!serverConfig.email.smtp);

// ── Templates ───────────────────────────────────────────────────────────
const shell = (title: string, body: string, cta?: { label: string; url: string }) => `
<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;background:#0b0b0f;color:#f4f4f6;border-radius:16px;padding:32px">
  <div style="font-weight:800;font-size:20px;margin-bottom:16px"><span style="color:#e1ff04">QR</span>ix</div>
  <h1 style="font-size:18px;margin:0 0 12px">${escapeHtml(title)}</h1>
  <div style="font-size:14px;line-height:1.6;color:#c9c9d4">${body}</div>
  ${cta ? `<a href="${cta.url}" style="display:inline-block;margin-top:20px;background:#e1ff04;color:#0b0b0f;font-weight:700;padding:12px 22px;border-radius:12px;text-decoration:none">${escapeHtml(cta.label)}</a>` : ""}
  <p style="font-size:11px;color:#6b6b78;margin-top:28px">QRix — all-in-one QR, PDF, Image, AI & Video tools.</p>
</div>`;

export const emails = {
  welcome: (to: string, name?: string) => sendMail({
    to, subject: "Welcome to QRix 🎉",
    html: shell(`Welcome${name ? `, ${escapeHtml(name)}` : ""}!`, "Your account is ready. 150+ tools, favorites, history and cloud processing are waiting.", { label: "Open dashboard", url: "https://qrix.app/dashboard" }),
  }),
  verify: (to: string, url: string) => sendMail({
    to, subject: "Verify your email",
    html: shell("Confirm your email address", "Click the button below to verify this address. The link expires in 30 minutes.", { label: "Verify email", url }),
  }),
  magicLink: (to: string, url: string) => sendMail({
    to, subject: "Your QRix sign-in link",
    html: shell("Sign in to QRix", "Use this one-time link to sign in. It expires in 30 minutes.", { label: "Sign in", url }),
  }),
  resetPassword: (to: string, url: string) => sendMail({
    to, subject: "Reset your password",
    html: shell("Password reset", "Someone requested a password reset for this account. If it was you, continue below.", { label: "Reset password", url }),
  }),
  subscriptionStarted: (to: string, plan: string) => sendMail({
    to, subject: `Your ${plan} plan is active`,
    html: shell("Subscription active", `Your <b>${escapeHtml(plan)}</b> plan is now active. Enjoy the full platform.`, { label: "Manage billing", url: "https://qrix.app/account" }),
  }),
  invoice: (to: string, amount: number, url?: string) => sendMail({
    to, subject: "Your QRix invoice",
    html: shell("Payment received", `We received your payment of <b>$${(amount / 100).toFixed(2)}</b>. Thank you!`, url ? { label: "View invoice", url } : undefined),
  }),
  notification: (to: string, title: string, body: string) => sendMail({
    to, subject: title, html: shell(title, escapeHtml(body)),
  }),
};
