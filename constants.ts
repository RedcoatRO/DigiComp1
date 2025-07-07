import { FileSystemNode, FileType, VirtualFileNode } from './types';

// --- Helper Functions to Create Realistic Data ---

/**
 * Funcție pentru a crea o dată în trecut, scăzând un număr de zile din data curentă.
 * @param days - Numărul de zile de scăzut.
 * @returns Un obiect Date.
 */
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Funcție pentru a genera un număr aleatoriu într-un interval dat.
 * @param min - Valoarea minimă.
 * @param max - Valoarea maximă.
 * @returns Un număr întreg aleatoriu.
 */
const randomBetween = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1) + min);

// Liste de cuvinte pentru a genera denumiri de fișiere care par reale.
const fileNouns = ['Raport', 'Document', 'Prezentare', 'Buget', 'Factura', 'Contract', 'Proiect', 'Notite', 'Plan'];
const fileAdjectives = ['Final', 'Provizoriu', 'Revizuit', 'Anual', 'Trimestrial', 'Urgent', 'Important'];
const imagePrefixes = ['IMG', 'DSC', 'FOTO', 'VACANTA', 'SCREENSHOT'];

/**
 * Generează un fișier virtual aleatoriu cu proprietăți realiste (tip, nume, mărime, dată).
 * Acest helper ne permite să populăm rapid sistemul de fișiere cu date diverse.
 * @param id - Un ID unic pentru fișier, pentru a evita coliziunile.
 * @returns Un obiect de tip VirtualFileNode.
 */
const createRandomFile = (id: string): VirtualFileNode => {
    const fileTypes = [FileType.PDF, FileType.Excel, FileType.Word, FileType.PNG, FileType.JPG, FileType.Text];
    const type = fileTypes[randomBetween(0, fileTypes.length - 1)];
    
    let name = '';
    switch(type) {
        case FileType.PNG:
        case FileType.JPG:
            name = `${imagePrefixes[randomBetween(0, imagePrefixes.length - 1)]}_${randomBetween(1000, 9999)}.${type}`;
            break;
        default:
            name = `${fileNouns[randomBetween(0, fileNouns.length - 1)]}-${fileAdjectives[randomBetween(0, fileAdjectives.length - 1)]}-${randomBetween(1, 100)}.${type}`;
    }

    return {
        id,
        name,
        type: 'file',
        fileType: type,
        sizeKB: randomBetween(10, 8000), // Mărime între 10 KB și ~8 MB
        modifiedDate: daysAgo(randomBetween(1, 365)), // Modificat în ultimul an
    };
};

/**
 * Generează o listă de fișiere aleatorii folosind helper-ul `createRandomFile`.
 * @param count - Numărul de fișiere de generat.
 * @param idPrefix - Un prefix pentru ID-urile fișierelor pentru a asigura unicitatea în cadrul unui folder.
 * @returns Un array de FileSystemNode.
 */
const generateFiles = (count: number, idPrefix: string): FileSystemNode[] => {
    const files: FileSystemNode[] = [];
    for (let i = 0; i < count; i++) {
        files.push(createRandomFile(`${idPrefix}-${i}`));
    }
    return files;
};


// --- Simulated Hierarchical File System Data ---
// Aici definim întreaga structură de fișiere și foldere a sistemului.
// Aceasta a fost extinsă masiv pentru a oferi un scenariu de testare mai complex.
export const getInitialFileSystem = (): FileSystemNode => ({
  id: 'this-pc',
  name: 'This PC',
  type: 'folder',
  children: [
    {
      id: 'documents',
      name: 'Documents',
      type: 'folder',
      children: [
        {
          id: 'resurse-2023',
          name: 'Resurse 2023',
          type: 'folder',
          children: [
            {
              id: 'file-1',
              name: 'Manual utilizator imprimantă.pdf',
              type: 'file',
              fileType: FileType.PDF,
              sizeKB: 2100,
              modifiedDate: daysAgo(14),
            },
            {
              id: 'file-2',
              name: 'Manual instalare.pdf',
              type: 'file',
              fileType: FileType.PDF,
              sizeKB: 500,
              modifiedDate: daysAgo(90),
            },
            {
              id: 'file-3',
              name: 'Facturi 2023.xlsx',
              type: 'file',
              fileType: FileType.Excel,
              sizeKB: 1500,
              modifiedDate: daysAgo(1),
            },
            // Am adăugat 50 de fișiere noi, generate aleatoriu
            ...generateFiles(50, 'resurse-extra')
          ],
        },
        {
            id: 'proiecte',
            name: 'Proiecte',
            type: 'folder',
            children: generateFiles(18, 'proj') // Generăm ~15-20 fișiere
        },
        {
            id: 'financiar',
            name: 'Financiar',
            type: 'folder',
            children: generateFiles(15, 'fin') // Generăm 15 fișiere
        },
        {
            id: 'media',
            name: 'Media',
            type: 'folder',
            children: generateFiles(20, 'med') // Generăm 20 fișiere
        },
        {
            id: 'work-docs',
            name: 'Work',
            type: 'folder',
            children: [],
        }
      ],
    },
    {
      id: 'downloads',
      name: 'Downloads',
      type: 'folder',
      children: [],
    },
    {
        id: 'c-drive',
        name: 'Local Disk (C:)',
        type: 'drive',
        children: [
            { id: 'windows', name: 'Windows', type: 'folder', children: [] },
            { id: 'users', name: 'Users', type: 'folder', children: [] },
        ]
    },
    {
        id: 'recycle-bin',
        name: 'Recycle Bin',
        type: 'folder',
        children: []
    }
  ],
});