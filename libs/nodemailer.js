import nodemailer from "nodemailer";

export async function sendVerificationRequest({
    identifier: email,
    url,
    provider: { server, from, theme },
  }) {
    const { host } = new URL(url);
    const transport = nodemailer.createTransport(server);

    const html = `
      <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Hoş Geldiniz - Dentapeer</title>
<style>
/* Genel Stil */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f4f4f4;
  color: #333;
}
.container {
  max-width: 600px;
  margin: 40px auto;
  background-color: #ffffff;
  padding: 40px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}
.logo {
  margin-bottom: 24px;
  max-height: 48px;
}
.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #222;
}
.text {
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 24px;
  color: #555;
}
.button {
  display: inline-block;
  background-color: #007bff;
  color: #ffffff !important;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
}
.button:hover {
  background-color: #0056b3;
}
.footer {
  font-size: 14px;
  color: #777;
  border-top: 1px solid #eaeaea;
  padding-top: 20px;
  margin-top: 32px;
}

/* Koyu Tema Desteği */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #121212;
    color: #ddd;
  }
  .container {
    background-color: #1e1e1e;
    color: #ddd;
  }
  .title {
    color: #ffffff;
  }
  .text {
    color: #bbbbbb;
  }
  .button {
    background-color: #1e90ff;
  }
  .button:hover {
    background-color: #007bff;
  }
  .footer {
    color: #888;
    border-top: 1px solid #444;
  }
}
</style>
</head>
<body>
<div class="container">
<img src="${theme.logo}" alt="Dentapeer Logo" class="logo">
<h1 class="title">Dentapeer'a Hoşgeldiniz</h1>
<p class="text">Aşağıdaki butonla giriş yapınız.</p>
<a href="${url}" class="button">Giriş Yap</a>
<p class="text">
  Eğer siz giriş yapmak istemiyorsanız bu e-postayı yok sayabilirsiniz.
</p>
<div class="footer">
  <p>Bu link 24 saat sonra geçersiz hale gelecektir. Yeni bir giriş linki almak için tekrar giriş yapmayı deneyiniz.</p>
</div>
</div>
</body>
</html>

    `;

    await transport.sendMail({
      to: email,
      from,
      subject: `Sign in to ${host}`,
      html,
    });
  }

export async function generateVerificationToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}