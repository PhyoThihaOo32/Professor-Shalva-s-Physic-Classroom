import 'dotenv/config';
import {db} from '../lib/db';
const days=Number(process.env.GUEST_RETENTION_DAYS??30);
if(!Number.isFinite(days)||days<1)throw new Error('GUEST_RETENTION_DAYS must be positive.');
const result=await db.guestIdentity.deleteMany({where:{lastSeenAt:{lt:new Date(Date.now()-days*86400000)}}});
await db.quota.deleteMany({where:{expiresAt:{lt:new Date()}}});
console.log(`Deleted ${result.count} inactive guest identities and their cascading session history.`);
await db.$disconnect();
