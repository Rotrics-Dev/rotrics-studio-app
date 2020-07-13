const {app, BrowserWindow, shell} = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 768,
        minWidth: 850,
        minHeight: 400,
        webPreferences: {
            preload: path.join(__dirname, './start_server.js')
        },
        devTools: true,
        nodeIntegration: true,
    });

    // and load the index.html of the app.
    mainWindow.loadFile('./build-web/index.html')

    // mainWindow.webContents.openDevTools()

    // Open every external link in a new window of default OS browser
    // https://github.com/electron/electron/blob/master/docs/api/web-contents.md
    mainWindow.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });
}

//https://github.com/electron/electron/issues/18397
app.allowRendererProcessReuse = false;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
