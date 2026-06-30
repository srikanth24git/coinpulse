'use server';

import qs from 'query-string';

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

type CoingeckoErrorBody = {
    error?: string;
};

if(!BASE_URL) throw new Error("Couldn't get base url!");
if(!API_KEY) throw new Error("Couldn't get API key!");

const VALID_API_KEY = API_KEY;

export async function fetcher<T>(
    endpoint: string,
    params?: QueryParams,
    revalidate = 60,
): Promise<T> {

    const url= qs.stringifyUrl({
        url : `${BASE_URL}/${endpoint}`,
        query:params,
    },{skipEmptyString: true, skipNull: true});


    console.log("URL:", url);
    const response = await fetch(url, {
        headers: {
        "x-cg-demo-api-key": VALID_API_KEY,
         "Content-Type": "application/json",
},
        next:{ revalidate },
    });

    if (!response.ok) {
        const text = await response.text();

        console.log("Status:", response.status);
        console.log("Response:", text);

        throw new Error(`API Error: ${response.status}: ${text}`);
    }

    return response.json();
}
