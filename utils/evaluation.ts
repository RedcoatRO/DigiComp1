import { ActionLogEntry, ActionType, FileType, EvaluationResult } from '../types';

// --- Constante de configurare pentru scenariul de evaluare ---
const TARGET_FILE_ID = 'file-1'; // ID-ul fișierului pe care utilizatorul trebuie să-l găsească.
const IDEAL_FOLDER_PATH = ['This PC', 'Documents', 'Resurse 2023']; // Calea ideală către folderul care conține fișierul.


/**
 * Calculează scorul LIVE al utilizatorului pe măsură ce acesta interacționează cu aplicația.
 * Această funcție este optimizată pentru a oferi feedback în timp real, spre deosebire de `calculateScore` care face evaluarea finală.
 * @param actions - Lista curentă de acțiuni ale utilizatorului.
 * @returns Un număr reprezentând scorul curent, între 1 și 10.
 */
export const calculateLiveScore = (actions: ActionLogEntry[]): number => {
  // Scorul de bază de la care se scade/adună
  let score = 10;
  
  // 1. Analiza eficienței navigației
  const navigationActions = actions.filter(a => a.type === ActionType.NAVIGATE);
  const irrelevantNavigations = navigationActions.filter(a => {
    const path = a.payload.path as string[];
    // Penalizează pentru navigare în foldere care nu sunt pe calea corectă
    return !IDEAL_FOLDER_PATH.join('/').startsWith(path.join('/')) && !path.join('/').startsWith(IDEAL_FOLDER_PATH.join('/'))
  }).length;
  
  if (irrelevantNavigations > 0) {
    score -= irrelevantNavigations * 1;
  } else if (navigationActions.length > 3) {
    // Penalizează pentru click-uri în plus, chiar și pe calea corectă
    score -= (navigationActions.length - 3) * 0.25;
  }

  // 2. Analiza utilizării căutării și filtrelor
  const searchActions = actions.filter(a => a.type === ActionType.SEARCH);
  
  // Penalizează pentru neutilizarea căutării doar dacă utilizatorul pare blocat (multe navigări fără rezultat)
  if (searchActions.length === 0 && navigationActions.length > 4) {
    score -= 3;
  }
  
  if (searchActions.length > 0) {
    // Evaluează cea mai recentă acțiune de căutare
    const lastSearch = searchActions[searchActions.length - 1].payload;
    
    // Verifică filtrele aplicate
    if (lastSearch.filters.type === FileType.PDF) score += 1.5; else score -= 1;
    if (lastSearch.filters.size?.comparison === 'gt' && lastSearch.filters.size?.value >= 1024) score += 1; else score -= 0.5;
    
    // Verifică termenii de căutare
    if (lastSearch.query.toLowerCase().includes('manual')) {
      score += 1;
    }
  }
  
  // Asigură că scorul rămâne în intervalul 1-10
  return Math.max(1, Math.min(10, Math.round(score)));
};


/**
 * Calculează scorul utilizatorului pe baza unei liste de acțiuni înregistrate.
 * @param actions - Un array de obiecte `ActionLogEntry` care reprezintă istoricul acțiunilor.
 * @returns Un obiect cu `score`, `feedback` general și o listă de `details` specifice.
 */
export const calculateScore = (actions: ActionLogEntry[]): EvaluationResult => {
  // Scorul de bază de la care începem să scădem sau să adunăm puncte.
  let score = 10;
  // O listă unde vom colecta toate punctele de feedback specifice.
  const details: string[] = [];

  // --- Analiza acțiunilor și generarea feedback-ului detaliat ---

  // 1. Verificarea condiției de succes: Găsirea fișierului corect.
  const foundTargetFile = actions.some(
    action => action.type === ActionType.FILE_OPEN && action.payload.node.id === TARGET_FILE_ID
  );

  // 2. Analiza eficienței navigării.
  const navigationActions = actions.filter(a => a.type === ActionType.NAVIGATE);
  const irrelevantNavigations = navigationActions.filter(a => {
    const path = a.payload.path as string[];
    return !IDEAL_FOLDER_PATH.join('/').startsWith(path.join('/')) && !path.join('/').startsWith(IDEAL_FOLDER_PATH.join('/'))
  }).length;
  
  if (irrelevantNavigations > 0) {
    details.push(`✗ Ai navigat în ${irrelevantNavigations} foldere irelevante.`);
    score -= irrelevantNavigations * 1; // Penalizare mai mare pentru navigare greșită
  } else if (navigationActions.length > 3) { // Penalizare mai mică pentru extra click-uri în folderele corecte
    details.push(`✗ Ai folosit ${navigationActions.length} click-uri pentru a naviga. Încearcă să fii mai direct.`);
    score -= (navigationActions.length - 3) * 0.25;
  } else {
    details.push('✓ Ai navigat eficient către folderul corect.');
  }

  // 3. Analiza utilizării căutării și filtrelor.
  const searchActions = actions.filter(a => a.type === ActionType.SEARCH);
  if (searchActions.length > 0) {
    const lastSearch = searchActions[searchActions.length - 1].payload;
    let usedAnyFilter = false;

    // Feedback pentru filtrul de tip
    if (lastSearch.filters.type === FileType.PDF) {
      details.push('✓ Ai folosit corect filtrul de tip fișier.');
      score += 1.5;
      usedAnyFilter = true;
    } else {
      details.push('✗ Nu ai filtrat după tipul fișierului (.pdf).');
      score -= 1;
    }

    // Feedback pentru filtrul de mărime
    if (lastSearch.filters.size?.comparison === 'gt' && lastSearch.filters.size?.value >= 1024) {
      details.push('✓ Ai folosit corect filtrul de mărime.');
      score += 1;
      usedAnyFilter = true;
    } else {
      details.push('✗ Nu ai folosit filtrul de mărime (>1MB).');
      score -= 0.5;
    }

    // Feedback pentru filtrul de dată
    if (lastSearch.filters.date?.since) {
      details.push('✓ Ai folosit filtrul pentru data modificării.');
      usedAnyFilter = true;
    }

    // Feedback pentru cuvintele cheie
    if (lastSearch.query.toLowerCase().includes('manual utilizator')) {
      details.push('✓ Ai folosit cuvinte cheie relevante în căutare.');
      score += 1;
    }

  } else {
    details.push('✗ Nu ai folosit deloc funcția de căutare avansată.');
    score -= 3; // Penalizare semnificativă pentru neutilizarea uneltei principale
  }

  // --- Calcularea scorului final și a mesajului general ---
  
  let feedback = '';
  if (foundTargetFile) {
    details.unshift('✓ Felicitări, ai găsit fișierul corect!');
    feedback = 'Analiza performanței tale:';
    score = Math.max(1, Math.min(10, Math.round(score)));
  } else {
    details.unshift('✗ Nu ai găsit fișierul corect în timpul alocat.');
    feedback = 'Data viitoare, încearcă să folosești mai eficient uneltele de căutare.';
    score = Math.max(1, Math.min(4, Math.round(score / 2))); // Scorul este redus drastic dacă nu s-a găsit fișierul
  }

  return { score, feedback, details };
};