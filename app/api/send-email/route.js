import nodemailer from "nodemailer"

export async function POST(req) {
  try {
    const { name, email, phone, message } = await req.json()

    // ✅ Step 1: Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // ✅ Step 2: Email HTML Template (Modern Look)
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #e5e5e5; padding: 30px;">
        <div style="max-width: 600px; background: #111; border: 1px solid #16a34a40; border-radius: 16px; overflow: hidden; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #16a34a, #22c55e); padding: 20px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">📬 New Contact Message</h1>
            <p style="color: #e5ffe5; margin: 4px 0 0;">from your portfolio website</p>
          </div>
          
          <div style="padding: 25px;">
            <h2 style="color: #22c55e; font-size: 20px; margin-bottom: 10px;">👤 Contact Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; color: #aaa;">Name:</td>
                <td style="padding: 8px; color: #fff; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #aaa;">Email:</td>
                <td style="padding: 8px; color: #fff; font-weight: 600;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #aaa;">Phone:</td>
                <td style="padding: 8px; color: #fff; font-weight: 600;">${phone || "Not Provided"}</td>
              </tr>
            </table>

            <div style="margin-top: 25px;">
              <h2 style="color: #22c55e; font-size: 20px;">💬 Message</h2>
              <p style="background: #1a1a1a; padding: 15px; border-left: 4px solid #22c55e; border-radius: 6px; color: #ddd; white-space: pre-line;">
                ${message}
              </p>
            </div>

            <div style="margin-top: 30px; text-align: center; border-top: 1px solid #222; padding-top: 20px;">
              <p style="color: #aaa; font-size: 14px;">
                Sent via <span style="color: #22c55e;">Your Portfolio Website</span><br>
                ${new Date().toLocaleString()}
              </p>
              <a href="mailto:${email}" style="display:inline-block; margin-top:10px; background:#16a34a; color:#000; text-decoration:none; padding:10px 18px; border-radius:8px; font-weight:600;">
                Reply to ${name}
              </a>
            </div>
          </div>
        </div>
      </div>
    `

    // ✅ Step 3: Send the email
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: `📩 New Inquiry from ${name}`,
      html: htmlContent,
    }

    await transporter.sendMail(mailOptions)

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error("Error sending email:", error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    )
  }
}
