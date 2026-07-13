import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}`,
        {
            headers: {
                "x-cg-demo-api-key":
                    process.env.COINGECKO_API_KEY!,
            },
            cache: "no-store",
        }
    );

    const data = await res.json();

    return NextResponse.json(data);
}