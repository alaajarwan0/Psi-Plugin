figma.showUI(__html__, { width: 460, height: 700 });

figma.ui.onmessage = async (msg) => {
    if (msg.type === 'fetch-svg') {
        const fileUrl = msg.url;  // الحصول على الرابط الذي تم إرساله من الواجهة الأمامية

        try {
            // جلب محتوى الـ SVG من الرابط
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch SVG: ' + response.statusText);
            }
            const svgContent = await response.text();

            // تنظيف الـ SVG (إزالة الوسوم غير الضرورية)
            const cleanedSvg = svgContent.replace(/<\/?svg[^>]*>/g, '');  // إزالة الأوسمة غير الضرورية

            // محاولة تحويل الـ SVG إلى مسارات باستخدام التعبيرات المنتظمة
            const vectorPaths = convertSvgToVectorPaths(cleanedSvg);

            if (vectorPaths.length === 0) {
                figma.notify('No valid path data found in SVG.');
                return;
            }

            // إضافة الـ Vector إلى مساحة العمل
            const vectorNode = figma.createVector();
            vectorNode.vectorPaths = vectorPaths;
            vectorNode.resize(200, 200);
            vectorNode.x = figma.viewport.center.x;  // وضع الـ SVG في المنتصف
            vectorNode.y = figma.viewport.center.y;

            figma.currentPage.appendChild(vectorNode);
            figma.notify('SVG added as vector!');
        } catch (error) {
            console.error('Failed to fetch and process SVG:', error);
            figma.notify('Failed to fetch and process SVG.');
        }
    }
};

// دالة لتحويل الـ SVG إلى Vectors باستخدام التعبيرات المنتظمة
function convertSvgToVectorPaths(svgString) {
    // استخراج جميع مسارات <path> من الـ SVG باستخدام التعبير المنتظم
    const pathData = svgString.match(/<path[^>]+d="([^"]+)"/g);
    
    if (!pathData) {
        console.error("No <path> data found in SVG.");
        return [];
    }

    // تحويل كل مسار <path> إلى تنسيق قابل للاستخدام في Figma
    const vectorPaths = pathData.map(pathTag => {
        const path = pathTag.match(/d="([^"]+)"/)[1]; // استخراج قيمة "d" من كل مسار
        
        // التأكد من أن المسار يحتوي على بيانات صالحة
        if (!path || path.trim().length === 0) {
            console.error("Invalid path data:", path);
            return null;  // تجاهل المسار غير الصالح
        }

        // تصحيح تنسيق الأوامر (التأكد من أن الأوامر تأتي مع قيم صالحة)
        const correctedPath = path.replace(/([a-zA-Z])([0-9])/g, '$1 $2') // إضافة مسافة بين الأمر والرقم
                                   .replace(/([0-9])([a-zA-Z])/g, '$1 $2') // إضافة مسافة بين الرقم والأمر
                                   .replace(/v\s*[^0-9]/g, ''); // إزالة أو تصحيح الأوامر غير الصالحة مثل "v.84"
        
        // إرجاع البيانات بشكل صحيح لـ Figma
        return {
            windingRule: "NONE",  // يمكن تغييره حسب الحاجة
            data: correctedPath
        };
    }).filter(Boolean);  // إزالة العناصر null التي تحتوي على مسارات غير صالحة

    if (vectorPaths.length === 0) {
        console.error("No valid paths were found in the SVG.");
    }

    return vectorPaths;
}

