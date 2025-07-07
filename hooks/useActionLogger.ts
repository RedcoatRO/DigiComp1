import { useState, useCallback } from 'react';
import { ActionLogEntry, ActionType } from '../types';

/**
 * Hook personalizat pentru a gestiona log-ul de acțiuni ale utilizatorului.
 * Acesta abstractizează logica de stocare a acțiunilor pentru a fi folosită în sistemul de evaluare.
 */
export const useActionLogger = () => {
  // Starea internă care ține un array cu toate acțiunile înregistrate.
  const [actions, setActions] = useState<ActionLogEntry[]>([]);

  /**
   * Funcție memoizată pentru a adăuga o nouă acțiune în log.
   * @param type - Tipul acțiunii (ex: NAVIGATE, SEARCH).
   * @param payload - Datele specifice acțiunii (ex: calea la care s-a navigat).
   */
  const logAction = useCallback((type: ActionType, payload: any) => {
    const newAction: ActionLogEntry = {
      type,
      payload,
      timestamp: Date.now(),
    };
    // Adaugă noua acțiune la lista existentă, menținând imutabilitatea stării.
    setActions(prevActions => [...prevActions, newAction]);
  }, []);

  /**
   * Funcție memoizată pentru a goli log-ul de acțiuni.
   * Este utilă după ce o evaluare a fost finalizată.
   */
  const resetActions = useCallback(() => {
    setActions([]);
  }, []);

  // Expune starea și funcțiile de manipulare pentru a fi folosite în alte componente.
  return { actions, logAction, resetActions };
};
