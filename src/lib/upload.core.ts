import { UTApi, UTFile } from "uploadthing/server";
import { uuidv7 } from "uuidv7";
import getPrismaInstance from "./prisma";
import { getWebsiteScreen } from "./screen.core";
import { capitalizeFirstLetter, tryCatch } from "./utils";
import sharp from "sharp";

const utapi = new UTApi({
    token: import.meta.env.UPLOADTHING_TOKEN,
});

export async function uploadFile({ fileObj }: { fileObj: File }) {
    const fileId = uuidv7()
    const buffer = await fileObj.arrayBuffer();

    const optimizedBuffer = await sharp(Buffer.from(buffer))
        .webp({ quality: 30 })
        .resize({ width: 300, height: 500 })
        .toFormat("webp")
        .toBuffer();

    const file = new UTFile([optimizedBuffer], `${fileObj.name}`, {
        customId: fileId,
        type: "image/webp",
    });

    const uploadResult = await (await utapi.uploadFiles([file])).at(0)
    if (uploadResult?.error) {
        throw new Error("Failed to upload file: " + uploadResult.error.message);
    }

    return uploadResult?.data
}

export const uploadWebsite = async ({
    url, description, tags
}: { url: string, description: string, tags: string[] }) => {
    const prisma = getPrismaInstance();
    const existingWebsite = await prisma.websites.findUnique({
        where: {
            url
        },
    });

    if (existingWebsite) {
        throw new Error("Website already exists");
    }

    const websiteScreen = await tryCatch(getWebsiteScreen(url));
    if (!websiteScreen.data || websiteScreen.error) {
        throw new Error('Failed while getting website screen: ' + (websiteScreen.error?.message ?? "data empty"));
    }

    const uploadResult = await tryCatch(uploadFile({ fileObj: websiteScreen.data }));
    if (!uploadResult.data || uploadResult.error) {
        throw new Error('Failed while uploading website screen: ' + (uploadResult.error?.message ?? "data empty"));
    }

    let fullHost = new URL(url).host;
    if (fullHost.startsWith("www.")) {
        fullHost = fullHost.slice(4);
    }

    const hostParts = fullHost.split('.');
    const hostnameOnly = hostParts.length > 2
        ? hostParts.slice(0, hostParts.length - 2).join('.')
        : hostParts[0];

    await prisma.websites.create({
        data: {
            image: uploadResult.data.ufsUrl,
            url,
            description,
            tags,
            category: "UI_UX",
            name: capitalizeFirstLetter(hostnameOnly),
            created_by: "1234"
        },
    });

    return { success: true }
}