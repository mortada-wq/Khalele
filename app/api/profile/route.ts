import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, putUserProfile, type UserProfile } from "@/lib/aws/dynamodb";
import { MAX_NICKNAME_LENGTH, NICKNAME_DELAY_HOURS, hoursUntilNicknameReady } from "@/lib/nickname";

const USER_ID_HEADER = "x-user-id";
const DEFAULT_USER_ID = "anon_anonymous";

function getUserId(req: NextRequest): string {
  return req.headers.get(USER_ID_HEADER) || DEFAULT_USER_ID;
}

function normalizeProfile(profile: UserProfile | null, userId: string): UserProfile {
  const now = new Date().toISOString();
  if (!profile) {
    return {
      userId,
      preferences: {},
      nicknameFeedback: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  return {
    ...profile,
    userId,
    preferences: profile.preferences ?? {},
    nicknameFeedback: Array.isArray(profile.nicknameFeedback) ? profile.nicknameFeedback : [],
    createdAt: profile.createdAt || now,
    updatedAt: profile.updatedAt || now,
  };
}

async function ensureProfile(userId: string): Promise<UserProfile> {
  const existing = await getUserProfile(userId);
  const normalized = normalizeProfile(existing, userId);
  if (!existing) {
    await putUserProfile(normalized);
  }
  return normalized;
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const profile = await ensureProfile(userId);
    const hoursRemaining = hoursUntilNicknameReady(profile.createdAt);

    return NextResponse.json({
      profile,
      nicknameStatus: {
        delayHours: NICKNAME_DELAY_HOURS,
        ready: hoursRemaining <= 0,
        hoursRemaining,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const profile = await ensureProfile(userId);
    const body = (await req.json()) as {
      nickname?: unknown;
      languageStyle?: unknown;
      dialectRegion?: unknown;
    };

    const nextPreferences = { ...profile.preferences };

    if (body.nickname !== undefined) {
      if (typeof body.nickname !== "string") {
        return NextResponse.json({ error: "nickname must be a string" }, { status: 400 });
      }
      const nickname = body.nickname.trim().slice(0, MAX_NICKNAME_LENGTH);
      if (nickname.length === 0) {
        delete nextPreferences.nickname;
      } else {
        nextPreferences.nickname = nickname;
      }
    }

    if (body.languageStyle === "formal_msa" || body.languageStyle === "easy_arabic") {
      nextPreferences.languageStyle = body.languageStyle;
    }

    if (body.dialectRegion === "baghdad" || body.dialectRegion === "basra" || body.dialectRegion === "mosul") {
      nextPreferences.dialectRegion = body.dialectRegion;
    }

    const updated: UserProfile = {
      ...profile,
      preferences: nextPreferences,
      updatedAt: new Date().toISOString(),
    };

    if (updated.nicknameSuggestion?.status === "pending" && updated.nicknameSuggestion.value === updated.preferences.nickname) {
      updated.nicknameSuggestion = {
        ...updated.nicknameSuggestion,
        status: "accepted",
      };
    }

    await putUserProfile(updated);

    const hoursRemaining = hoursUntilNicknameReady(updated.createdAt);
    return NextResponse.json({
      profile: updated,
      nicknameStatus: {
        delayHours: NICKNAME_DELAY_HOURS,
        ready: hoursRemaining <= 0,
        hoursRemaining,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

