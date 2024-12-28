figma.showUI(__html__, { width: 460, height: 700 });

figma.ui.onmessage = async (msg) => {
    if (msg.type === 'fetch-png') {
        try {
            const imageData = new Uint8Array(msg.imageBuffer); // استلام البيانات كـ Uint8Array
            const image = figma.createImage(imageData);

            const imageRect = figma.createRectangle();
            imageRect.fills = [
                {
                    type: 'IMAGE',
                    imageHash: image.hash,
                    scaleMode: 'FIT',
                },
            ];

            imageRect.resize(250, 250); // تعديل الأبعاد
            imageRect.x = figma.viewport.center.x; // وضع العنصر في المنتصف
            imageRect.y = figma.viewport.center.y;

            figma.currentPage.appendChild(imageRect);
            figma.notify(`PNG (${msg.name}) added to canvas!`);
        } catch (error) {
            console.error('Error adding PNG to Figma:', error);
            figma.notify('Failed to add PNG to Figma.');
        }
    }
};
