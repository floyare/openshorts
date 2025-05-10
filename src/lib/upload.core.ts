import { UTApi, UTFile } from "uploadthing/server";
import { uuidv7 } from "uuidv7";
import getPrismaInstance from "./prisma";
import { getWebsiteScreen } from "./screen.core";
import { capitalizeFirstLetter, tryCatch } from "./utils";
import sharp from "sharp";
import { DEFINED_TAGS } from "@/helpers/websites.helper";
import { auth } from "./auth";
import type { ActionAPIContext } from "astro:actions";
import { debugLog } from "./log";

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
    url, description, tags, context
}: { url: string, description: string, tags: string[], context: ActionAPIContext }) => {
    if (!tags.every(tag => DEFINED_TAGS.includes(tag))) {
        throw new Error("Invalid tags provided");
    }

    debugLog("DEBUG", "(uploadWebsite) Started uploading: ", { url, description, tags })

    const currentUser = await auth.api.getSession({
        headers: context.request.headers
    })

    if (!currentUser?.user) throw new Error("User not logged in")

    // await new Promise(resolve => setTimeout(resolve, 2000));
    // throw new Error("test")

    let fullHost = new URL(url).host;
    if (fullHost.startsWith("www.")) {
        fullHost = fullHost.slice(4);
    }

    const hostParts = fullHost.split('.');
    const hostnameOnly = hostParts.slice(0, -1).join('.');

    //throw new Error(hostnameOnly)

    const prisma = getPrismaInstance();
    const existingWebsite = await prisma.websites.findUnique({
        where: {
            url
        },
    });

    if (existingWebsite) {
        throw new Error("Website already exists");
    }

    debugLog("DEBUG", "(uploadWebsite) Website does not exists, working...")

    debugLog("DEBUG", "(uploadWebsite) Getting website screen...")
    const websiteScreen = await tryCatch(getWebsiteScreen(url)); // TODO: optimize getWebsiteScreen to work faster
    if (!websiteScreen.data || websiteScreen.error) {
        debugLog("ERROR", 'Failed while getting website screen: ' + (websiteScreen.error?.message ?? "data empty"));
    }

    debugLog("DEBUG", "(uploadWebsite) Uploading website screen...")
    const uploadResult = websiteScreen.error || !websiteScreen.data ? { data: { ufsUrl: null }, error: null } : await tryCatch(uploadFile({ fileObj: websiteScreen.data }));
    if (!uploadResult.data || uploadResult.error) {
        throw new Error('Failed while uploading website screen: ' + (uploadResult.error?.message ?? "data empty"));
    }

    await prisma.websites.create({
        data: {
            image: uploadResult.data.ufsUrl,
            url,
            description,
            tags,
            category: "UI_UX", // TODO: something with categories
            name: capitalizeFirstLetter(hostnameOnly),
            created_by: currentUser.user.name
        },
    });

    return true
}