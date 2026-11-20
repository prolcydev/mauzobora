import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase.js';
import { loadShopData, saveShopData, getSubscription, subscriptionRequest, emptyShop, staffRequest } from '../lib/shopData.js';
const copy = value => JSON.parse(JSON.stringify(value));
export function useShop() {
  const [user,setUser]=useState(null),[data,setData]=useState(null),[subscription,setSubscription]=useState(null),[workspace,setWorkspace]=useState(null);
  const [loading,setLoading]=useState(true),[status,setStatus]=useState(''),[error,setError]=useState('');
  const hydrated=useRef(false),previous=useRef(null),saveTimer=useRef(null);
  useEffect(()=>{
    let active=true;
    const unsubscribe=onAuthStateChanged(auth,async nextUser=>{
      if(!active)return;
      setUser(nextUser);setError('');hydrated.current=false;previous.current=null;setData(null);setSubscription(null);setWorkspace(null);
      if(!nextUser){setLoading(false);setStatus('');return;}
      setLoading(true);
      try{
        const token=await nextUser.getIdToken();
        const inviteToken=new URLSearchParams(window.location.search).get('invite');
        if(inviteToken){await staffRequest(token,{action:'accept',token:inviteToken});window.history.replaceState({},'',window.location.pathname);}
        const ctx=await staffRequest(token,{action:'context'});
        if(ctx.member?.status!=='active')throw new Error('Your staff access has been deactivated. Contact the shop owner.');
        const permissions=ctx.member?.permissions||['overview','pos','products','customers','sales','expenses','reports'];
        const shopUid=ctx.ownerUid||nextUser.uid;
        let sub=ctx.subscription||null;
        if(!sub&&shopUid===nextUser.uid){try{sub=(await subscriptionRequest(token,{action:'me'})).sub||null;}catch{sub=await getSubscription(shopUid).catch(()=>null);}}
        const shop=await loadShopData(shopUid,nextUser.displayName||'My Shop',permissions);
        if(!active)return;
        previous.current=copy(shop);setData(shop);setSubscription(sub);
        setWorkspace({ownerUid:shopUid,role:ctx.member?.role||'owner',permissions,isOwner:shopUid===nextUser.uid});
        hydrated.current=true;
      }catch(cause){if(active)setError(cause.message||'Could not load your shop. Check your connection and try again.');}
      finally{if(active)setLoading(false);}
    });
    return()=>{active=false;unsubscribe();clearTimeout(saveTimer.current);};
  },[]);
  useEffect(()=>{
    const paid=subscription?.status==='active'&&Number(subscription?.expiresAtMs)>Date.now()&&['basic','premium','ultra','duka','biashara'].includes(subscription?.plan);
    if(!user||!data||!workspace||!hydrated.current||!paid)return;
    if(JSON.stringify(data)===JSON.stringify(previous.current))return;
    clearTimeout(saveTimer.current);setStatus(navigator.onLine?'Changes pending':'Offline');
    saveTimer.current=setTimeout(async()=>{
      const snapshot=copy(data);
      try{await saveShopData(workspace.ownerUid,snapshot,previous.current);previous.current=snapshot;setStatus('Saved');}
      catch(cause){console.error('Mauzobora save failed:',cause);setStatus('Not saved');setError('Some changes could not be saved. Check your staff permissions or connection.');}
    },350);
    return()=>clearTimeout(saveTimer.current);
  },[user,data,subscription,workspace]);
  return {user,data,setData,subscription,setSubscription,workspace,loading,status,error,setError};
}