'use client';
import {useEffect,useRef} from 'react';
import {Trash2} from 'lucide-react';

export function DeleteConversationDialog({title,busy,error,onConfirm,onClose}:{title:string;busy:boolean;error:string;onConfirm:()=>void;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),cancel=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const current=dialog.current;current?.showModal();cancel.current?.focus();return()=>current?.close();},[]);
 function dismiss(){if(!busy){dialog.current?.close();onClose();}}
 return <dialog ref={dialog} className="space-delete-dialog" aria-labelledby="delete-conversation-heading" aria-describedby="delete-conversation-description" aria-busy={busy} onCancel={event=>{event.preventDefault();dismiss();}} onClick={event=>{
  if(event.target!==event.currentTarget)return;
  const bounds=event.currentTarget.getBoundingClientRect();
  if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dismiss();
 }}>
  <Trash2 className="delete-dialog-icon" size={22} aria-hidden="true"/>
  <h2 id="delete-conversation-heading">Delete conversation?</h2>
  <p className="delete-dialog-preview">{title}</p>
  <p id="delete-conversation-description">This can’t be undone.</p>
  {error&&<p role="alert" className="delete-dialog-error">{error}</p>}
  <div className="delete-dialog-actions">
   <button ref={cancel} type="button" className="delete-dialog-cancel" disabled={busy} onClick={dismiss}>Cancel</button>
   <button type="button" className="delete-dialog-confirm" disabled={busy} onClick={onConfirm}>{busy?'Deleting…':'Delete'}</button>
  </div>
 </dialog>;
}
