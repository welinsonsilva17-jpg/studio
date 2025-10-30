
'use client';

import { useState, useCallback, useEffect } from 'react';
import { initialFileSystem, FileSystemNode, DirectoryNode, FileNode } from '@/lib/filesystem';

const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useFileSystem = () => {
  const [fileSystem, setFileSystem] = useState<DirectoryNode>(() => deepClone(initialFileSystem));
  const [currentPath, setCurrentPath] = useState<string>('C:\\');
  const [startupCommandsExecuted, setStartupCommandsExecuted] = useState(false);

  const resolvePath = useCallback((path: string): { parent: DirectoryNode | null; node: FileSystemNode | null; name: string } => {
    const pathSegments = path.toUpperCase().replace(/\\/g, '/').split('/').filter(p => p);
    let currentNode: FileSystemNode = { type: 'directory', children: { 'C:': fileSystem } };
    let parentNode: DirectoryNode | null = null;
    
    if (pathSegments[0] !== 'C:') {
        return { parent: null, node: null, name: '' };
    }

    for (let i = 1; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        if (currentNode.type !== 'directory') {
            return { parent: null, node: null, name: '' };
        }
        parentNode = currentNode;
        currentNode = currentNode.children[segment];
        if (!currentNode) {
            return { parent: parentNode, node: null, name: segment };
        }
    }
    
    const name = pathSegments[pathSegments.length - 1] || 'C:';
    return { parent: parentNode, node: currentNode, name };

  }, [fileSystem]);

  const getNodeFromPath = useCallback((path: string, base: string = currentPath): FileSystemNode | null => {
    const absolutePath = getAbsolutePath(path, base);
    const { node } = resolvePath(absolutePath);
    return node;
  }, [currentPath, resolvePath]);

  const getAbsolutePath = (path: string, base: string): string => {
    path = path.toUpperCase();
    if (path.startsWith('C:\\')) return path;

    const baseSegments = base.replace('C:\\', '').split('\\').filter(p => p);
    const pathSegments = path.split('\\').filter(p => p);
    
    let finalSegments = [...baseSegments];

    for (const segment of pathSegments) {
      if (segment === '..') {
        finalSegments.pop();
      } else if (segment !== '.') {
        finalSegments.push(segment);
      }
    }
    return 'C:\\' + finalSegments.join('\\');
  };

  const changeDirectory = useCallback((path: string): string | null => {
    if (!path || path === '.') return null;
    if (path === '\\') {
        setCurrentPath('C:\\');
        return null;
    }
    const newPath = getAbsolutePath(path, currentPath);
    const targetNode = getNodeFromPath(newPath);

    if (targetNode && targetNode.type === 'directory') {
      setCurrentPath(newPath.endsWith('\\') ? newPath : newPath + '\\');
      return null;
    }
    return `Invalid directory: ${path}`;
  }, [currentPath, getNodeFromPath]);

  const listDirectory = useCallback((): string => {
    const node = getNodeFromPath(currentPath);
    if (!node || node.type !== 'directory') {
      return 'Error: Current path is not a directory.';
    }

    const children = node.children;
    const parentPath = getAbsolutePath('..', currentPath);
    const parentNode = getNodeFromPath(parentPath);

    let output = ` Volume in drive C has no label.\n`;
    output += ` Volume Serial Number is 1337-BEEF\n\n`;
    output += ` Directory of ${currentPath}\n\n`;

    const entries = Object.entries(children);
    let fileCount = 0;
    let dirCount = 0;
    let totalBytes = 0;

    const formatEntry = (name: string, entry: FileSystemNode) => {
      const date = '04-26-24';
      const time = '10:00p';
      if (entry.type === 'directory') {
        dirCount++;
        return `${name.padEnd(12)}<DIR>          ${date}  ${time}`;
      } else {
        fileCount++;
        const size = entry.content.length;
        totalBytes += size;
        return `${name.padEnd(12)}${size.toString().padStart(10)} ${date}  ${time}`;
      }
    };
    
    if (parentNode) {
      output += `.            <DIR>          \n`;
      output += `..           <DIR>          \n`;
      dirCount += 2;
    }

    entries.forEach(([name, entry]) => {
      output += `${formatEntry(name, entry)}\n`;
    });

    output += `${fileCount.toString().padStart(11)} File(s) ${totalBytes.toString().padStart(14)} bytes\n`;
    output += `${dirCount.toString().padStart(11)} Dir(s)  ${(64 * 1024 * 1024).toLocaleString().padStart(16)} bytes free`;

    return output;
  }, [currentPath, getNodeFromPath]);

  const readFile = useCallback((fileName: string): { content: string; error: null } | { content: null; error: string } => {
    const absolutePath = getAbsolutePath(fileName, currentPath);
    const { node } = resolvePath(absolutePath);

    if (!node) {
      return { content: null, error: 'File not found.' };
    }
    if (node.type !== 'file') {
      return { content: null, error: 'Not a file.' };
    }
    return { content: node.content, error: null };
  }, [currentPath, resolvePath]);

  const writeFile = useCallback((fileName: string, content: string): string | null => {
    const absolutePath = getAbsolutePath(fileName, currentPath);
    const { parent, node, name } = resolvePath(absolutePath);

    if (!parent) {
      return "Invalid path.";
    }

    setFileSystem(prevFs => {
      const newFs = deepClone(prevFs);
      const { parent: newParent } = resolvePath(absolutePath.substring(0, absolutePath.length - name.length));
      
      if(!newParent) return prevFs;

      if(node && node.type === 'directory') {
          return prevFs; // Cannot overwrite directory with file
      }

      (newParent as DirectoryNode).children[name] = {
        type: 'file',
        content: content,
      };

      // This is a bit of a hack to update the root fileSystem state correctly
      // as our fs is nested under 'C:' initially in the hook's view.
      const rootSegments = absolutePath.toUpperCase().replace(/\\/g, '/').split('/').filter(p => p);
      if (rootSegments.length > 1) {
        const rootDir = newFs.children[rootSegments[1]];
        if (rootDir && rootDir.type === 'directory') {
          let currentLevel = rootDir.children;
          for(let i=2; i<rootSegments.length-1; i++){
            currentLevel = (currentLevel[rootSegments[i]] as DirectoryNode).children;
          }
          currentLevel[name] = { type: 'file', content };
        }
      } else {
        (newFs.children[name] as FileNode) = { type: 'file', content };
      }
      return newFs;
    });

    return null;
  }, [currentPath, resolvePath]);

  return {
    currentPath,
    startupCommandsExecuted,
    setStartupCommandsExecuted,
    changeDirectory,
    listDirectory,
    readFile,
    writeFile,
    getAbsolutePath
  };
};
