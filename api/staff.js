import { randomBytes } from "node:crypto";
import { adminDb, adminAuth, FieldValue } from "../lib/admin.js";

const ROLES = {
  manager: ["overview","pos","products","customers","sales","expenses","reports"],
  cashier: ["overview","pos","sales"],
  stock: ["overview","products"],
  accountant: ["overview","sales","customers","expenses","reports"]
};
const VALID = new Set(["overview","pos","products","customers","sales","expenses","reports"]);
async function verifiedUser(req,res) {
  const token=String(req.headers.authorization||"").replace(/^Bearer\\s+/i,"");
  if(!token){res.status(401).json({success:false,message:"Please sign in again."});return null;}
  try{return await adminAuth.verifyIdToken(token);}catch{res.status(401).json({success:false,message:"Your session has expired. Please sign in again."});return null;}
}
const memberRef=(owner,uid)=>adminDb.doc(`businesses/${owner}/members/${uid}`);
const inviteRef=token=>adminDb.doc("staffInvites/"+token);
async function ownerFor(uid) {
  const snap=await adminDb.collectionGroup("members").where("uid","==",uid).limit(1).get();
  if(!snap.empty){const member=snap.docs[0];return {ownerUid:member.ref.parent.parent.id,member:member.data()};}
  return {ownerUid:uid,member:{role:"owner",permissions:[...VALID],status:"active"}};
}
export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({success:false,message:"Method not allowed."});
 try{
  const user=await verifiedUser(req,res);if(!user)return;
  const body=req.body||{},action=body.action;
  if(action==="context"){
   const ctx=await ownerFor(user.uid);
   return res.json({success:true,...ctx});
  }
  if(action==="accept"){
   const token=String(body.token||"").trim();
   if(!token||token.length>100)return res.status(400).json({success:false,message:"This invitation link is invalid."});
   const ref=inviteRef(token),snap=await ref.get();
   if(!snap.exists)return res.status(404).json({success:false,message:"This invitation has expired or was already used."});
   const inv=snap.data();
   if(inv.status!=="pending"||inv.expiresAtMs<Date.now())return res.status(410).json({success:false,message:"This invitation has expired."});
   if(String(user.email||"").toLowerCase()!==inv.email)return res.status(403).json({success:false,message:"Sign in with the email address this invitation was sent to."});
   await adminDb.runTransaction(async tx=>{
    const latest=await tx.get(ref);if(!latest.exists||latest.data().status!=="pending")throw new Error("INVITE_USED");
    tx.set(memberRef(inv.ownerUid,user.uid),{uid:user.uid,email:user.email,name:user.name||user.email,role:inv.role,permissions:inv.permissions,status:"active",joinedAt:FieldValue.serverTimestamp(),createdAt:FieldValue.serverTimestamp()});
    tx.update(ref,{status:"accepted",acceptedBy:user.uid,acceptedAt:FieldValue.serverTimestamp()});
   });
   return res.json({success:true,message:"You have joined the shop. Please refresh your workspace."});
  }
  const ctx=await ownerFor(user.uid);
  if(ctx.ownerUid!==user.uid||ctx.member.role!=="owner")return res.status(403).json({success:false,message:"Only the shop owner can manage staff."});
  const ref=adminDb.collection("businesses").doc(user.uid).collection("members");
  if(action==="list"){
   const snap=await ref.get();const invites=await adminDb.collection("staffInvites").where("ownerUid","==",user.uid).where("status","==","pending").get();
   return res.json({success:true,staff:snap.docs.map(d=>({id:d.id,...d.data()})),invites:invites.docs.map(d=>({id:d.id,email:d.data().email,role:d.data().role,expiresAtMs:d.data().expiresAtMs}))});
  }
  if(action==="invite"){
   const email=String(body.email||"").trim().toLowerCase(),role=String(body.role||"cashier");
   if(!/^\\S+@\\S+\\.\\S+$/.test(email))return res.status(400).json({success:false,message:"Enter a valid staff email address."});
   if(!ROLES[role])return res.status(400).json({success:false,message:"Choose a valid staff role."});
   if(email===String(user.email||"").toLowerCase())return res.status(400).json({success:false,message:"You cannot invite your own account."});
   const token=randomBytes(24).toString("hex"),expiresAtMs=Date.now()+7*86400000;
   await inviteRef(token).set({ownerUid:user.uid,email,role,permissions:ROLES[role],status:"pending",createdAt:FieldValue.serverTimestamp(),expiresAtMs});
   return res.json({success:true,inviteUrl:`${req.headers.origin||"https://mauzobora.co.tz"}/app?invite=${token}`,expiresAtMs});
  }
  if(action==="permissions"){
   const staffUid=String(body.staffUid||""),permissions=Array.isArray(body.permissions)?body.permissions.filter(x=>VALID.has(x)):[];
   if(!staffUid||staffUid===user.uid)return res.status(400).json({success:false,message:"Choose a staff account."});
   const target=memberRef(user.uid,staffUid),snap=await target.get();if(!snap.exists)return res.status(404).json({success:false,message:"Staff account not found."});
   await target.update({permissions,updatedAt:FieldValue.serverTimestamp()});
   return res.json({success:true});
  }
  if(action==="deactivate"){
   const staffUid=String(body.staffUid||"");if(!staffUid||staffUid===user.uid)return res.status(400).json({success:false,message:"Choose a staff account."});
   const target=memberRef(user.uid,staffUid),snap=await target.get();if(!snap.exists)return res.status(404).json({success:false,message:"Staff account not found."});
   await target.update({status:"inactive",updatedAt:FieldValue.serverTimestamp()});
   return res.json({success:true});
  }
  return res.status(400).json({success:false,message:"Unknown staff action."});
 }catch(error){console.error("Mauzobora staff API:",error);return res.status(500).json({success:false,message:error.message==="INVITE_USED"?"This invitation has already been used.":"A server error occurred. Please try again."});}
}