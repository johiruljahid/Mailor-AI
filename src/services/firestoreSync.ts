/**
 * Firestore Persistence & Synchronization Service for Mailora AI
 * Persists user workspaces, AI agent settings, knowledge chunks,
 * email threads, and audit records into Firebase Firestore.
 */

import { doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseAuth';
import { Business, EmailAgentConfig, KnowledgeItem, EmailThread, UserProfile } from '../types';

export class FirestoreSyncService {
  /**
   * Save or update User Profile in Firestore
   */
  static async saveUserProfile(user: UserProfile): Promise<boolean> {
    if (!db) return false;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, user, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore saveUserProfile notice:', err);
      return false;
    }
  }

  /**
   * Save or update Business Workspace in Firestore
   */
  static async saveBusiness(business: Business): Promise<boolean> {
    if (!db) return false;
    try {
      const bizRef = doc(db, 'businesses', business.id);
      await setDoc(bizRef, business, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore saveBusiness notice:', err);
      return false;
    }
  }

  /**
   * Save or update Agent Configuration in Firestore
   */
  static async saveAgentConfig(businessId: string, agent: EmailAgentConfig): Promise<boolean> {
    if (!db) return false;
    try {
      const agentRef = doc(db, 'businesses', businessId, 'agents', agent.id);
      await setDoc(agentRef, agent, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore saveAgentConfig notice:', err);
      return false;
    }
  }

  /**
   * Save or update a Knowledge Item in Firestore
   */
  static async saveKnowledgeItem(businessId: string, item: KnowledgeItem): Promise<boolean> {
    if (!db) return false;
    try {
      const kbRef = doc(db, 'businesses', businessId, 'knowledge', item.id);
      await setDoc(kbRef, item, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore saveKnowledgeItem notice:', err);
      return false;
    }
  }

  /**
   * Delete a Knowledge Item from Firestore
   */
  static async deleteKnowledgeItem(businessId: string, itemId: string): Promise<boolean> {
    if (!db) return false;
    try {
      const kbRef = doc(db, 'businesses', businessId, 'knowledge', itemId);
      await deleteDoc(kbRef);
      return true;
    } catch (err) {
      console.warn('Firestore deleteKnowledgeItem notice:', err);
      return false;
    }
  }

  /**
   * Save or update an Email Thread in Firestore
   */
  static async saveThread(businessId: string, thread: EmailThread): Promise<boolean> {
    if (!db) return false;
    try {
      const threadRef = doc(db, 'businesses', businessId, 'threads', thread.id);
      await setDoc(threadRef, thread, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore saveThread notice:', err);
      return false;
    }
  }

  /**
   * Fetch all knowledge items for a business
   */
  static async fetchKnowledge(businessId: string): Promise<KnowledgeItem[] | null> {
    if (!db) return null;
    try {
      const colRef = collection(db, 'businesses', businessId, 'knowledge');
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) return null;
      return snapshot.docs.map(doc => doc.data() as KnowledgeItem);
    } catch (err) {
      console.warn('Firestore fetchKnowledge notice:', err);
      return null;
    }
  }
}
