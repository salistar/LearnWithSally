"""Live synthetic student: real Stream audio transport and Sally Realtime replies.

Credentials and fixture identity arrive only through the parent environment.
Only synthetic conversation audio/transcripts are saved as evidence.
"""
import asyncio
import json
import logging
import os
from pathlib import Path
import wave

import httpx
from openai import AsyncOpenAI
from getstream import AsyncStream
from getstream.models import CallRequest, UserRequest
from getstream.video.rtc import join, AudioStreamTrack, PcmData

logging.disable(logging.CRITICAL)  # SDK exceptions can contain authenticated URLs.
OUT = Path(os.environ.get('LWS_VOICE_OUTPUT', Path.cwd() / 'dist-android' / 'voice-test'))

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    student = os.environ['LWS_TEST_USER']
    call_id = f'lesson-fr-1-1-{student}'
    stream = AsyncStream()
    ai = AsyncOpenAI()
    call = stream.video.call('default', call_id)
    session_id = None
    transcript = []
    chunks = []
    async with httpx.AsyncClient(timeout=60) as http:
        headers = {'Authorization': 'Bearer ' + os.environ['LWS_TEST_JWT']}
        base = os.environ.get('EXPO_PUBLIC_API_URL', 'http://127.0.0.1:8097')
        try:
            utterances = ['Yes Sally, I am ready. Please teach me how to say hello in French.',
                          'Bonjour Sally. Did I pronounce that correctly?',
                          'Merci Sally. Goodbye!']
            audio = []
            for i, text in enumerate(utterances):
                cached = OUT / f'student-{i+1}.wav'
                if cached.exists():
                    with wave.open(str(cached), 'rb') as wav:
                        raw = wav.readframes(wav.getnframes())
                else:
                    speech = await ai.audio.speech.create(model='gpt-4o-mini-tts', voice='alloy', input=text, response_format='pcm')
                    raw = speech.content
                audio.append(raw)
                with wave.open(str(OUT / f'student-{i+1}.wav'), 'wb') as wav:
                    wav.setparams((1, 2, 24000, 0, 'NONE', 'not compressed'))
                    wav.writeframes(raw)
            await stream.upsert_users(UserRequest(id=student, name='Synthetic voice QA student'))
            await call.get_or_create(data=CallRequest(created_by_id=student, custom={
                'language': 'fr', 'lesson_title': 'Greetings',
                'intro_message': 'Bonjour! I am Sally. Are you ready to practice French greetings?',
                'system_prompt': 'You are Sally, a friendly French teacher. Teach bonjour and merci. Speak briefly in English and French. Ask one question then wait. Respond to what the student actually says. End warmly when they say goodbye.'}))
            print('Voice QA: synthetic audio and Stream call created', flush=True)
            connection = await join(call, user_id=student)
            @connection.on('audio')
            async def received(pcm):
                chunks.append(pcm.resample(24000, target_channels=1).to_bytes())
            @connection.on('custom')
            async def custom(event):
                data = event.get('custom', {})
                (OUT / 'event-shape.json').write_text(json.dumps({'keys':list(event), 'custom_keys':list(data)}), encoding='utf8')
                if data.get('type') == 'transcript_final':
                    transcript.append({'speaker': data.get('speaker'), 'text': data.get('text')})
            async with connection:
                track = AudioStreamTrack(sample_rate=24000)
                await connection.add_tracks(audio=track)
                response = await http.post(base + '/api/agent-session', headers=headers, json={'callId': call_id})
                assert response.status_code == 200, f'Agent start HTTP {response.status_code}'
                session_id = response.json()['sessionId']
                print('Voice QA: Sally session created', flush=True)
                async def wait_agent(previous):
                    async with asyncio.timeout(70):
                        while sum(x['speaker'] == 'agent' for x in transcript) <= previous:
                            await asyncio.sleep(.25)
                    await asyncio.sleep(3)
                await wait_agent(0)
                for raw in audio:
                    count = sum(x['speaker'] == 'agent' for x in transcript)
                    await track.write(PcmData.from_bytes(raw, sample_rate=24000))
                    await wait_agent(count)
                assert sum(x['speaker'] == 'user' for x in transcript) >= 3, 'Missing student transcription'
                assert len(b''.join(chunks)) > 48000, 'Missing received Sally audio'
                (OUT / 'transcript.json').write_text(json.dumps(transcript, ensure_ascii=False, indent=2), encoding='utf8')
                with wave.open(str(OUT / 'sally-received.wav'), 'wb') as wav:
                    wav.setparams((1, 2, 24000, 0, 'NONE', 'not compressed'))
                    wav.writeframes(b''.join(chunks))
                print('PASS live voice: greeting + 3 student audio turns + 3 Sally replies, audio received and captions verified', flush=True)
        finally:
            (OUT / 'transcript-partial.json').write_text(json.dumps(transcript, ensure_ascii=False, indent=2), encoding='utf8')
            if chunks:
                with wave.open(str(OUT / 'sally-received-partial.wav'), 'wb') as wav:
                    wav.setparams((1, 2, 24000, 0, 'NONE', 'not compressed'))
                    wav.writeframes(b''.join(chunks))
            if session_id:
                await http.delete(base + '/api/agent-session', headers=headers, params={'callId':call_id, 'sessionId':session_id})
            await call.end()
            await call.delete()
            await ai.close()

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except Exception as error:
        print('FAIL live voice: ' + type(error).__name__, flush=True)
        if isinstance(error, AssertionError):
            print(str(error), flush=True)  # Only assertions defined above; no provider payloads.
        raise SystemExit(1)
