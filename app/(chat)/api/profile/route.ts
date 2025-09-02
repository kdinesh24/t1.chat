import { auth } from '@/app/(auth)/auth';
import { userProfile } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { NextRequest, NextResponse } from 'next/server';

// Database connection
const client = postgres(process.env.POSTGRES_URL!, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});
const db = drizzle(client);

export async function GET() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, session.user.id))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({
        name: '',
        occupation: '',
        traits: [],
        additionalInfo: '',
        disableExternalLinkWarning: false,
      });
    }

    return NextResponse.json(profile[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      occupation,
      traits,
      additionalInfo,
      disableExternalLinkWarning,
    } = body;

    const existingProfile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, session.user.id))
      .limit(1);

    if (existingProfile.length === 0) {
      const newProfile = await db
        .insert(userProfile)
        .values({
          userId: session.user.id,
          name,
          occupation,
          traits: traits || [],
          additionalInfo,
          disableExternalLinkWarning: disableExternalLinkWarning || false,
        })
        .returning();

      return NextResponse.json(newProfile[0]);
    } else {
      const updatedProfile = await db
        .update(userProfile)
        .set({
          name,
          occupation,
          traits: traits || [],
          additionalInfo,
          disableExternalLinkWarning: disableExternalLinkWarning || false,
          updatedAt: new Date(),
        })
        .where(eq(userProfile.userId, session.user.id))
        .returning();

      return NextResponse.json(updatedProfile[0]);
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 },
    );
  }
}
