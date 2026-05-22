export interface NcmApiResponse {
  status: number;
  body: Record<string, unknown>;
  cookie: string[];
}

export interface NcmApiError {
  code?: number;
  message?: string;
  [key: string]: unknown;
}
