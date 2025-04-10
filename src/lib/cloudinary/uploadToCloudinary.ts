import { cloudinary } from "./cloudinary";

type UploadOptions = {
    folder: string;
    resource_type?: 'image' | 'video' | 'auto'
}

export async function uploadToCloudinary(file: File, options: UploadOptions) {
    const { folder, resource_type = "image" } = options

    if (resource_type === "image" && !file.type.startsWith("image/")) {
        throw new Error("File is not an Image")
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise<any>((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({ folder, resource_type }, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            })
            .end(buffer);
    });
}