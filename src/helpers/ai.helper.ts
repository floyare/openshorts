export const MAX_PROMPT_LENGTH = 50
export const MAX_AI_USAGES_PER_DAY = 10
export const MAX_AI_USAGES_TRIAL_USER = 3

export const CLIENT_AI_USAGE_STORAGE_KEY = "ops_ai_usage"

export function parseAIResponse(rawText: string) {
    try {
        const cleanText = rawText
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        const json = JSON.parse(cleanText);

        if (!Array.isArray(json)) {
            throw new Error("Response is valid JSON but not an array");
        }

        return json;
    } catch (e: any) {
        throw new Error(`Failed to parse AI response: ${e.message}. Raw Output: ${rawText}`);
    }
}