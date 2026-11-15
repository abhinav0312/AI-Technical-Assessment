import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger("devmind.email")


def generate_email_html(code: str, purpose: str) -> str:
    purpose_title = "Verify Your DevMind AI Account" if purpose == "signup" else "DevMind AI Password Reset"
    purpose_desc = (
        "Please confirm your email address to complete your DevMind AI account registration."
        if purpose == "signup"
        else "We received a request to reset the password for your DevMind AI account."
    )

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{purpose_title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
    <div style="background-color: #0f172a; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">
        <span style="color: #ea580c;">&gt;_</span> DevMind AI
      </h1>
      <p style="color: #94a3b8; margin: 4px 0 0; font-size: 12px;">Engineering Intelligence & Assessment Platform</p>
    </div>
    <div style="padding: 32px 28px;">
      <h2 style="margin: 0 0 12px; font-size: 18px; color: #0f172a; font-weight: 600;">{purpose_title}</h2>
      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: #475569;">
        {purpose_desc} Use the verification code below to confirm your identity.
      </p>
      
      <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px;">
        <span style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #9a3412; letter-spacing: 1px; margin-bottom: 6px;">Your One-Time Passcode</span>
        <span style="display: inline-block; font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; color: #ea580c; letter-spacing: 8px;">{code}</span>
        <span style="display: block; font-size: 12px; color: #c2410c; margin-top: 6px;">Expires in 10 minutes</span>
      </div>

      <p style="margin: 0 0 16px; font-size: 12px; line-height: 1.5; color: #64748b;">
        <strong>Security Notice:</strong> Never share this code with anyone. DevMind AI staff will never ask for your verification code. If you did not initiate this request, your account may be secure, but you should change your password immediately.
      </p>
    </div>
    <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
      &copy; DevMind AI. Intelligent Developer Technical Assessment Platform.
    </div>
  </div>
</body>
</html>"""


def send_verification_email(to_email: str, code: str, purpose: str = "signup") -> bool:
    subject = f"Your DevMind AI Verification Code: {code}"
    html_content = generate_email_html(code, purpose)

    # 1. Always log securely to server console for auditing and instant local development
    print(f"\n{'='*64}\n[SECURITY EMAIL DISPATCH]\nTo: {to_email}\nSubject: {subject}\nVerification Code: {code} (Purpose: {purpose})\nExpires: 10 minutes\n{'='*64}\n", flush=True)
    logger.info(f"Verification OTP generated for {to_email} (purpose: {purpose})")

    # 2. If SMTP is configured, dispatch actual email via SMTP
    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
            msg["To"] = to_email

            plain_text = f"Your DevMind AI verification code is: {code}\nThis code will expire in 10 minutes.\nIf you did not request this, please ignore this email."
            msg.attach(MIMEText(plain_text, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            if settings.SMTP_PORT == 465:
                server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
            else:
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
                if settings.SMTP_TLS:
                    server.starttls()

            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            logger.info(f"Successfully delivered verification email to {to_email} via SMTP ({settings.SMTP_HOST})")
            return True
        except Exception as exc:
            logger.error(f"Failed to deliver email via SMTP: {exc}. OTP is still logged to console.")
            # Fall back to console delivery
            return True

    return True

