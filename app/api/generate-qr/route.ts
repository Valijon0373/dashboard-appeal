import { NextResponse } from "next/server"
import QRCode from "qrcode"

export async function POST(request: Request) {
  try {
    const { data, size = 200 } = await request.json()

    if (!data) {
      return NextResponse.json({ error: "Data is required" }, { status: 400 })
    }

    // Generate QR code as data URL
    const qrCodeImage = await QRCode.toDataURL(data, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    return NextResponse.json({ qrCode: qrCodeImage })
  } catch (error) {
    console.error("QR generation error:", error)
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 })
  }
}
