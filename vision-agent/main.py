"""Sally — the AI voice teacher of LearnWithSally.

Run locally (second terminal, from this folder):
    uv sync
    uv run main.py serve

The Expo API route app/api/agent-session+api.ts asks this service to join a
Stream call. The mobile app stores the lesson context in the call's `custom`
data (system_prompt, intro_message, language, lesson_title) and this service
reads it before joining.

Never expose this service directly to the internet: it has no authentication
of its own. Only the Expo server should be able to reach it.
"""

import os

from dotenv import load_dotenv

HERE = os.path.dirname(__file__)
load_dotenv(os.path.join(HERE, "..", ".env"))  # shared keys
load_dotenv(os.path.join(HERE, ".env"), override=True)  # local overrides

from getstream.models import MemberRequest  # noqa: E402
from openai.types.realtime.realtime_transcription_session_audio_input_turn_detection_param import (  # noqa: E402
    ServerVad,
)
from vision_agents.core import Agent, AgentLauncher, Runner, User  # noqa: E402
from vision_agents.core.instructions import Instructions  # noqa: E402
from vision_agents.core.llm.events import (  # noqa: E402
    RealtimeAgentSpeechTranscriptionEvent,
    RealtimeUserSpeechTranscriptionEvent,
)
from vision_agents.plugins import getstream, openai  # noqa: E402

AGENT_USER_ID = "ai-teacher"  # must match lib/teacher.ts

LANGUAGE_NAMES = {
    "es": "Spanish",
    "fr": "French",
    "ja": "Japanese",
    "ko": "Korean",
    "de": "German",
    "zh": "Mandarin Chinese",
}

# Used only if the app did not send a lesson-specific prompt.
DEFAULT_INSTRUCTIONS = """You are Sally, a warm and playful language teacher (a friendly fox) in a live voice lesson.
Teach ONE short word or phrase at a time: say it, explain its meaning in English and give one pronunciation tip.
Then ask the student ONE question (for example "Can you say it?") and STOP. Your turn ends at the question mark.
Never imagine or simulate the student's answer. Never praise the student if they have not actually spoken.
When the student speaks, react to what you really heard in one or two short sentences: correct or encourage, then continue.
Stay within the lesson vocabulary."""


class CaptionedRealtime(openai.Realtime):
    """Bridge VisionAgents 0.6 transcript output to its legacy event bus.

    The pinned SDK sends transcripts to the inference output stream, while
    the speech event classes remain defined but are no longer emitted there.
    Preserve inference behavior and also publish the caption events we consume.
    """

    def _emit_agent_speech_transcription(self, text: str, *, mode):
        super()._emit_agent_speech_transcription(text, mode=mode)
        self.events.send(RealtimeAgentSpeechTranscriptionEvent(text=text, mode=mode))

    def _emit_user_speech_transcription(self, text: str, *, mode):
        super()._emit_user_speech_transcription(text, mode=mode)
        self.events.send(RealtimeUserSpeechTranscriptionEvent(text=text, mode=mode))


def require_env(*names: str) -> None:
    missing = [n for n in names if not os.getenv(n)]
    if missing:
        raise RuntimeError(f"Missing environment variables: {', '.join(missing)} (see .env.example)")


async def create_agent(**kwargs) -> Agent:
    return Agent(
        edge=getstream.Edge(),
        llm=CaptionedRealtime(
            realtime_session={
                "type": "realtime",
                "audio": {
                    "input": {
                        # Transcribe the student so captions show what they said.
                        "transcription": {"model": "gpt-4o-mini-transcribe"},
                        # Server-side voice detection: Sally stops talking as soon as
                        # the student starts (the app uses hold-to-talk).
                        "turn_detection": ServerVad(
                            type="server_vad",
                            threshold=0.5,
                            prefix_padding_ms=200,
                            silence_duration_ms=500,
                            interrupt_response=True,
                        ),
                    }
                },
            }
        ),
        agent_user=User(name="Sally", id=AGENT_USER_ID),
        instructions=DEFAULT_INSTRUCTIONS,
    )


async def join_call(agent: Agent, call_type: str, call_id: str, **kwargs) -> None:
    call = await agent.create_call(call_type, call_id)

    # 1. Read the lesson context written by the app (app/lesson/[id].tsx).
    custom: dict = {}
    try:
        response = await call.get()
        custom = response.data.call.custom or {}
    except Exception as exc:  # keep teaching with defaults rather than crash
        print(f"[sally] could not read call custom data: {exc}")

    language = LANGUAGE_NAMES.get(custom.get("language", ""), "the language")
    lesson_title = custom.get("lesson_title") or ""
    intro_message = custom.get("intro_message") or ""
    agent.instructions = Instructions(input_text=custom.get("system_prompt") or DEFAULT_INSTRUCTIONS)
    agent.llm.set_instructions(agent.instructions)
    print(f"[sally] joining {call_id} — {language} / {lesson_title or 'no lesson title'}")

    # 2. Allow Sally to publish audio in the call.
    try:
        await call.update_call_members(update_members=[MemberRequest(user_id=AGENT_USER_ID, role="admin")])
    except Exception as exc:
        print(f"[sally] could not grant admin role: {exc}")

    # 3. Forward transcripts to the app as Stream custom events (live captions).
    #    Partial text grows word by word; a final event closes the sentence.
    buffers: dict[str, list[str]] = {"agent": [], "user": []}

    async def send(kind: str, speaker: str, text: str) -> None:
        try:
            await agent.send_custom_event({"type": kind, "speaker": speaker, "text": text})
        except Exception as exc:
            print(f"[sally] send_custom_event failed: {exc}")

    async def on_transcript(
        event: RealtimeAgentSpeechTranscriptionEvent | RealtimeUserSpeechTranscriptionEvent,
    ) -> None:
        if isinstance(event, RealtimeAgentSpeechTranscriptionEvent):
            speaker = "agent"
        elif isinstance(event, RealtimeUserSpeechTranscriptionEvent):
            speaker = "user"
        else:
            return
        buffer = buffers[speaker]
        if event.mode == "delta" and event.text:
            buffer.append(event.text)
            await send("transcript_partial", speaker, "".join(buffer))
        elif event.mode == "final":
            text = (event.text or "".join(buffer)).strip()
            buffer.clear()
            if text:
                await send("transcript_final", speaker, text)

    agent.subscribe(on_transcript)

    # 4. Join, wait for the student, greet, then let the conversation run.
    async with agent.join(call):
        await agent.wait_for_participant(timeout=60.0)
        greeting = (
            f'Say exactly this greeting: "{intro_message}" ' if intro_message else "Greet the student warmly. "
        )
        await agent.simple_response(
            f"A student just joined your {language} lesson"
            + (f' "{lesson_title}"' if lesson_title else "")
            + ". "
            + greeting
            + "Then ask ONE short question to check they are ready, and stop and wait for their answer."
        )
        await agent.finish()


if __name__ == "__main__":
    require_env("STREAM_API_KEY", "STREAM_API_SECRET", "OPENAI_API_KEY")
    Runner(AgentLauncher(create_agent=create_agent, join_call=join_call)).cli()
