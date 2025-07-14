import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const rateLimit = await convex.query(api.rateLimiting.checkRateLimit, {
      userId,
    });

    return NextResponse.json(rateLimit);
  } catch (error) {
    console.error('Rate limit check error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const newCount = await convex.mutation(api.rateLimiting.incrementMessageCount, {
      userId,
    });

    return NextResponse.json({ messageCount: newCount });
  } catch (error) {
    console.error('Rate limit increment error:', error);
    
    if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 

export async function DELETE() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const newCount = await convex.mutation(api.rateLimiting.decrementMessageCount, {
      userId,
    });

    return NextResponse.json({ messageCount: newCount });
  } catch (error) {
    console.error('Rate limit decrement error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 