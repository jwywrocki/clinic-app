export class HttpError extends Error {
    constructor(public statusCode: number, message: string, public digest?: string) {
        super(message);
        this.name = 'HttpError';
    }
}

export function createHttpError(statusCode: number, message?: string): HttpError {
    const defaultMessages: Record<number, string> = {
        400: 'Bad Request - Nieprawidłowe żądanie',
        401: 'Unauthorized - Brak autoryzacji',
        403: 'Forbidden - Brak uprawnień',
        404: 'Not Found - Nie znaleziono',
        500: 'Internal Server Error - Błąd serwera',
        502: 'Bad Gateway - Błąd bramy',
        503: 'Service Unavailable - Serwis niedostępny',
        504: 'Gateway Timeout - Przekroczono limit czasu',
    };

    const errorMessage = message || defaultMessages[statusCode] || 'Unknown Error';
    return new HttpError(statusCode, errorMessage);
}

export function handleApiError(error: unknown): HttpError {
    if (error instanceof HttpError) {
        return error;
    }

    if (error instanceof Error) {
        // Próbuj wyciągnąć kod statusu z wiadomości błędu
        const statusMatch = error.message.match(/(\d{3})/);
        if (statusMatch) {
            const statusCode = Number.parseInt(statusMatch[1]);
            return createHttpError(statusCode, error.message);
        }
    }

    // Domyślny błąd serwera
    return createHttpError(500, 'Wystąpił nieoczekiwany błąd');
}
