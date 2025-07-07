
import { FileSystemNode, VirtualFolderNode } from '../types';

/**
 * Finds a node (file/folder) in the file system tree based on a path.
 * @param root - The root node to start searching from.
 * @param path - An array of names representing the path to the node.
 * @returns The found node or undefined if not found.
 */
export const findNodeByPath = (root: FileSystemNode, path: string[]): FileSystemNode | undefined => {
  let currentNode: FileSystemNode | undefined = root;
  for (const segment of path) {
    if (currentNode && 'children' in currentNode) {
      currentNode = (currentNode as VirtualFolderNode).children.find(child => child.name === segment);
    } else {
      return undefined;
    }
  }
  return currentNode;
};

// Helper to create a deep copy of the file system to ensure immutability
const deepCopyFS = (root: FileSystemNode): FileSystemNode => {
    return JSON.parse(JSON.stringify(root), (key, value) => {
        if (key === 'modifiedDate' && value) {
            return new Date(value);
        }
        return value;
    });
};


/**
 * Adds a new node (file or folder) to a specified path in the file system.
 * @param root - The root of the file system.
 * @param path - The path to the parent folder where the node should be added.
 * @param newNode - The new node to add.
 * @returns A new root node with the added node.
 */
export const addNode = (root: FileSystemNode, path: string[], newNode: FileSystemNode): FileSystemNode => {
    const newRoot = deepCopyFS(root);
    
    const parent = findNodeByPath(newRoot, path.slice(1));
    if (parent && 'children' in parent) {
        // Prevent adding duplicates
        if (!parent.children.some(child => child.name === newNode.name)) {
            parent.children.push(newNode);
        }
    }
    return newRoot;
};

/**
 * Renames a node at a given path.
 * @param root - The root of the file system.
 * @param path - The full path to the node to be renamed.
 * @param newName - The new name for the node.
 * @returns A new root node with the renamed node.
 */
export const renameNode = (root: FileSystemNode, path: string[], newName: string): FileSystemNode => {
    const newRoot = deepCopyFS(root);

    const node = findNodeByPath(newRoot, path.slice(1));
    if (node) {
        node.name = newName;
    }
    return newRoot;
};

/**
 * Deletes a node from the file system and moves it to the Recycle Bin.
 * @param root - The root of the file system.
 * @param path - The path to the node to delete.
 * @returns A new root node with the deleted node moved to Recycle Bin.
 */
export const deleteNode = (root: FileSystemNode, path: string[]): FileSystemNode => {
    const newRoot = deepCopyFS(root);
    
    const parentPath = path.slice(1, -1);
    const nodeName = path[path.length - 1];
    
    const parent = findNodeByPath(newRoot, parentPath);
    const recycleBin = findNodeByPath(newRoot, ['Recycle Bin']);

    if (parent && 'children' in parent && recycleBin && 'children' in recycleBin) {
        const nodeIndex = parent.children.findIndex(child => child.name === nodeName);
        if (nodeIndex > -1) {
            const [nodeToDelete] = parent.children.splice(nodeIndex, 1);
            // Store original path for restoration
            nodeToDelete.originalPath = path;
            recycleBin.children.push(nodeToDelete);
        }
    }

    return newRoot;
};

/**
 * Restores a node from the Recycle Bin to its original location.
 * @param root - The root of the file system.
 * @param path - The path to the node inside the Recycle Bin.
 * @returns A new root node with the restored node.
 */
export const restoreNode = (root: FileSystemNode, path: string[]): FileSystemNode => {
    const newRoot = deepCopyFS(root);

    const recycleBinPath = path.slice(1, -1);
    const nodeName = path[path.length - 1];

    const recycleBin = findNodeByPath(newRoot, recycleBinPath);
    if (recycleBin && 'children' in recycleBin) {
        const nodeIndex = recycleBin.children.findIndex(child => child.name === nodeName);
        if (nodeIndex > -1) {
            const [nodeToRestore] = recycleBin.children.splice(nodeIndex, 1);
            if (nodeToRestore.originalPath) {
                const originalParentPath = nodeToRestore.originalPath.slice(1, -1);
                const originalParent = findNodeByPath(newRoot, originalParentPath);
                if (originalParent && 'children' in originalParent) {
                    delete nodeToRestore.originalPath;
                    originalParent.children.push(nodeToRestore);
                }
            }
        }
    }
    
    return newRoot;
};

export interface SearchResult {
    node: FileSystemNode;
    path: string[];
}

/**
 * Searches the entire file system for nodes matching a query.
 * @param root - The root node to start searching from.
 * @param query - The search term.
 * @returns An array of search results.
 */
export const searchFileSystem = (root: FileSystemNode, query: string): SearchResult[] => {
    const results: SearchResult[] = [];
    if (!query.trim()) return results;

    const lowerCaseQuery = query.toLowerCase();

    const search = (node: FileSystemNode, currentPath: string[]) => {
        if (node.name.toLowerCase().includes(lowerCaseQuery)) {
            // Exclude root "This PC" itself from search results
            if (currentPath.length > 1) { 
                results.push({ node, path: currentPath });
            }
        }

        if (node.type === 'folder' || node.type === 'drive') {
            for (const child of node.children) {
                search(child, [...currentPath, child.name]);
            }
        }
    };
    
    search(root, [root.name]);

    // Don't return the recycle bin folder itself in search results
    return results.filter(r => r.path[r.path.length-1] !== "Recycle Bin");
};
