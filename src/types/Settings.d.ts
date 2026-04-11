// Settings types for YOLO Dashboard

export type Theme = 'light' | 'dark' | 'system';

export interface Settings {
    fmpApiKey: string;
    openRouterApiKey: string;
    openRouterModelId: string;
    summaryPrompt: string;
    theme: Theme;
    firebaseConnectionString: string;
}
