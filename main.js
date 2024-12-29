figma.showUI(__html__, { width: 460, height: 700 });

figma.ui.onmessage = async (msg) => {
    if (msg.type === 'fetch-png') {
        const { imageBuffer, name } = msg;
        try {
            const image = figma.createImage(new Uint8Array(imageBuffer));
            const imageRect = figma.createRectangle();
            imageRect.fills = [
                {
                    type: 'IMAGE',
                    scaleMode: 'FIT',
                    imageHash: image.hash,
                },
            ];
            imageRect.x = figma.viewport.center.x;
            imageRect.y = figma.viewport.center.y;

            figma.currentPage.appendChild(imageRect);
            figma.notify(`${name} added to workspace!`);
        } catch (error) {
            console.error('Failed to add PNG:', error);
            figma.notify('Failed to add PNG.');
        }
    }

    if (msg.type === 'add-color-style') {
        const colorHex = msg.color;
        try {
            const paintStyle = figma.createPaintStyle();
            paintStyle.name = `Color ${colorHex}`;
            paintStyle.paints = [{ type: 'SOLID', color: hexToRgb(colorHex) }];
            figma.notify(`Color ${colorHex} added to styles!`);
        } catch (error) {
            console.error('Failed to add color style:', error);
            figma.notify('Failed to add color style.');
        }
    }

    // Code for adding font style with error handling
    if (msg.type === 'add-text-style') {
        const fontName = msg.fontName;
        try {
            // Ensure the font is loaded before applying
            await loadFont(fontName);

            const textStyle = figma.createTextStyle();
            textStyle.name = `Font: ${fontName}`;
            textStyle.fontName = { family: fontName, style: 'Regular' };

            figma.notify(`Text style "${fontName}" added successfully!`);
        } catch (error) {
            console.error('Failed to add text style:', error);
            figma.notify(`Failed to add text style for "${fontName}".`);
        }
    }
};

// Function to load the font before applying
async function loadFont(fontName) {
    try {
        await figma.loadFontAsync({ family: fontName, style: 'Regular' });
    } catch (error) {
        throw new Error(`Font "${fontName}" could not be loaded.`);
    }
}

// Function to convert hex to RGB
function hexToRgb(hex) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;
    return { r, g, b };
}
