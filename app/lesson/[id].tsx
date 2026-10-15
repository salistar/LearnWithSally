import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Call, StreamCall, StreamVideo, StreamVideoClient } from "@stream-io/video-react-native-sdk";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import { getLanguage } from "@/data/languages";
import { getLesson } from "@/data/lessons";
import { apiFetch } from "@/lib/api";
import { track } from "@/lib/posthog";
import { buildTeacherPrompt, CALL_TYPE, lessonCallId } from "@/lib/teacher";
import { useLearningStore } from "@/store/learningStore";
import { Lesson } from "@/types/learning";

type CallStatus = "idle" | "connecting" | "joined" | "failed";
type AgentStatus = "idle" | "connecting" | "connected" | "failed";
type Speaker = "agent" | "user";
type CaptionLine = { id: number; speaker: Speaker; text: string; final: boolean };

// Event sent by vision-agent/main.py through Stream custom events.
type TranscriptEvent = { type?: string; speaker?: Speaker; text?: string };

async function ensureMicPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return true; // iOS asks automatically (Info.plist text in app.config.js)
  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = getLesson(id);
  const { user } = useUser();
  const { getToken } = useAuth();
  const markLessonStarted = useLearningStore((s) => s.markLessonStarted);
  const completeLesson = useLearningStore((s) => s.completeLesson);

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Refs used by cleanup (state is stale inside unmount callbacks).
  const callRef = useRef<Call | null>(null);
  const clientRef = useRef<StreamVideoClient | null>(null);
  const sessionRef = useRef<string | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const endedRef = useRef(false); // lesson_completed or lesson_abandoned already sent

  const stopAgent = useCallback(async () => {
    const callId = callRef.current?.id;
    const sessionId = sessionRef.current;
    sessionRef.current = null;
    if (!callId || !sessionId) return;
    const token = await getToken();
    if (!token) return;
    const qs = `callId=${encodeURIComponent(callId)}&sessionId=${encodeURIComponent(sessionId)}`;
    await apiFetch(`/api/agent-session?${qs}`, token, { method: "DELETE" }).catch(() => {});
  }, [getToken]);

  const teardown = useCallback(async () => {
    await stopAgent();
    const c = callRef.current;
    const cl = clientRef.current;
    callRef.current = null;
    clientRef.current = null;
    await c?.leave().catch(() => {});
    await cl?.disconnectUser().catch(() => {});
  }, [stopAgent]);

  const startAgent = useCallback(
    async (callId: string) => {
      setAgentStatus("connecting");
      try {
        const token = await getToken();
        if (!token) throw new Error("Not signed in");
        const res = await apiFetch("/api/agent-session", token, {
          method: "POST",
          body: JSON.stringify({ callId }),
        });
        const data = (await res.json().catch(() => ({}))) as { sessionId?: string; error?: string };
        if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
        sessionRef.current = data.sessionId ?? null;
        setAgentStatus("connected");
      } catch (err) {
        console.warn("[lesson] agent-session failed", err);
        setErrorMessage(err instanceof Error ? err.message : "Sally could not join");
        setAgentStatus("failed");
      }
    },
    [getToken],
  );

  const startCall = useCallback(
    async (target: Lesson, isCancelled: () => boolean) => {
      if (!user) return;
      setCallStatus("connecting");
      setErrorMessage("");
      try {
        if (!(await ensureMicPermission())) throw new Error("Microphone permission is required");

        const tokenProvider = async () => {
          const clerkToken = await getToken();
          if (!clerkToken) throw new Error("Not signed in");
          const res = await apiFetch("/api/stream-token", clerkToken);
          if (!res.ok) throw new Error(`Stream token request failed (${res.status})`);
          const data = (await res.json()) as { token: string };
          return data.token;
        };

        // The API key is public, but we get it from the server so there is one source of truth.
        const clerkToken = await getToken();
        if (!clerkToken) throw new Error("Not signed in");
        const keyRes = await apiFetch("/api/stream-token", clerkToken);
        if (!keyRes.ok) throw new Error(`Stream token request failed (${keyRes.status})`);
        const { apiKey, token } = (await keyRes.json()) as { apiKey: string; token: string };

        const streamClient = StreamVideoClient.getOrCreateInstance({
          apiKey,
          token,
          tokenProvider,
          user: { id: user.id, name: user.fullName ?? user.id, image: user.imageUrl || undefined },
        });
        clientRef.current = streamClient;

        const callId = lessonCallId(target.id, user.id);
        const streamCall = streamClient.call(CALL_TYPE, callId);
        callRef.current = streamCall;

        // Audio only: no camera, mic muted until the student holds the button.
        await streamCall.camera.disable().catch(() => {});
        await streamCall.microphone.disable().catch(() => {});
        await streamCall.join({ create: true });

        // Lesson context read by the Python teacher (vision-agent/main.py).
        await streamCall.update({
          custom: {
            lesson_id: target.id,
            lesson_title: target.title,
            language: target.languageCode,
            system_prompt: buildTeacherPrompt(target),
            intro_message: target.introMessage,
          },
        });

        // The user left while we were connecting: don't leave an orphan call behind.
        if (isCancelled()) {
          await streamCall.leave().catch(() => {});
          await streamClient.disconnectUser().catch(() => {});
          return;
        }
        setClient(streamClient);
        setCall(streamCall);
        setCallStatus("joined");
        await startAgent(callId);
      } catch (err) {
        console.warn("[lesson] call failed", err);
        if (isCancelled()) return;
        setErrorMessage(err instanceof Error ? err.message : "Connection failed");
        setCallStatus("failed");
      }
    },
    [user, getToken, startAgent],
  );

  // Start on mount, clean everything on unmount.
  useEffect(() => {
    if (!lesson || !user) return;
    let cancelled = false;
    startedAtRef.current = Date.now();
    endedRef.current = false;
    markLessonStarted(lesson.id);
    track("lesson_started", { lesson_id: lesson.id, language: lesson.languageCode, lesson_number: lesson.order });
    startCall(lesson, () => cancelled);

    return () => {
      cancelled = true;
      if (!endedRef.current) {
        endedRef.current = true;
        track("lesson_abandoned", {
          lesson_id: lesson.id,
          language: lesson.languageCode,
          seconds_in_lesson: Math.round((Date.now() - startedAtRef.current) / 1000),
        });
      }
      teardown();
    };
    // Only re-run when the lesson or the user changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id, user?.id]);

  function handleFinish() {
    if (!lesson) return;
    if (!endedRef.current) {
      endedRef.current = true;
      track("lesson_completed", {
        lesson_id: lesson.id,
        language: lesson.languageCode,
        seconds_in_lesson: Math.round((Date.now() - startedAtRef.current) / 1000),
      });
    }
    completeLesson(lesson.id, lesson.xpReward);
    router.back();
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>Lesson not found</Text>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/learn")} style={{ marginTop: 16 }}>
          <Text style={styles.link}>Back to lessons</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const language = getLanguage(lesson.languageCode);
  const status = describeStatus(callStatus, agentStatus);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} accessibilityLabel="Leave lesson">
          <Ionicons name="chevron-back" size={26} color={colors.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>Sally · AI Teacher</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={[styles.dot, { backgroundColor: status.color }]} />
            <Text style={[styles.status, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <View style={styles.flagPill}>
          <Text style={{ fontSize: 18 }}>{language?.flag}</Text>
        </View>
      </View>

      {call && client && callStatus === "joined" ? (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <ActiveLesson
              call={call}
              agentStatus={agentStatus}
              onRetryAgent={() => startAgent(call.id)}
              onEnd={() => router.back()}
            />
          </StreamCall>
        </StreamVideo>
      ) : (
        <View style={styles.stage}>
          <Image source={images.mascotWelcome} style={[styles.mascot, { opacity: 0.6 }]} contentFit="contain" />
          <View style={styles.bubble}>
            {callStatus === "failed" ? (
              <>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bubbleTitle}>Connection failed</Text>
                  <Text style={styles.bubbleText}>{errorMessage}</Text>
                </View>
                <TouchableOpacity style={styles.retry} onPress={() => startCall(lesson, () => false)} accessibilityLabel="Retry">
                  <Ionicons name="refresh" size={20} color={colors.purple} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <ActivityIndicator color={colors.purple} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.bubbleTitle}>Connecting…</Text>
                  <Text style={styles.bubbleText}>Setting up your lesson</Text>
                </View>
              </>
            )}
          </View>
        </View>
      )}

      {/* Lesson content (step 12) */}
      <ScrollView style={styles.panel} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.panelTitle}>
          {lesson.icon} {lesson.title}
        </Text>
        <Text style={styles.panelText}>Goals: {lesson.goals.join(" · ")}</Text>
        {lesson.phrases.map((p) => (
          <View key={p.text} style={styles.phraseRow}>
            <Text style={styles.phrase}>{p.text}</Text>
            <Text style={styles.panelText}>
              {p.translation} — <Text style={{ fontStyle: "italic" }}>{p.pronunciation}</Text>
            </Text>
          </View>
        ))}
        <TouchableOpacity style={styles.finish} onPress={handleFinish} activeOpacity={0.85}>
          <Text style={styles.finishText}>Finish lesson · +{lesson.xpReward} XP</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Rendered inside <StreamCall>: captions, push-to-talk mic, subtitles toggle, end call. */
function ActiveLesson({
  call,
  agentStatus,
  onRetryAgent,
  onEnd,
}: {
  call: Call;
  agentStatus: AgentStatus;
  onRetryAgent: () => void;
  onEnd: () => void;
}) {
  const [talking, setTalking] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [lines, setLines] = useState<CaptionLine[]>([]);
  const nextId = useRef(1);

  // Live captions (step 17). One source only — the agent's transcript events —
  // so a sentence is never displayed twice. A partial line is updated in place
  // until its final version arrives.
  useEffect(() => {
    const unsubscribe = call.on("custom", (event) => {
      const data = (event as { custom?: TranscriptEvent }).custom ?? {};
      if (!data.text || (data.type !== "transcript_partial" && data.type !== "transcript_final")) return;
      const speaker: Speaker = data.speaker === "user" ? "user" : "agent";
      const final = data.type === "transcript_final";
      setLines((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.speaker === speaker && !last.final) {
          return [...prev.slice(0, -1), { ...last, text: data.text!, final }];
        }
        return [...prev, { id: nextId.current++, speaker, text: data.text!, final }].slice(-4);
      });
    });
    return () => unsubscribe();
  }, [call]);

  const ready = agentStatus === "connected";

  async function startTalking() {
    if (!ready) return;
    setTalking(true);
    await call.microphone.enable().catch(() => setTalking(false));
  }

  async function stopTalking() {
    setTalking(false);
    await call.microphone.disable().catch(() => {});
  }

  return (
    <>
      <View style={styles.stage}>
        <Image
          source={images.mascotWelcome}
          style={[styles.mascot, agentStatus !== "connected" && { opacity: 0.6 }]}
          contentFit="contain"
        />
        {showCaptions && lines.length > 0 ? (
          <View style={styles.captions}>
            {lines.slice(-2).map((line) => (
              <View
                key={line.id}
                style={[styles.caption, line.speaker === "agent" ? styles.captionAgent : styles.captionUser, !line.final && { opacity: 0.85 }]}
              >
                <Text style={[styles.captionWho, line.speaker === "agent" && { color: "rgba(255,255,255,0.75)" }]}>
                  {line.speaker === "agent" ? "Sally" : "You"}
                </Text>
                <Text style={[styles.captionText, line.speaker === "agent" && { color: "#fff" }]}>{line.text}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.bubble}>
            {agentStatus === "failed" ? (
              <>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bubbleTitle}>Sally is unavailable</Text>
                  <Text style={styles.bubbleText}>Is the vision-agent service running?</Text>
                </View>
                <TouchableOpacity style={styles.retry} onPress={onRetryAgent} accessibilityLabel="Retry">
                  <Ionicons name="refresh" size={20} color={colors.purple} />
                </TouchableOpacity>
              </>
            ) : agentStatus === "connected" ? (
              <View style={{ flex: 1 }}>
                <Text style={styles.bubbleTitle}>Sally is here! 🦊</Text>
                <Text style={styles.bubbleText}>Hold the mic button to answer.</Text>
              </View>
            ) : (
              <>
                <ActivityIndicator color={colors.purple} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.bubbleTitle}>Sally is joining…</Text>
                  <Text style={styles.bubbleText}>This takes a few seconds</Text>
                </View>
              </>
            )}
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.control}>
          <Pressable
            onPressIn={startTalking}
            onPressOut={stopTalking}
            disabled={!ready}
            accessibilityLabel="Hold to talk"
            style={[styles.roundButton, talking && { backgroundColor: colors.purple }, !ready && { opacity: 0.5 }]}
          >
            <Ionicons name={talking ? "mic" : "mic-outline"} size={28} color={talking ? "#fff" : colors.ink} />
          </Pressable>
          <Text style={styles.controlLabel}>{talking ? "Listening…" : "Hold to talk"}</Text>
        </View>
        <View style={styles.control}>
          <TouchableOpacity
            onPress={() => setShowCaptions((s) => !s)}
            accessibilityLabel="Toggle subtitles"
            style={[styles.roundButton, !showCaptions && { opacity: 0.5 }]}
          >
            <Ionicons name="language-outline" size={28} color={colors.ink} />
          </TouchableOpacity>
          <Text style={styles.controlLabel}>Subtitles {showCaptions ? "on" : "off"}</Text>
        </View>
        <View style={styles.control}>
          <TouchableOpacity onPress={onEnd} accessibilityLabel="End call" style={[styles.roundButton, { backgroundColor: colors.error }]}>
            <Ionicons name="call" size={26} color="#fff" style={{ transform: [{ rotate: "135deg" }] }} />
          </TouchableOpacity>
          <Text style={styles.controlLabel}>End call</Text>
        </View>
      </View>
    </>
  );
}

function describeStatus(call: CallStatus, agent: AgentStatus): { label: string; color: string } {
  if (call === "failed") return { label: "Connection failed", color: colors.error };
  if (call !== "joined") return { label: "Connecting…", color: colors.warning };
  if (agent === "connected") return { label: "Online", color: colors.success };
  if (agent === "failed") return { label: "Teacher unavailable", color: colors.error };
  return { label: "Joining…", color: colors.warning };
}

// StyleSheet here: animated/pressed states, absolute positioning and shadows
// are clearer with plain styles (see AGENTS.md "Style exceptions").
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  link: { fontFamily: "Poppins-SemiBold", color: colors.purple, fontSize: 15 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10 },
  title: { fontFamily: "Poppins-SemiBold", fontSize: 18, color: colors.ink },
  dot: { width: 8, height: 8, borderRadius: 4 },
  status: { fontFamily: "Poppins-Medium", fontSize: 13 },
  flagPill: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  stage: {
    flex: 1,
    minHeight: 260,
    marginHorizontal: 16,
    borderRadius: 28,
    backgroundColor: "#F1EEFF",
    overflow: "hidden",
  },
  mascot: { position: "absolute", top: 8, bottom: 70, left: 0, right: 0 },
  bubble: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  bubbleTitle: { fontFamily: "Poppins-SemiBold", fontSize: 15, color: colors.ink },
  bubbleText: { fontFamily: "Poppins-Regular", fontSize: 13, color: colors.muted },
  retry: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  captions: { position: "absolute", left: 14, right: 14, bottom: 14, gap: 6 },
  caption: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, elevation: 2 },
  captionAgent: { backgroundColor: colors.purple },
  captionUser: { backgroundColor: "#fff" },
  captionWho: { fontFamily: "Poppins-SemiBold", fontSize: 11, color: colors.muted },
  captionText: { fontFamily: "Poppins-Regular", fontSize: 15, color: colors.ink },
  controls: { flexDirection: "row", justifyContent: "space-evenly", paddingVertical: 16 },
  control: { alignItems: "center", gap: 6, width: 96 },
  roundButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  controlLabel: { fontFamily: "Poppins-Medium", fontSize: 12, color: colors.muted },
  panel: { maxHeight: 230, marginHorizontal: 16, marginBottom: 8, borderRadius: 20, borderWidth: 1, borderColor: "#eef0f4" },
  panelTitle: { fontFamily: "Poppins-SemiBold", fontSize: 16, color: colors.ink },
  panelText: { fontFamily: "Poppins-Regular", fontSize: 13, color: colors.muted, marginTop: 2 },
  phraseRow: { marginTop: 10 },
  phrase: { fontFamily: "Poppins-Medium", fontSize: 15, color: colors.ink },
  finish: { marginTop: 14, backgroundColor: colors.green, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  finishText: { fontFamily: "Poppins-SemiBold", fontSize: 15, color: "#fff" },
});

