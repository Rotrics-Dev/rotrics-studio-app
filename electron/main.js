const {app, BrowserWindow, shell, Menu, MenuItem, globalShortcut, powerSaveBlocker} = require('electron');
const path = require('path');

function setUpMenu() {
    Menu.getApplicationMenu().items.forEach(item => {
            if (item.role === 'viewmenu') {
                let submenu = [];
                item.submenu.items.forEach(item => {
                    if (item.role === 'forcereload' || item.role === 'toggledevtools') {
                        submenu.push(new MenuItem({
                            role: item.role, type: item.type, label: item.label, click: item.click
                        }));
                    }
                });

                Menu.setApplicationMenu(Menu.buildFromTemplate([new MenuItem({
                    role: item.role, type: item.type, label: item.label, click: item.click,
                    submenu: Menu.buildFromTemplate(submenu)
                })]));
            }
        }
    );
}

function createWindow() {
    setUpMenu();
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 768,
        minWidth: 850,
        minHeight: 400,
        webPreferences: {
            preload: path.join(__dirname, './build-server/startLocalServer.js')
        },
        devTools: true,
        nodeIntegration: true,
    });
    mainWindow.loadFile('./build-web/index.html')
    // mainWindow.webContents.openDevTools();

    // Open every external link in a new window of default OS browser
    // https://github.com/electron/electron/blob/master/docs/api/web-contents.md
    mainWindow.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });

    return mainWindow
}

let mainWindow = null

//https://github.com/electron/electron/issues/18397
app.allowRendererProcessReuse = false;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    mainWindow = createWindow();
    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    })
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on("browser-window-focus", () => {
    // console.log('focus')

    // Mac环境下注册复制粘贴快捷键
    if (process.platform !== 'darwin' || !mainWindow) return
    globalShortcut.register('CommandOrControl+C', () => {
        // console.log('复制')
        mainWindow.webContents.copy()
    })

    globalShortcut.register("CommandOrControl+V", () => {
        // console.log('粘贴')
        mainWindow.webContents.paste();
    });
    // console.log('注册')
})

app.on("browser-window-blur", () => {
    // console.log('blur')
    globalShortcut.unregisterAll()
})

// 省电拦截器
const id = powerSaveBlocker.start('prevent-app-suspension')
console.log(`是否开启省电拦截器 ${powerSaveBlocker.isStarted(id)}`)

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
