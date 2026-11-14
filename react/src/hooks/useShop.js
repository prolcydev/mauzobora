import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase.js';
import { loadShopData, saveShopData, getSubscription, emptyShop } from '../lib/shopData.js';

const copy = value => JSON.parse(JSON.stringify(value));

export function useShop() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const hydrated = useRef(false);
  const previous = useRef(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async nextUser => {
      if (!active) return;
      setUser(nextUser);
      setError('');
      hydrated.current = false;
      previous.current = null;
      setData(null);
      setSubscription(null);
      if (!nextUser) {
        setLoading(false);
        setStatus('');
        return;
      }
      setLoading(true);
      try {
        const sub = await getSubscription(nextUser.uid).catch(() => null);
        let shop;
        try { shop = await loadShopData(nextUser.uid, nextUser.displayName || 'My Shop'); }
        catch (cause) { if (cause?.code !== 'permission-denied' || (sub?.status === 'active' && Number(sub?.expiresAtMs) > Date.now())) throw cause; shop = emptyShop(nextUser.displayName || 'My Shop'); }
        if (!active) return;
        previous.current = copy(shop);
        setData(shop);
        setSubscription(sub);
        hydrated.current = true;
      } catch (cause) {
        if (active) setError(cause?.code === 'permission-denied'
          ? 'Your account cannot access shop data yet. Check your subscription and Firestore rules.'
          : 'Could not load your shop. Check your connection and try again.');
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => { active = false; unsubscribe(); clearTimeout(saveTimer.current); };
  }, []);

  useEffect(() => {
    const paid = subscription?.status === 'active' && Number(subscription?.expiresAtMs) > Date.now() && ['basic', 'premium', 'ultra', 'duka', 'biashara'].includes(subscription?.plan);
    if (!user || !data || !hydrated.current || !paid) return;
    if (JSON.stringify(data) === JSON.stringify(previous.current)) return;
    clearTimeout(saveTimer.current);
    setStatus(navigator.onLine ? 'Changes pending' : 'Offline');
    saveTimer.current = setTimeout(async () => {
      const snapshot = copy(data);
      try {
        await saveShopData(user.uid, snapshot, previous.current);
        previous.current = snapshot;
        setStatus('Saved');
      } catch (cause) {
        console.error('Mauzobora save failed:', cause);
        setStatus('Not saved');
        setError('Some changes could not be saved. Check your connection and try again.');
      }
    }, 350);
    return () => clearTimeout(saveTimer.current);
  }, [user, data, subscription]);

  return { user, data, setData, subscription, setSubscription, loading, status, error, setError };
}
