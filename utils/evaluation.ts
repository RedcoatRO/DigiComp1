import { ActionLogEntry, ActionType, FileType, EvaluationResult } from '../types';

// --- Constante de configurare pentru scenariul de evaluare ---
const TARGET_FILE_ID = 'file-1'; // ID-ul fișierului pe care utilizatorul trebuie să-l găsească.
const IDEAL_FOLDER_PATH = ['This PC', 'Documents', 'Resurse 2023']; // Calea ideală către folderul care conține fișierul.

/**
 * Calculează scorul dinamic al utilizatorului pe o scară de 100 de puncte,
 * analizând eficiența și completitudinea acțiunilor sale.
 * Această funcție este singura sursă de adevăr pentru scor,
 * folosită atât pentru afișarea live, cât și pentru evaluarea finală.
 * Scorul este aditiv: utilizatorul pornește de la 0 și acumulează puncte.
 *
 * @param actions - Un array de obiecte `ActionLogEntry` care reprezintă istoricul acțiunilor.
 * @returns Un obiect cu `score` și o listă de `details` pentru feedback.
 */
export const calculateScore = (actions: ActionLogEntry[]): Omit<EvaluationResult, 'feedback'> => {
  let score = 0;
  const details: string[] = [];
  const MAX_SCORE = 100;

  // --- Analiza Criteriilor ---

  // 1. Găsirea și deschiderea fișierului țintă (cel mai important obiectiv)
  const foundTargetFileAction = actions.find(
    action => action.type === ActionType.FILE_OPEN && action.payload.node.id === TARGET_FILE_ID
  );

  if (foundTargetFileAction) {
    score += 40; // Punctaj substanțial pentru atingerea obiectivului principal
    details.push('✓ Ai găsit și deschis fișierul corect!');
  } else {
    details.push('✗ Nu ai deschis încă fișierul corect.');
  }
  
  // 2. Eficiența navigației
  const navigationActions = actions.filter(a => a.type === ActionType.NAVIGATE);
  const uniqueNavPaths = new Set(navigationActions.map(a => a.payload.path.join('/')));
  
  const hasReachedTargetFolder = Array.from(uniqueNavPaths).some(path => path.startsWith(IDEAL_FOLDER_PATH.join('/')));
  if (hasReachedTargetFolder) {
      score += 15;
      details.push('✓ Ai navigat în folderul care conține fișierul.');
  } else if (navigationActions.length > 0) {
      details.push('✗ Nu ai ajuns în folderul țintă \'Resurse 2023\'.');
  }

  // Penalizare pentru navigări ineficiente
  const irrelevantNavigations = Array.from(uniqueNavPaths).filter(path => 
    !IDEAL_FOLDER_PATH.join('/').startsWith(path) && !path.startsWith(IDEAL_FOLDER_PATH.join('/'))
  ).length;

  if (irrelevantNavigations > 1) { // Tolerăm un click greșit
    score -= (irrelevantNavigations - 1) * 5;
    details.push(`✗ Ai navigat în ${irrelevantNavigations} foldere irelevante, ducând la o penalizare.`);
  }

  // 3. Utilizarea căutării și a filtrelor avansate
  const searchActions = actions.filter(a => a.type === ActionType.SEARCH);
  if (searchActions.length > 0) {
    score += 5; // Punctaj pentru simpla inițiativă de a folosi căutarea
    const lastSearch = searchActions[searchActions.length - 1].payload;
    let usedAnyFilter = false;

    // Punctaj pentru cuvinte cheie relevante
    if (lastSearch.query && lastSearch.query.toLowerCase().includes('manual')) {
        score += 10;
        details.push('✓ Ai folosit cuvinte cheie relevante în căutare.');
    } else {
        details.push('✗ Cuvintele cheie din căutare puteau fi mai specifice.');
    }

    // Punctaj pentru filtrul de tip
    if (lastSearch.filters.type === FileType.PDF) {
      score += 15;
      details.push('✓ Ai folosit corect filtrul de tip fișier (.pdf).');
      usedAnyFilter = true;
    }

    // Punctaj pentru filtrul de mărime
    if (lastSearch.filters.size?.comparison === 'gt' && lastSearch.filters.size?.value >= 1024) {
      score += 15;
      details.push('✓ Ai folosit corect filtrul de mărime (>1MB).');
      usedAnyFilter = true;
    }
    
    // Punctaj pentru filtrul de dată (bonus)
    if (lastSearch.filters.date?.since) {
      score += 5;
      details.push('✓ Ai utilizat filtrul de dată, demonstrând cunoaștere avansată.');
      usedAnyFilter = true;
    }

    if (!usedAnyFilter) {
        details.push('✗ Nu ai folosit deloc filtrele avansate (tip, mărime, dată).');
    }

  } else if (actions.length > 2) { // Penalizăm lipsa căutării doar dacă utilizatorul a făcut alte acțiuni
    details.push('✗ Nu ai folosit funcția de căutare.');
  }
  
  // Asigură că scorul este între 0 și 100
  const finalScore = Math.max(0, Math.min(MAX_SCORE, Math.round(score)));
  
  // Reordonăm detaliile pentru a avea obiectivul principal la început dacă a fost îndeplinit
  const finalDetails = details.sort((a, b) => {
    if (a.includes('ai găsit')) return -1;
    if (b.includes('ai găsit')) return 1;
    if (a.startsWith('✓') && b.startsWith('✗')) return -1;
    if (a.startsWith('✗') && b.startsWith('✓')) return 1;
    return 0;
  });

  return { score: finalScore, details: finalDetails };
};