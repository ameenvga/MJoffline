const electron = require('electron')
const {app, BrowserWindow} = electron
var path = require('path')
const fs = require('fs')
let win;

app.on('ready', () => {
        app.on('browser-window-created',function(e,window) {
//          window.setMenu(null);
      });

    win = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true
    },
        width:1080, 
        height: 600, 
        title: "മലയാള ജാലകം",
        frame: true,
        icon: path.join(__dirname, 'assets/icons/png/64x64.png')
//        icon: path.join(__dirname, 'assets/icons/win/icon.ico')
    
    })
    win.loadURL(`file://${__dirname}/home.html`)
    
    win.on('close', function(e){

    var choice = require('electron').dialog.showMessageBox(this,
        {
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: 'Are you sure you want to quit?'
       });
       if(choice == 1){
         e.preventDefault();
       }
    });
})



app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
      app.quit();
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})


