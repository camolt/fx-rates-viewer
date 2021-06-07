const apiToken = 'fa44ad8ef5a01094e0d5e763cef64636';

export enum ApiMethodType {
    GET = 'GET',
    POST = 'POST',
    POST_MULTIPART = 'POST_MULTIPART',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH',
}

//  eslint-disable-next-line @typescript-eslint/no-explicit-any
type requestPayload = Record<string, any>;

//  eslint-disable-next-line @typescript-eslint/no-explicit-any
type requestOptions = Record<string, any> & {
    headers?: Record<string, string>;
    method: keyof typeof ApiMethodType;
};

export async function request<T> (
    path: string,
    options: requestOptions = { method: ApiMethodType.GET },
    payload?: requestPayload
): Promise<T> {
    const isGet = options.method === ApiMethodType.GET;
    const parameters = new URLSearchParams(payload);
    const query = isGet && !!payload ? `?${parameters}` : '';

    const init: RequestInit = {
        method: options.method,
        headers: {
            // 'Content-Type': 'application/json',
            // Accept: 'application/json',
            // ...options.headers,
        },
        // body: !isGet && !!payload ? (JSON.stringify(payload) as BodyInit) : null,
    };

    const request = await fetch(`http://api.exchangeratesapi.io/v1/${path}?access_key=${apiToken}${query}`, init);


    try {
        const res = (await request.json()) as T;
        return res;
    } catch (e) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return {} as T;
    }
}