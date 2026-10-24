const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nextupsDesktop", {
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
  reload: () => ipcRenderer.send("window-reload"),
  checkUpdate: () => ipcRenderer.invoke("check-update"),
  version: "1.0.3",
  engine: "NextUps Native Desktop Engine",
});
