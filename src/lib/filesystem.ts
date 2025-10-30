
export interface FileNode {
  type: 'file';
  content: string;
}

export interface DirectoryNode {
  type: 'directory';
  children: { [key: string]: FileSystemNode };
}

export type FileSystemNode = FileNode | DirectoryNode;

export const initialFileSystem: DirectoryNode = {
  type: 'directory',
  children: {
    'DOCS': {
      type: 'directory',
      children: {
        'README.TXT': {
          type: 'file',
          content: 'Welcome to Gerador Docs!\n\nThis is a DOS-like terminal interface built with Next.js and AI.\n\nAvailable commands:\n- dir: List directory contents\n- cd [path]: Change directory\n- type [file]: Display file content\n- edit [file]: Open a text editor for a file\n- cls: Clear the screen\n- help: Show this help message\n\nUnknown commands will be interpreted by an AI.\n'
        }
      }
    },
    'SYSTEM': {
      type: 'directory',
      children: {
        'IO.SYS': { type: 'file', content: 'SYSTEM FILE - READ ONLY' },
        'MSDOS.SYS': { type: 'file', content: 'SYSTEM FILE - READ ONLY' },
      }
    },
    'AUTOEXEC.BAT': {
      type: 'file',
      content: '@ECHO OFF\nPROMPT $P$G\nPATH C:\\SYSTEM\nECHO Gerador Docs Initialized.'
    },
    'CONFIG.SYS': {
      type: 'file',
      content: 'DEVICE=C:\\SYSTEM\\HIMEM.SYS\nFILES=20'
    }
  }
};
