import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    const tag = request.nextUrl.searchParams.get('tag');
    const secret = request.nextUrl.searchParams.get('secret');

    // Check for secret to confirm this is a valid request (e.g., from Strapi webhook)
    // You should set this secret in your .env file
    const EXPECTED_SECRET = process.env.REVALIDATION_SECRET || 'dev_secret_123';

    if (secret !== EXPECTED_SECRET) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    if (!tag) {
        return NextResponse.json({ message: 'Missing tag param' }, { status: 400 });
    }

    revalidateTag(tag, 'max');

    return NextResponse.json({ revalidated: true, now: Date.now() });
}
