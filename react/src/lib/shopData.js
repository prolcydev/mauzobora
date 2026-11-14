import {
  collection, deleteDoc, doc, getDoc, getDocs, setDoc, writeBatch
} from 'firebase/firestore';
import { db } from './firebase.js';

const COLLECTIONS = ['products', 'customers', 'sales', 'expenses'];
const emptyShop = name => ({
  set: { name: name || 'My Shop', phone: '', addr: '', tax: 0 },
  next: 1,
  products: [],
  customers: [],
  sales: [],
  expenses: []
});

export async function loadShopData(uid, displayName = 'My Shop') {
  const userDoc = (...parts) => doc(db, 'users', uid, ...parts);
  const [meta, ...snapshots] = await Promise.all([
    getDoc(userDoc('data', 'meta')),
    ...COLLECTIONS.map(name => getDocs(collection(db, 'users', uid, name)))
  ]);

  let data;
  if (meta.exists()) {
    data = { ...meta.data() };
    COLLECTIONS.forEach((name, index) => {
      data[name] = snapshots[index].docs.map(item => item.data());
    });
  } else {
    const [main, oldSales] = await Promise.all([
      getDoc(userDoc('data', 'main')),
      getDoc(userDoc('data', 'sales'))
    ]);
    data = main.exists()
      ? { ...main.data(), sales: oldSales.exists() ? oldSales.data().list || [] : [] }
      : emptyShop(displayName);
    COLLECTIONS.forEach(name => { data[name] ||= []; });
    data.next ||= 1;
  }

  data.set ||= emptyShop(displayName).set;
  data.next ||= 1;
  COLLECTIONS.forEach(name => { data[name] ||= []; });
  data.sales.sort((a, b) => (a.no || 0) - (b.no || 0));
  data.products.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  data.customers.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  return data;
}

export async function saveShopData(uid, data, previous = null) {
  const operations = [];
  for (const name of COLLECTIONS) {
    const current = new Map((data[name] || []).map(item => [String(item.id), item]));
    const old = new Map((previous?.[name] || []).map(item => [String(item.id), item]));
    for (const [id, item] of current) {
      operations.push({ type: 'set', ref: doc(db, 'users', uid, name, id), value: item });
    }
    for (const id of old.keys()) {
      if (!current.has(id)) operations.push({ type: 'delete', ref: doc(db, 'users', uid, name, id) });
    }
  }

  const metaRef = doc(db, 'users', uid, 'data', 'meta');
  operations.push({
    type: 'set',
    ref: metaRef,
    value: { set: data.set, next: data.next }
  });

  for (let offset = 0; offset < operations.length; offset += 400) {
    const batch = writeBatch(db);
    operations.slice(offset, offset + 400).forEach(operation => {
      if (operation.type === 'delete') batch.delete(operation.ref);
      else batch.set(operation.ref, operation.value);
    });
    await batch.commit();
  }
}

export async function getSubscription(uid) {
  const snapshot = await getDoc(doc(db, 'subscriptions', uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function subscriptionRequest(idToken, payload) {
  const response = await fetch('/api/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + idToken
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) {
    throw new Error(result.message || 'The request could not be completed.');
  }
  return result;
}

export { emptyShop };
