import type { ScrapbookPage, ScrapbookBlock } from "../types";

export function migrateScrapbookContent(page: ScrapbookPage): ScrapbookBlock[] {
    if (page.content.blocks && page.content.blocks.length > 0) {
        return page.content.blocks;
    }

    const blocks: ScrapbookBlock[] = [];

    // Migrate Title if present (as a special text block or simple text)
    // Actually, title is often separate in UI, but if we want it as a block... 
    // For now, let's keep title separate in the type but maybe optional in rendering if we move to full blocks.
    // The requirement is "add multiple text and image blocks".

    // Migrate Text
    if (page.content.text) {
        blocks.push({
            id: `text-${Date.now()}-migrated`,
            type: 'text',
            content: page.content.text,
            rotation: (Math.random() * 6) - 3, // Slight random rotation
            zIndex: 1
        });
    }

    // Migrate Images
    if (page.content.images && page.content.images.length > 0) {
        page.content.images.forEach((img, index) => {
            blocks.push({
                id: `img-${img.id || Date.now() + index}`,
                type: 'image',
                url: img.url,
                caption: img.caption,
                rotation: (Math.random() * 10) - 5,
                zIndex: 2 + index
            });
        });
    }

    return blocks;
}
