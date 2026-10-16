"""Offline regression for the pinned SDK's caption event compatibility bridge."""
import unittest
from unittest.mock import patch

from main import CaptionedRealtime
from vision_agents.core.events import EventManager
from vision_agents.core.llm import events
from vision_agents.core.llm.events import (
    RealtimeAgentSpeechTranscriptionEvent,
    RealtimeUserSpeechTranscriptionEvent,
)
from vision_agents.plugins import openai


class CaptionBridgeTest(unittest.IsolatedAsyncioTestCase):
    async def test_captions_reach_typed_subscribers_without_replacing_inference(self):
        llm = CaptionedRealtime.__new__(CaptionedRealtime)
        llm.events = EventManager()
        llm.events.register_events_from_module(events)
        received = []

        async def caption(event: RealtimeAgentSpeechTranscriptionEvent | RealtimeUserSpeechTranscriptionEvent):
            received.append((type(event), event.text, event.mode))

        llm.events.subscribe(caption)
        with patch.object(openai.Realtime, '_emit_agent_speech_transcription') as agent_output, \
             patch.object(openai.Realtime, '_emit_user_speech_transcription') as user_output:
            llm._emit_agent_speech_transcription('Bonjour', mode='final')
            llm._emit_user_speech_transcription('Merci', mode='final')
            await llm.events.wait()
            agent_output.assert_called_once_with('Bonjour', mode='final')
            user_output.assert_called_once_with('Merci', mode='final')
        self.assertCountEqual(received, [
            (RealtimeAgentSpeechTranscriptionEvent, 'Bonjour', 'final'),
            (RealtimeUserSpeechTranscriptionEvent, 'Merci', 'final'),
        ])


if __name__ == '__main__':
    unittest.main()
