import { useState, useEffect } from 'react';

// Hook personalizat pentru a persista starea în localStorage.
// Acest hook face managementul stării mult mai curat în componenta principală App.tsx.
export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  // Obține valoarea inițială din localStorage sau folosește valoarea implicită.
  const [value, setValue] = useState<T>(() => {
    const jsonValue = localStorage.getItem(key);
    if (jsonValue != null) {
      try {
        // Am adăugat o funcție "reviver" la JSON.parse.
        // Aceasta este esențială pentru a converti string-urile de dată (stocate ca ISO string în JSON)
        // înapoi în obiecte Date reale la încărcarea din localStorage.
        // Fără acest pas, `modifiedDate.getTime()` ar eșua, deoarece `modifiedDate` ar fi un string.
        return JSON.parse(jsonValue, (k, v) => {
            if (k === 'modifiedDate' && v) {
                return new Date(v);
            }
            return v;
        });
      } catch (error) {
        console.error(`Error parsing JSON from localStorage key "${key}":`, error);
        localStorage.removeItem(key); // Curăță valoarea coruptă
      }
    }

    if (typeof initialValue === 'function') {
      return (initialValue as () => T)();
    } else {
      return initialValue;
    }
  });

  // Salvează noua valoare în localStorage ori de câte ori se schimbă.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue] as [typeof value, typeof setValue];
}
