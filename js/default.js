(function () {//main title bar closing and minimizing script
      
      const remote = require('electron').remote; 
      
      function init() { 
        document.getElementById("min-btn").addEventListener("click", function (e) {
          const window = remote.getCurrentWindow();
          window.minimize(); 
        });
        
        document.getElementById("max-btn").addEventListener("click", function (e) {
          const window = remote.getCurrentWindow();
          if (!window.isMaximized()) {
            window.maximize();
          } else {
            window.unmaximize();
          }	 
        });
        
        document.getElementById("close-btn").addEventListener("click", function (e) {
        if(currentSavedData != textarea.value){
            confAlert.render('Unsaved data will be lost. Are you sure you want to quit the application?', 'quit')
     }else if(textarea.value ==""){
          const window = remote.getCurrentWindow();
                window.close();
                window = null
     }else{
         const window = remote.getCurrentWindow();
                window.close();
                window = null
     }
          
        }); 
      }; 
      
      document.onreadystatechange = function () {
        if (document.readyState == "complete") {
          init(); 
        }
      };
})();