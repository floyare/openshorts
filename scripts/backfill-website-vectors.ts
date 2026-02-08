import { generateEmbedding } from '@/lib/ai-vector.core';
import { debugLog } from '@/lib/log';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// pnpx vite-node scripts/backfill-website-vectors.ts
// pnpx tsx scripts/backfill-website-vectors.ts

async function main() {
    const websites = await prisma.websites.findMany();
    debugLog("ACTION", `starting backfill for ${websites.length} websites...`);

    for (const site of websites) {
        const textToEmbed = `
            Name: ${site.name}
            Description: ${site.description || ''}
            Tags: ${site.tags.join(", ")}
        `.trim();

        try {
            const vector = await generateEmbedding(textToEmbed);

            await prisma.$executeRaw`
                UPDATE websites
                SET embedding = ${JSON.stringify(vector)}::vector
                WHERE id = ${site.id}::uuid
            `;

            debugLog("SUCCESS", `updated: ${site.name}`);

            await new Promise(r => setTimeout(r, 100));

        } catch (error) {
            debugLog("ERROR", `failed ${site.name}:`, error);
        }
    }
    debugLog("SUCCESS", 'all done')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());