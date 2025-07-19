/* eslint-disable @typescript-eslint/no-explicit-any */
import { pipeline } from '@xenova/transformers';

export class RealImageAI {
    private static captionModel: any = null;
    private static classificationModel: any = null;

    static async initialize() {
        console.log('🤖 Loading AI models...');

        // Image captioning - מתאר מה רואה בתמונה
        this.captionModel = await pipeline(
            'image-to-text',
            'Xenova/vit-gpt2-image-captioning'
        );

        // Image classification - מזהה אובייקטים
        this.classificationModel = await pipeline(
            'image-classification',
            'Xenova/vit-base-patch16-224'
        );
    }

    static async analyzeImage(file: File): Promise<{ description: string, tags: string[] }> {
        await RealImageAI.initialize();
        const imageUrl = URL.createObjectURL(file);

        try {
            // יצירת תיאור
            const captionsResult = await this.captionModel(imageUrl);
            const captions = Array.isArray(captionsResult) ? captionsResult : [captionsResult];
            const description = captions[0]?.generated_text || "An image";

            // זיהוי אובייקטים
            const classificationsResult = await this.classificationModel(imageUrl);
            const classifications = Array.isArray(classificationsResult) ? classificationsResult : [classificationsResult];
            const tags = classifications
                .slice(0, 8)
                .filter((c: any) => c.score > 0.1)
                .map((c: any) => c.label.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_'));

            URL.revokeObjectURL(imageUrl);

            return { description, tags };
        } catch (error) {
            URL.revokeObjectURL(imageUrl);
            throw error;
        }
    }
}
