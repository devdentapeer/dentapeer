import { NextResponse } from "next/server";
import { auth } from "@/auth";

const B2_KEY_ID = process.env.BACKBLAZE_KEY_ID;
const B2_APP_KEY = process.env.BACKBLAZE_APPLICATION_KEY;
const B2_BUCKET_ID = process.env.BACKBLAZE_BUCKET_ID;
const B2_BUCKET_NAME = process.env.BACKBLAZE_BUCKET;
const B2_API_URL = "https://api.backblazeb2.com/b2api/v2";



async function getB2Auth() {
  const credentials = Buffer.from(`${B2_KEY_ID}:${B2_APP_KEY}`).toString("base64");
  const authResponse = await fetch(`${B2_API_URL}/b2_authorize_account`, {
    headers: { Authorization: `Basic ${credentials}` },
  });

  if (!authResponse.ok) {
    throw new Error("❌ Backblaze yetkilendirme başarısız!");
  }

  return authResponse.json();
}


async function getUploadUrl(auth) {
  const uploadResponse = await fetch(`${auth.apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: "POST",
    headers: { Authorization: auth.authorizationToken, "content-disposition": "attachment" },
    body: JSON.stringify({ bucketId: B2_BUCKET_ID }),
  });

  if (!uploadResponse.ok) {
    throw new Error("❌ Backblaze upload URL alma başarısız!");
  }

  return uploadResponse.json();
}


export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }
    const { user } = await auth();
    const b2Auth = await getB2Auth();
    
    const uploadData = await getUploadUrl(b2Auth);
    const fileBuffer = await file.arrayBuffer();
    const fileName = `models/${user.email}-${file.name}`;

    const uploadResponse = await fetch(uploadData.uploadUrl, {
      method: "POST",
      headers: {
        Authorization: uploadData.authorizationToken,
        "X-Bz-File-Name": encodeURIComponent(fileName),
        "Content-Type": file.type,
        "X-Bz-Content-Sha1": "do_not_verify",  
      },
      body: Buffer.from(fileBuffer),
    });

    if (!uploadResponse.ok) {
      throw new Error("❌ Dosya yükleme başarısız!");
    }

    const uploadResult = await uploadResponse.json();
    console.log("🚀 ~ uploadResult:", uploadResult)
    const fileUrl = `https://f003.backblazeb2.com/file/${B2_BUCKET_NAME}/${fileName}`;
   
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("❌ Backblaze yükleme hatası:", error);
    return NextResponse.json({ error: "Backblaze'e dosya yükleme hatası" }, { status: 500 });
  }
}
