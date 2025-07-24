/**
 * Interfață pentru a defini structura datelor trimise prin postMessage.
 * Asigură consistența între aplicația-copil (simulator) și cea-părinte (platforma).
 */
interface EvaluationData {
  type: 'evaluationResult';
  score: number;
  maxScore: number;
  details: string;
  tasksCompleted: number;
  totalTasks: number;
  extractedText: string;
  timestamp: string;
}

/**
 * Trimite rezultatul evaluării către fereastra părinte (platforma gazdă) folosind `postMessage`.
 * Această funcție este esențială pentru integrarea simulatorului într-un mediu extern,
 * permițând extragerea automată a scorului și a detaliilor de performanță.
 *
 * @param score Scorul obținut de utilizator.
 * @param maxScore Scorul maxim posibil (ex: 100).
 * @param details Un string care concatenează toate punctele de feedback.
 * @param tasksCompleted Numărul de sarcini finalizate corect.
 * @param totalTasks Numărul total de sarcini evaluate.
 */
export function sendEvaluationResult(
  score: number,
  maxScore: number,
  details: string,
  tasksCompleted: number,
  totalTasks: number
): void {
  // Verificăm dacă aplicația rulează într-un iframe pentru a ne asigura că `window.parent` există și este diferit de `window`.
  if (window.parent && window.parent !== window) {
    console.log('📤 Sending evaluation result to parent window...');

    // Creăm obiectul cu datele de evaluare conform structurii definite.
    const evaluationData: EvaluationData = {
      type: 'evaluationResult',
      score: score || 0,
      maxScore: maxScore || 100,
      details: details || '',
      tasksCompleted: tasksCompleted || 0,
      totalTasks: totalTasks || 0,
      // `extractedText` este un câmp suplimentar pentru compatibilitate sau debugging,
      // combinând cele mai importante informații într-un singur string.
      extractedText: `Scor: ${score}/${maxScore} - Detalii: ${details}`,
      timestamp: new Date().toISOString()
    };

    // Trimitem obiectul către aplicația părinte.
    // '*' permite comunicarea cu orice origine, ceea ce este flexibil pentru integrare.
    // Într-un mediu de producție, ar trebui înlocuit cu originea specifică a platformei gazdă.
    window.parent.postMessage(evaluationData, '*');

    console.log('✅ Evaluation result sent:', evaluationData);
  } else {
    // Dacă nu rulăm într-un iframe, afișăm un mesaj informativ în consolă.
    console.log('ℹ️ Not running in an iframe, skipping postMessage.');
  }
}
