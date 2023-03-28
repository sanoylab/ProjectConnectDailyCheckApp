require('./rt/electron-rt');
//////////////////////////////
// User Defined Preload scripts below
console.log('User Preload!');
import { contextBridge, ipcRenderer, shell } from "electron";   
contextBridge.exposeInMainWorld("ipcRenderer", {ipcRenderer});
contextBridge.exposeInMainWorld("shell", {shell});

// contextBridge.exposeInMainWorld('selectOption', (optionValue) => {
//     ipcRenderer.send('select-option', optionValue);
//   });