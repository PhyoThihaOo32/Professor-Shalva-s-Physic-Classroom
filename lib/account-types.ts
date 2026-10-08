export type AccountState={identity:{id:string;kind:'user'|'guest'};user:{id:string;name:string|null;email:string;googleLinked:boolean}|null;googleAvailable:boolean};
export type SpaceConversation={id:string;kind:'open-classroom'|'problem';personaId:string;title:string;updatedAt:string};
