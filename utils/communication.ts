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
 * Această versiune a fost actualizată pentru a corespunde exact cerințelor platformei gazdă,
 * trimițând mesajul necondiționat pentru a simplifica integrarea și depanarea.
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
  // Creăm obiectul cu datele de evaluare conform structurii definite.
  const evaluationData: EvaluationData = {
    type: 'evaluationResult',
    score: score,
    maxScore: maxScore,
    details: details,
    tasksCompleted: tasksCompleted,
    totalTasks: totalTasks,
    // `extractedText` este un câmp suplimentar pentru compatibilitate sau debugging,
    // combinând cele mai importante informații într-un singur string.
    extractedText: `Scor: ${score}/${maxScore} - Detalii: ${details}`,
    timestamp: new Date().toISOString()
  };
  
  // Trimitem obiectul către aplicația părinte necondiționat, conform cerințelor platformei gazdă.
  // '*' permite comunicarea cu orice origine.
  window.parent.postMessage(evaluationData, '*');
  
  console.log('🎉 Rezultat trimis către platformă:', evaluationData);
}
