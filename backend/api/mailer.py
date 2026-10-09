import os
import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def send_reset_email(to_email, reset_link):
    """
    Sends a real password reset email via SMTP.
    If SMTP credentials are not configured, it falls back to generating a local HTML file.
    """
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Reset Your Password - DermaAI</title>
        <style>
            body {{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 40px 0; }}
            .container {{ max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .logo {{ font-size: 20px; font-weight: 800; color: #013873; letter-spacing: 2px; text-transform: uppercase; }}
            h1 {{ font-size: 22px; color: #0f1b2d; margin-bottom: 15px; text-align: center; }}
            p {{ font-size: 15px; color: #4a5568; line-height: 1.6; text-align: center; margin-bottom: 30px; }}
            .btn-container {{ text-align: center; margin-bottom: 30px; }}
            .btn {{ display: inline-block; background-color: #1D9E75; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; transition: background-color 0.2s; }}
            .btn:hover {{ background-color: #15825f; }}
            .footer {{ font-size: 12px; color: #a0aec0; text-align: center; margin-top: 20px; border-top: 1px solid #edf2f7; padding-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">DermaAI</div>
            </div>
            <h1>Password Reset Request</h1>
            <p>Hello,<br><br>We received a request to reset the password for your DermaAI account associated with <strong>{to_email}</strong>. If you didn't make this request, you can safely ignore this email.</p>
            <div class="btn-container">
                <a href="{reset_link}" class="btn">Reset My Password</a>
            </div>
            <p style="font-size: 13px; color: #718096;">Or copy and paste this link into your browser:<br>
            <a href="{reset_link}" style="color: #1D9E75; word-break: break-all;">{reset_link}</a></p>
            
            <div class="footer">
                &copy; {datetime.datetime.now().year} DermaAI Project. All rights reserved.<br>
                This link will expire in 15 minutes.
            </div>
        </div>
    </body>
    </html>
    """

    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_user = os.environ.get('SMTP_USERNAME', '')
    smtp_pass = os.environ.get('SMTP_PASSWORD', '')
    from_email = os.environ.get('SMTP_FROM_EMAIL', smtp_user)

    email_sent = False

    # Attempt to send real email if credentials exist
    if smtp_user and smtp_pass and smtp_user != 'your_email@gmail.com':
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = 'Reset Your Password - DermaAI'
            msg['From'] = f"DermaAI <{from_email}>"
            msg['To'] = to_email

            part = MIMEText(html_content, 'html')
            msg.attach(part)

            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
                
            print(f"\n[MAILER] [SUCCESS] Real reset email successfully sent to {to_email}\n")
            email_sent = True
        except Exception as e:
            print(f"\n[MAILER] [ERROR] Failed to send real email via SMTP: {e}\n")
    else:
        print("\n[MAILER] [WARNING] Real SMTP credentials not set in .env.")

    # Fallback/Debug: Save to local HTML file
    if not email_sent:
        print("[MAILER] Falling back to generating local HTML file for debugging...")
        email_dir = os.path.join(os.getcwd(), 'test_emails')
        if not os.path.exists(email_dir):
            os.makedirs(email_dir)

        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"reset_email_{timestamp}.html"
        filepath = os.path.join(email_dir, filename)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print(f"[MAILER] Mock email generated! Open this file to see it: {filepath}\n")

    return True
