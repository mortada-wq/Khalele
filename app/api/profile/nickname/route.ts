import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, putUserProfile, type UserProfile } from "@/lib/aws/dynamodb";
import {
  MAX_NICKNAME_LENGTH,
  buildNicknameSuggestion,
  hoursUntilNicknameReady,
  normalizeBehaviorSnapshot,
  normalizeReason,
} from "@/lib/nickname";

const USER_ID_HEADER = "x-user-id";
const DEFAULT_USER_ID = "anon_anonymous";
const MAX_FEEDBACK = 20;

type NicknameAction = "suggest" | "accept" | "reject" | "delete";

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

function appendFeedback(
  profile: UserProfile,
  payload: { nickname: string; reason: string; action: "rejected_suggestion" | "deleted_active" }
) {
  const list = Array.isArray(profile.nicknameFeedback) ? [...profile.nicknameFeedback] : [];
  list.unshift({ ...payload, createdAt: new Date().toISOString() });
  profile.nicknameFeedback = list.slice(0, MAX_FEEDBACK);
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const body = (await req.json()) as {
      action?: NicknameAction;
      behaviorSnapshot?: unknown;
      nickname?: unknown;
      reason?: unknown;
    };

    const action = body.action;
    if (!action) {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }

    const profile = await ensureProfile(userId);

    if (action === "suggest") {
      const waitHours = hoursUntilNicknameReady(profile.createdAt);
      if (waitHours > 0) {
        return NextResponse.json({
          profile,
          suggestion: null,
          status: {
            ready: false,
            hoursRemaining: waitHours,
          },
        });
      }

      if (profile.preferences.nickname) {
        return NextResponse.json({
          profile,
          suggestion: null,
          status: {
            ready: true,
            hasActiveNickname: true,
          },
        });
      }

      if (profile.nicknameSuggestion?.status === "pending") {
        return NextResponse.json({
          profile,
          suggestion: profile.nicknameSuggestion,
          status: {
            ready: true,
            reusedPending: true,
          },
        });
      }

      const normalizedSnapshot = normalizeBehaviorSnapshot(body.behaviorSnapshot);
      const rejectedNicknames = (profile.nicknameFeedback ?? [])
        .map((entry) => entry.nickname)
        .filter(Boolean);
      const suggestion = buildNicknameSuggestion(normalizedSnapshot, rejectedNicknames);

      const updated: UserProfile = {
        ...profile,
        behaviorSnapshot: normalizedSnapshot,
        nicknameSuggestion: {
          value: suggestion.value,
          generatedAt: new Date().toISOString(),
          status: "pending",
        },
        updatedAt: new Date().toISOString(),
      };
      await putUserProfile(updated);
      return NextResponse.json({
        profile: updated,
        suggestion: updated.nicknameSuggestion,
        tone: suggestion.tone,
        status: { ready: true },
      });
    }

    if (action === "accept") {
      const candidate =
        (typeof body.nickname === "string" ? body.nickname : profile.nicknameSuggestion?.value || "").trim().slice(0, MAX_NICKNAME_LENGTH);
      if (!candidate) {
        return NextResponse.json({ error: "nickname is required" }, { status: 400 });
      }

      const updated: UserProfile = {
        ...profile,
        preferences: {
          ...profile.preferences,
          nickname: candidate,
        },
        nicknameSuggestion: {
          value: candidate,
          generatedAt: profile.nicknameSuggestion?.generatedAt ?? new Date().toISOString(),
          status: "accepted",
        },
        updatedAt: new Date().toISOString(),
      };
      await putUserProfile(updated);
      return NextResponse.json({ profile: updated, success: true });
    }

    if (action === "reject") {
      const reason = normalizeReason(body.reason);
      if (!reason) {
        return NextResponse.json({ error: "reason is required" }, { status: 400 });
      }

      const candidate =
        (typeof body.nickname === "string" ? body.nickname : profile.nicknameSuggestion?.value || "").trim().slice(0, MAX_NICKNAME_LENGTH);
      if (!candidate) {
        return NextResponse.json({ error: "nickname is required" }, { status: 400 });
      }

      const updated: UserProfile = {
        ...profile,
        nicknameSuggestion: {
          value: candidate,
          generatedAt: profile.nicknameSuggestion?.generatedAt ?? new Date().toISOString(),
          status: "rejected",
        },
        updatedAt: new Date().toISOString(),
      };
      appendFeedback(updated, {
        nickname: candidate,
        reason,
        action: "rejected_suggestion",
      });
      await putUserProfile(updated);
      return NextResponse.json({
        profile: updated,
        success: true,
        message: "خليل قال: وصلت الرسالة، خليني أرجع لك بلقب أضبط.",
      });
    }

    if (action === "delete") {
      const reason = normalizeReason(body.reason);
      if (!reason) {
        return NextResponse.json({ error: "reason is required" }, { status: 400 });
      }
      const activeNickname = profile.preferences.nickname?.trim() ?? "";
      if (!activeNickname) {
        return NextResponse.json({ error: "No active nickname to delete" }, { status: 400 });
      }

      const nextPreferences = { ...profile.preferences };
      delete nextPreferences.nickname;

      const updated: UserProfile = {
        ...profile,
        preferences: nextPreferences,
        updatedAt: new Date().toISOString(),
      };
      appendFeedback(updated, {
        nickname: activeNickname,
        reason,
        action: "deleted_active",
      });
      await putUserProfile(updated);
      return NextResponse.json({
        profile: updated,
        success: true,
        message: "تم حذف اللقب. خليل أخذ الملاحظة بمحبة.",
      });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    console.error("Nickname action error:", error);
    return NextResponse.json(
      { error: "Failed nickname action", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

