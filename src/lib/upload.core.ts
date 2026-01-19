import { UTApi, UTFile } from "uploadthing/server";
import { prisma } from "./prisma";
import { getWebsiteScreen } from "./screen.core";
import { capitalizeFirstLetter, getURLHost, tryCatch } from "./utils";

import { DEFINED_TAGS } from "@/helpers/websites.helper";
import { auth } from "./auth";
import type { ActionAPIContext } from "astro:actions";
import { debugLog } from "./log";
import { isUserBanned } from "./user.core";
import axios from "axios";
import sharp from "sharp";
import { generateEmbedding } from "./ai-vector.core";
import type { categories } from "@prisma/client";

const utapi = new UTApi({
    token: import.meta.env.UPLOADTHING_TOKEN,
});

export async function uploadFile({ fileObj }: { fileObj: File }) {
    const fileId = fileObj.name.includes('.')
        ? fileObj.name.split('.').slice(0, -1).join('.')
        : fileObj.name;
    const buffer = await fileObj.arrayBuffer();

    debugLog("ACTION", "Started uploading file with fileId:", fileId)

    const optimizedBuffer = await sharp(Buffer.from(buffer))
        .webp({ quality: 30 })
        .resize({ width: 300, height: 500 })
        .toFormat("webp")
        .toBuffer();

    debugLog("ACTION", "Deleting old file..")
    const deleteResult = await utapi.deleteFiles(fileId, { keyType: "customId" });

    debugLog("SUCCESS", 'deleted?: ', deleteResult.success, deleteResult.deletedCount)

    const file = new UTFile([optimizedBuffer], fileObj.name, {
        customId: fileId,
        type: "image/webp",
    });

    debugLog("ACTION", "Uploading...")
    const uploadResult = await utapi.uploadFiles(new File([file], fileObj.name))
    if (uploadResult?.error) {
        throw new Error("Failed to upload file: " + uploadResult.error.message);
    }

    return uploadResult?.data
}

export const uploadWebsite = async ({
    url, description, tags, captcha, context
}: { url: string, description: string, tags: string[], captcha: string, context: ActionAPIContext }) => {
    if (!tags.every(tag => DEFINED_TAGS.includes(tag))) {
        throw new Error("Invalid tags provided");
    }

    debugLog("DEBUG", "(uploadWebsite) Started uploading: ", { url, description, tags })

    const captchaVerify = import.meta.env.PROD ? await tryCatch(axios.post(`https://challenges.cloudflare.com/turnstile/v0/siteverify`, {
        secret: import.meta.env.TURNSTILE_SECRET,
        response: captcha
    })) : null

    if (import.meta.env.PROD && (captchaVerify?.data?.data.success !== true || captchaVerify.error)) {
        debugLog("ERROR", "(uploadWebsite) Captcha verification failed: ", captchaVerify?.error?.message || "Unknown error");
        throw new Error("Failed to verify captcha. Please try again.");
    }

    const currentUser = await auth.api.getSession({
        headers: context.request.headers
    })

    if (!currentUser?.user) throw new Error("User not logged in")

    const isBanned = await isUserBanned({ currentUser: currentUser.user })
    if (!!isBanned) throw new Error("Your account is banned.")

    // await new Promise(resolve => setTimeout(resolve, 2000));
    // throw new Error("test")

    // let fullHost = new URL(url).host;
    // if (fullHost.startsWith("www.")) {
    //     fullHost = fullHost.slice(4);
    // }

    // const hostParts = fullHost.split('.');
    const hostnameOnly = getURLHost(url)

    //throw new Error(hostnameOnly)

    const existingWebsite = await prisma.websites.findUnique({
        where: {
            hidden: false,
            url
        },
    });

    if (existingWebsite) {
        throw new Error("Website already exists");
    }

    debugLog("DEBUG", "(uploadWebsite) Website does not exists, working...")

    debugLog("DEBUG", "(uploadWebsite) Getting website screen...")
    const websiteScreen = await tryCatch(getWebsiteScreen(url));
    if (!websiteScreen.data || websiteScreen.error) {
        debugLog("ERROR", 'Failed while getting website screen: ' + (websiteScreen.error?.message ?? "data empty"));
    }

    debugLog("DEBUG", "(uploadWebsite) Uploading website screen...")
    const uploadResult = websiteScreen.error || !websiteScreen.data ? { data: { ufsUrl: null }, error: null } : await tryCatch(uploadFile({ fileObj: websiteScreen.data }));
    if (!uploadResult.data || uploadResult.error) {
        throw new Error('Failed while uploading website screen: ' + (uploadResult.error?.message ?? "data empty"));
    }

    const websiteName = capitalizeFirstLetter(hostnameOnly)

    const textToEmbed = `
            Name: ${websiteName}
            Description: ${description || ''}
            Tags: ${tags.join(", ")}
        `.trim();

    const vector = await tryCatch(generateEmbedding(textToEmbed));
    if (vector.error) throw new Error("Failed while generating embed: " + (vector.error.message))

    const websiteData = {
        image: uploadResult.data.ufsUrl,
        url,
        description,
        tags,
        category: "UI_UX" as categories, // TODO: something with categories
        name: websiteName,
        created_by: currentUser.user.name,
    }

    const newWebsite = await tryCatch(prisma.$transaction(async (tx) => {
        const site = await tx.websites.create({
            data: websiteData,
        });

        const vectorString = JSON.stringify(vector.data);
        await tx.$executeRaw`
        UPDATE websites
        SET embedding = ${vectorString}::vector
        WHERE id = ${site.id}::uuid
    `;

        return site;
    }));

    if (newWebsite.error) throw new Error("Website transaction failed: " + newWebsite.error.message)

    return newWebsite.data
}