// Enum pentru a defini tipurile de fișiere cunoscute în simulare.
// Folosirea unui enum ajută la evitarea erorilor de scriere și menține consistența.
export enum FileType {
  PDF = 'pdf',
  Excel = 'xlsx',
  Text = 'txt',
  Word = 'docx',
  PNG = 'png',
  JPG = 'jpg',
  Folder = 'folder',
  Drive = 'drive',
  RecycleBin = 'recyclebin',
}

// Interfață de bază pentru orice nod din sistemul de fișiere (fișier sau folder)
interface BaseFileSystemNode {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'drive';
  originalPath?: string[]; // Folosit pentru restaurarea din Recycle Bin
}

// Interfață specifică pentru un fișier
export interface VirtualFileNode extends BaseFileSystemNode {
  type: 'file';
  fileType: FileType;
  // Mărimea este stocată în KB pentru a facilita calculele și comparațiile.
  sizeKB: number;
  // Data modificării este stocată ca un obiect Date pentru sortare și filtrare ușoară.
  modifiedDate: Date;
}

// Interfață specifică pentru un folder
export interface VirtualFolderNode extends BaseFileSystemNode {
  type: 'folder' | 'drive';
  children: FileSystemNode[];
}

// Tip unificat care poate fi ori un fișier, ori un folder.
// Acest lucru permite crearea unei structuri arborescente.
export type FileSystemNode = VirtualFileNode | VirtualFolderNode;

// Tip pentru a defini modurile de vizualizare disponibile în File Explorer.
export type ViewMode = 'details' | 'icons' | 'list';

// --- Tipuri pentru managementul ferestrelor și aplicațiilor ---

// Enum pentru tipurile de aplicații care pot fi deschise
export enum AppType {
    FILE_EXPLORER = 'FILE_EXPLORER',
    NOTEPAD = 'NOTEPAD',
    CALCULATOR = 'CALCULATOR',
}

// Tipuri pentru starea ferestrei (poziție și dimensiune)
export type WindowPosition = { x: number; y: number };
export type WindowSize = { width: number; height: number };

// Starea completă a unei ferestre de aplicație deschisă
export interface AppWindowState {
    id: string; // ID unic pentru fiecare instanță de fereastră
    appType: AppType;
    title: string;
    position: WindowPosition;
    size: WindowSize;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
    // Stări specifice aplicației, ex: calea pt. Explorer
    appState?: {
        path?: string[];
        content?: string;
    };
    // Stare anterioară pentru a permite restaurarea după maximizare
    preMaximizedState?: { position: WindowPosition; size: WindowSize };
}

// --- Tipuri pentru evaluare și monitorizare acțiuni ---

// Interfață pentru filtrele de căutare avansată din File Explorer.
export interface SearchFilters {
  type?: FileType;
  // `comparison` definește dacă se caută 'mai mare ca' (gt) sau 'mai mic ca' (lt).
  // `value` este mărimea în KB.
  size?: { comparison: 'gt' | 'lt'; value: number };
  // `since` definește data de la care se caută (ex: fișiere mai noi de...).
  date?: { since: Date };
}

// Enum pentru tipurile de acțiuni pe care le monitorizăm pentru evaluare.
export enum ActionType {
  NAVIGATE = 'NAVIGATE',       // Când utilizatorul schimbă folderul.
  SEARCH = 'SEARCH',           // Când utilizatorul folosește căutarea/filtrele.
  FILE_OPEN = 'FILE_OPEN',     // Când utilizatorul deschide un fișier.
  APP_OPEN = 'APP_OPEN',         // Când utilizatorul deschide o aplicație.
}

// Structura unei înregistrări în log-ul de acțiuni.
// Fiecare acțiune a utilizatorului va fi un astfel de obiect.
export interface ActionLogEntry {
  type: ActionType;
  timestamp: number;
  // `payload` conține date specifice acțiunii (ex: calea la navigare).
  payload: any;
}

// Rezultatul unei evaluări, incluzând acum feedback detaliat.
export interface EvaluationResult {
  score: number;
  feedback: string;
  details: string[]; // Un array cu puncte de feedback specifice.
}