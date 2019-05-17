const path = require('path');
const isOnline = require('is-online');
const { autoUpdater } = require('electron-updater');

// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let lastConnection = false;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 1024,
    frame: true,

    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Comprobar conexión internet
  setInterval(async () => {
    let connection = await isOnline();

    if (!connection) {
      if (!lastConnection) {
        lastConnection = true;
        mainWindow.loadFile('not-connected.html');
      }
    } else {
      if (lastConnection) {
        lastConnection = false;
        mainWindow.loadFile('index.html');
      }
    }
  }, 2000);

  if (process.env.NODE_ENV === 'development') {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // watch changes
    require('electron-watch')(
      __dirname,
      'start:dev', // npm scripts, means: npm run dev:electron-main
      path.join(__dirname, './'), // cwd
      2000 // debounce delay
    );
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// ipcMain.on('getConnection', (event, arg) => {
//   var connection = true;

//   if (!connection) {
//     mainWindow.loadFile('not-connected.html');
//   }
// });

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  autoUpdater.checkForUpdates();
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// when the update has been downloaded and is ready to be installed, notify the BrowserWindow
autoUpdater.on('update-downloaded', info => {
  mainWindow.webContents.send('updateReady');
});

// when receiving a quitAndInstall signal, quit and install the new version ;)
ipcMain.on('quitAndInstall', (event, arg) => {
  autoUpdater.quitAndInstall();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
