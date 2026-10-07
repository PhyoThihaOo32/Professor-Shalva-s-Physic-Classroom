'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {KeyRound} from 'lucide-react';
import {api} from '@/lib/client';
import {useStudentChoice} from '@/lib/student-choice';
type Connection={configured:boolean;personal:boolean;model:string;source:string};
export function AiSettings(){
 const student=useStudentChoice();
 const [connection,setConnection]=useState<Connection|null>(null),[apiKey,setApiKey]=useState(''),[model,setModel]=useState('gpt-4.1-mini'),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 useEffect(()=>{let cancelled=false;api<Connection>('ai-connection').then(c=>{if(!cancelled){setConnection(c);setModel(c.model);}}).catch(e=>{if(!cancelled)setError(e.message);});return ()=>{cancelled=true;};},[]);
 async function save(){
  setBusy(true);setError('');setMessage('');
  try{const c=await api<Connection>('ai-connection',{method:'POST',body:{apiKey:apiKey.trim(),model:model.trim()}});setConnection(c);setApiKey('');setMessage('Key saved securely. Your classroom will use live replies when you return.');}
  catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 async function action(kind:'test'|'remove'){
  setBusy(true);setError('');setMessage('');
  try{if(kind==='test'){const result=await api<{message:string}>('ai-connection/test',{method:'POST'});setMessage(result.message);}else{setConnection(await api<Connection>('ai-connection',{method:'DELETE'}));setApiKey('');setMessage('Your personal key was removed.');}}
  catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 return <section className="paper settings-section ai-settings" aria-labelledby="ai-settings-title"><KeyRound size={25}/><div><h2 id="ai-settings-title">Live student conversations</h2><p>Connect OpenAI so your student can answer your questions, recalculate, and revise their work. Authored steps are available in Library → Manual.</p>
  <p className="tiny" role="status">{connection?connection.configured?`${connection.personal?'Your key is saved':'Server connection available'} · ${connection.model}`:'Demo mode · no API key connected':'Checking connection…'}</p>
  <form onSubmit={e=>{e.preventDefault();void save();}}>
   <label className="field-label" htmlFor="openai-key">OpenAI API key</label><input id="openai-key" type="password" autoComplete="off" spellCheck={false} placeholder={connection?.personal?'Paste a replacement key':'sk-…'} value={apiKey} onChange={e=>setApiKey(e.target.value)} maxLength={500} required disabled={busy||!connection}/>
   <label className="field-label" htmlFor="openai-model">Model</label><input id="openai-model" value={model} onChange={e=>setModel(e.target.value)} maxLength={100} required disabled={busy||!connection}/>
   <div className="action-row"><button className="button" type="submit" disabled={busy||!connection||!apiKey.trim()||!model.trim()}>{busy?'Working…':connection?.personal?'Replace API key':'Save API key'}</button>{connection?.configured&&<button type="button" className="button secondary" disabled={busy} onClick={()=>void action('test')}>Test connection</button>}{connection?.personal&&<button type="button" className="text-button danger" disabled={busy} onClick={()=>void action('remove')}>Remove API key</button>}</div>
  </form>
  <p className="tiny">Your key is encrypted on the server and never saved in browser storage or included in chat/history exports. Saving makes no OpenAI call; testing checks key and model access without generating a response. Live messages use your API account.</p>
  <Link className="text-button" href={`/classroom?student=${student}`}>Return to classroom →</Link>
  {message&&<p role="status" className="feedback accepted">{message}</p>}{error&&<p role="alert" className="error">{error}</p>}
 </div></section>;
}
