'use client';
import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useRef, useState } from 'react';
import { Mic, PhoneOff, Volume2, X } from 'lucide-react';
import type { Call, StreamVideoClient } from '@stream-io/video-client';
import type { Lesson } from '@/types/learning';
import { buildTeacherPrompt } from '../../../lib/teacher';

export default function VoiceLesson({ lesson, onClose, onComplete }: {lesson:Lesson;onClose:()=>void;onComplete:()=>void}) {
 const {user}=useUser(); const {getToken}=useAuth();
 const [status,setStatus]=useState('Prête pour votre leçon'); const [active,setActive]=useState(false); const [busy,setBusy]=useState(false); const [talking,setTalking]=useState(false); const [error,setError]=useState('');
 const [captions,setCaptions]=useState<{speaker:string;text:string}[]>([]);
 const [audio,setAudio]=useState<{id:string;stream:MediaStream}[]>([]);
 const callRef=useRef<Call|null>(null); const clientRef=useRef<StreamVideoClient|null>(null); const sessionRef=useRef<string|null>(null); const disposed=useRef(false); const wantsToTalk=useRef(false);
 const api=async(path:string,init:RequestInit={})=>{const token=await getToken();if(!token)throw new Error('Reconnectez-vous pour continuer.');return fetch(path,{...init,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(45000)});};
 const stop=async()=>{wantsToTalk.current=false;const call=callRef.current;const session=sessionRef.current;callRef.current=null;sessionRef.current=null;if(call&&session)await api(`/api/agent-session?callId=${encodeURIComponent(call.id)}&sessionId=${encodeURIComponent(session)}`,{method:'DELETE'}).catch(()=>{});await call?.leave().catch(()=>{});await clientRef.current?.disconnectUser().catch(()=>{});clientRef.current=null;setActive(false);setTalking(false);setAudio([]);setStatus('Conversation terminée');};
 useEffect(()=>{disposed.current=false;return()=>{disposed.current=true;void stop();};},[]); // Component owns the session for its lifetime.
 const start=async()=>{if(!user||busy)return;setBusy(true);setError('');setStatus('Sally prépare votre conversation…');try{
  const {StreamVideoClient}=await import('@stream-io/video-client');
  const response=await api('/api/stream-token');if(!response.ok)throw new Error('Le service vocal est momentanément indisponible.');
  const credentials=await response.json();
  const client=new StreamVideoClient({apiKey:credentials.apiKey,user:{id:user.id,name:user.firstName||'Élève'},token:credentials.token,tokenProvider:async()=>{const r=await api('/api/stream-token');if(!r.ok)throw new Error('Session expirée.');return (await r.json()).token;}});clientRef.current=client;
  const call=client.call('default',`lesson-${lesson.id}-${user.id}`);callRef.current=call;
  call.on('custom',event=>{const c=event.custom as Record<string,unknown>|undefined;if(c?.type==='transcript_final'&&typeof c.text==='string'&&typeof c.speaker==='string')setCaptions(lines=>[...lines,{text:c.text as string,speaker:c.speaker as string}]);});
  call.state.remoteParticipants$.subscribe(ps=>setAudio(ps.flatMap(p=>p.audioStream?[{id:p.sessionId,stream:p.audioStream}]:[])));
  await call.camera.disable();await call.microphone.disable();await call.join({create:true});
  await call.update({custom:{lesson_id:lesson.id,lesson_title:lesson.title,language:lesson.languageCode,system_prompt:buildTeacherPrompt(lesson),intro_message:lesson.introMessage}});
  if(disposed.current){await stop();return;}
  const teacher=await api('/api/agent-session',{method:'POST',body:JSON.stringify({callId:call.id})});if(!teacher.ok)throw new Error('Sally ne peut pas rejoindre la conversation. Réessayez dans un instant.');
  sessionRef.current=(await teacher.json()).sessionId;if(disposed.current){await stop();return;}setActive(true);setStatus('Sally vous écoute. Prenez votre temps.');
 }catch(e){await stop();setError(e instanceof Error?e.message:'La connexion a échoué.');}finally{setBusy(false);}};
 const talk=async(enabled:boolean)=>{wantsToTalk.current=enabled;if(!callRef.current||!active)return;if(enabled){try{await callRef.current.microphone.enable();if(!wantsToTalk.current)await callRef.current?.microphone.disable();else setTalking(true);}catch{setError('Autorisez le microphone dans votre navigateur pour parler à Sally.');}}else{await callRef.current.microphone.disable();setTalking(false);}};
 return <div className="modal-scrim"><section className="voice-modal" role="dialog" aria-modal="true" aria-labelledby="voice-title"><button className="icon-button close-modal" aria-label="Fermer la leçon" onClick={()=>{void stop();onClose();}}><X/></button><div className="eyebrow">VOTRE MOMENT AVEC SALLY</div><h2 id="voice-title">{lesson.title}</h2><div className={`voice-avatar ${talking?'listening':''}`}><img src="/images/mascot-auth.png" alt="Sally"/></div><p className="voice-status" role="status">{status}</p><div className="caption-feed" aria-live="polite">{captions.length?captions.map((c,i)=><p className={c.speaker==='agent'?'':'student-caption'} key={i}><b>{c.speaker==='agent'?'Sally':'Vous'}</b>{c.text}</p>):<p className="muted">Les sous-titres de votre conversation apparaîtront ici.</p>}</div>{error&&<p className="error-message" role="alert">{error}</p>}
 {!active?<button className="button" onClick={()=>void start()} disabled={busy}><Volume2 size={18}/>{busy?'Connexion…':'Commencer la conversation'}</button>:<><button className={`button talk-button ${talking?'recording':''}`} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);void talk(true);}} onPointerUp={()=>void talk(false)} onPointerCancel={()=>void talk(false)} onKeyDown={e=>{if(e.code==='Space'&&!e.repeat){e.preventDefault();void talk(true);}}} onKeyUp={e=>{if(e.code==='Space'){e.preventDefault();void talk(false);}}} onBlur={()=>void talk(false)}><Mic size={20}/>{talking?'Je vous écoute…':'Maintenir pour parler'}</button><button className="text-link end-call" onClick={async()=>{await stop();if(captions.some(c=>c.speaker==='user')&&captions.filter(c=>c.speaker==='agent').length>1)onComplete();onClose();}}><PhoneOff size={16}/>Terminer la leçon</button></>}
 <div hidden>{audio.map(a=><audio key={a.id} autoPlay ref={el=>{if(el&&el.srcObject!==a.stream){el.srcObject=a.stream;void el.play().catch(()=>setError('Cliquez sur « Activer le son » si le navigateur bloque la lecture.'));}}}/>)}</div><button className="text-link" onClick={()=>{document.querySelectorAll('audio').forEach(el=>void el.play());setError('');}}>Activer le son</button></section></div>;
}
