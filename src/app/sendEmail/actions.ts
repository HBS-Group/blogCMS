"use server";
import nodemailer from "nodemailer";
// OPTIONAL: For programmatic CSS inlining (recommended for production)
import juice from "juice";

export async function sendEmailAction(
  recipient: string,
  subject: string,
  body: string,
  customLogo?: string,
  customStamp?: string
) {
  // Validate SMTP configuration first
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  ) {
    console.error("SMTP configuration is incomplete");
    return {
      success: false,
      message: "Email server is not configured properly",
    };
  }

  try {
    // Get company info from environment variables
    const companyName =
      process.env.NEXT_PUBLIC_COMPANY_NAME || "Hyper Business Solution";
    const companyAddress =
      process.env.NEXT_PUBLIC_COMPANY_ADDRESS ||
      "30 A, Asmaa Fahmy, Nasr City, Cairo, Egypt";
    const fromEmail = process.env.SMTP_FROM_EMAIL || "karimmorsi@hbs-group.xyz";

    // Create a transporter object using SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Get public URLs for uploaded images if they exist
    const logoUrl =
      customLogo ||
      process.env.NEXT_PUBLIC_DEFAULT_LOGO_URL ||
      "https://cvmjchleuqfblycohmdk.supabase.co/storage/v1/object/public/email-assets//Hyper%20Business%20Solution_b.png";
    const stampUrl =
      customStamp ||
      process.env.NEXT_PUBLIC_DEFAULT_STAMP_URL ||
      "https://cvmjchleuqfblycohmdk.supabase.co/storage/v1/object/public/email-assets//Karim%20Stamp.png";

    // --- NEW HTML EMAIL TEMPLATE ---
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        <style>
            /* Reset & Base Styles */
            body {
                margin: 0;
                padding: 0;
                width: 100% !important;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                background-color: #f4f4f7;
            }
            table {
                border-collapse: collapse;
            }
            img {
                border: 0;
                height: auto;
                line-height: 50%;
                outline: none;
                text-decoration: none;
                -ms-interpolation-mode: bicubic; /* Improves image rendering in Outlook */
            }
            
            a {
                color: #007bff;
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }

            /* Email Container */
            .email-wrapper {
                width: 100%;
                background-color: #f4f4f7;
                padding: 20px 0;
            }
            .email-container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            }

            /* Header */
            .header {
                padding: 30px 40px;
                text-align: center;
                border-bottom: 1px solid #eeeeee;
            }
            .logo {
                max-width: 100px;
                height: auto;
            }

            /* Content Area */
        .content {
            padding: 30px 40px;
            font-size: 16px;
        }

        .content h1,
        .content h2,
        .content h3 {

            color: #111111;
            font-weight: 600;
        }

        .content h1 {
            font-size: 24px;
        }

        .content h2 {
            font-size: 20px;
        }

        .content h3 {
            font-size: 18px;
        }

            /* Button Styles */
            .button-cta {
                display: inline-block;
                background-color: #007bff;
                color: #ffffff !important;
                padding: 12px 25px;
                text-decoration: none !important;
                border-radius: 5px;
                font-weight: bold;
                margin: 15px 0;
                text-align: center;
                border: none;
                cursor: pointer;
            }
            .button-cta:hover {
                background-color: #0056b3;
                text-decoration: none !important;
            }

            /* Footer */
            .footer {
                background-color: #f9f9f9;
                padding: 30px 40px;
                text-align: center;
                font-size: 13px;
                color: #777777;
                border-top: 1px solid #eeeeee;
            }
            .stamp {
                max-width: 100%;
                height: auto;
                margin-bottom: 15px;
            }
            .footer p {
                margin-bottom: 10px;
            }
            .footer a {
                color: #007bff;
            }
            .social-links a {
                display: inline-block;
                margin: 0 8px;
            }
            .unsubscribe-link {
                 margin-top: 15px;
            }
            .unsubscribe-link a {
                color: #555555;
                text-decoration: underline;
            }

            /* Responsive Styles */
            @media screen and (max-width: 600px) {
                .email-wrapper {
                    padding: 10px 0;
                }
                .email-container {
                    width: 100% !important;
                    border-radius: 0;
                    box-shadow: none;
                    border-left: none;
                    border-right: none;
                }
                .header, .content, .footer {
                    padding-left: 20px !important;
                    padding-right: 20px !important;
                }
                .logo {
                    max-width: 150px !important;
                }
                .content {
                    font-size: 15px !important;
                }
                 .content h1 { font-size: 22px !important; }
                 .content h2 { font-size: 18px !important; }
                 .content h3 { font-size: 16px !important; }
            }
        </style>
    </head>
    <body>
       
            <div class="email-container">
                <!-- Header -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td class="header">
                            <img src="${logoUrl}" alt="${companyName} Logo" class="logo">
                        </td>
                    </tr>
                </table>

                <!-- Email Content -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td class="content">
                            ${body}
                            
                        </td>
                    </tr>
                </table>

                <!-- Footer -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td class="footer">
                            ${
                              stampUrl
                                ? `<img src="${stampUrl}" alt="${companyName} Stamp" class="stamp"><br>`
                                : ""
                            }
                            <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
                            <p>${companyAddress}</p>
                            <p class="social-links">
                                <a href="${
                                  process.env.NEXT_PUBLIC_WEBSITE_URL || "#"
                                }">Website</a> |
                                <a href="${
                                  process.env.NEXT_PUBLIC_LINKEDIN_URL || "#"
                                }">LinkedIn</a> |
                                <a href="${
                                  process.env.NEXT_PUBLIC_FACEBOOK_URL || "#"
                                }">Facebook</a>
                            </p>
                           
                        </td>
                    </tr>
                </table>
            </div>
           
        </div>
        
                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
    // Inline CSS using juice
    const inlinedHtml = juice(htmlTemplate);
    // console.log(inlinedHtml);

    const textVersion = `
${subject}

${body}

---
Best regards,
${companyName}

${companyAddress}
Website: ${process.env.NEXT_PUBLIC_WEBSITE_URL || "Not available"}
LinkedIn: ${process.env.NEXT_PUBLIC_LINKEDIN_URL || "Not available"}
Facebook: ${process.env.NEXT_PUBLIC_FACEBOOK_URL || "Not available"}


If you'd like to unsubscribe, please reply to this email with the subject "Unsubscribe" or visit #YOUR_UNSUBSCRIBE_LINK#. 
    `;

    // Send mail with defined transport object
    const mailOptions = {
      from: `"${companyName}" <${fromEmail}>`,
      to: recipient,
      subject: subject,
      text: textVersion,
      html: inlinedHtml, // Or use `inlinedHtml` if you implement CSS inlining
    };

    console.log("Attempting to send email with configuration:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      fromEmail: fromEmail,
      to: recipient,
      subject: subject,
    });

    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent successfully: ${info.messageId}`);
    return {
      success: true,
      message: `Email sent successfully: ${info.messageId}`,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to send email";
    // Log more details if available
    if (error instanceof Error && "response" in error) {
      console.error(
        "SMTP Server Response:",
        (error as { response?: unknown }).response
      );
    }
    return {
      success: false,
      message: errorMessage,
      error: "Unknown error structure",
    };
  }
}
