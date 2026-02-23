import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "udem";

  if (!file) {
    return NextResponse.json(
      { error: "Fichier requis (field: file)" },
      { status: 400 }
    );
  }

  if (!process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json(
      { error: "Cloudinary non configuré (CLOUDINARY_API_SECRET)" },
      { status: 500 }
    );
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        cloudinary.uploader.upload(
          base64,
          {
            folder,
            resource_type: "auto",
            overwrite: true,
          },
          (err, res) => {
            if (err) reject(err);
            else resolve(res as { secure_url: string });
          }
        );
      }
    );

    return NextResponse.json({ url: result.secure_url });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Échec de l'upload" },
      { status: 500 }
    );
  }
}
