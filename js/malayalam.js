
var recentFilesList = [];
var openTheFile =''
var recentMaxCount = 10;
//Plane animation
var appTimeCount;
//Variables
var bottom = document.getElementById("bottom");
var textarea = document.getElementById('ta');
var backdrop = document.getElementById('backdrop');
var title = document.getElementById('title');
var engMal = document.getElementById('engMal');
var fakeTextArea = document.getElementById('fakeTextArea');
var topSearchBox = document.getElementById('TopSearchBox');
var searchBoxMenu = document.getElementById('searchBoxMenu');
var aboutBox = document.getElementById('aboutBox')
var findReplaceStatus = document.getElementById("findReplaceStatus")
var wordCountDiv = document.getElementById('wordCount')
var indicator = document.getElementById('indicator')
var fontSizeIndicator = document.getElementById('fontSizeIndicator')
var EngMalToggle = true;
var click_count = 1;
var fileOpened = false;
var openedFileName = "";
var audio = new Audio('audio/bell.mp3');

var convertedFMLText = "";
var themeCount = 0;
var currentSavedData = '';
var lastSession;

// Electron Variables
let remote, app, dialog, fs, electron;

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && 
                 typeof window.process === 'object' && 
                 window.process.type === 'renderer';

if (isElectron) {
    try {
        remote = require('electron').remote;
        app = remote.app;
        dialog = remote.dialog;
        fs = require('fs');
        electron = require('electron');
    } catch (error) {
        console.warn('Electron modules not available, running in browser mode');
    }
} else {
    console.log('Running in browser mode - some features may be limited');
    // Mock Electron APIs for browser
    dialog = {
        showOpenDialog: () => Promise.resolve({ canceled: false, filePaths: [] }),
        showSaveDialog: () => Promise.resolve({ canceled: false, filePath: '' })
    };
    
    // Mock fs for browser
    fs = {
        readFile: (path, encoding, callback) => callback(null, ''),
        writeFile: (path, data, encoding, callback) => callback(null),
        existsSync: () => false
    };
}

//Event handlers
var typingFileds = document.getElementsByClassName('typingField')
textarea.onselectionchange =  updateDetails
textarea.onkeypress = timeToType
textarea.onkeydown = shortCutsController
textarea.onpaste = function(){
    console.log('Pasted something!')
    setTimeout(function(){ updateDetails(); }, 50);
    
}
for(i=0; i<typingFileds.length; i++){
    typingFileds[i].addEventListener("keypress", timeToType, false)
    typingFileds[i].onkeydown = TypingFieldShortCutController
}
function updateDetails(){
    
    console.log('!-------updateDetails------!')
    wordCount()
    addItem()
    if(searchON){
      findMatch()
    }
}
topSearchBox.addEventListener('keyup', findMatch, false)
textarea.addEventListener('scroll', handleScroll, false);

topSearchBox.onfocus = searchIsRunning
topSearchBox.onblur = searchIsNotRunning

jQuery('#ta').on('keypress', function() {
    updateDetails()
});


//recentfiles loading
function loadRecentFiles(){
    console.log("loading recent files")
    var loadedFiles = JSON.parse( localStorage.getItem('recentFiles'));
    if(loadedFiles == undefined ){ 
        console.log('!! no recent files found')
    }
    else {
//        console.log(loadedFiles)
        recentFilesList = loadedFiles
        
    }
    
    for (i=0; i < recentFilesList.length; i++){
        if(recentFilesList[i].trim() == ''){
            console.log("!!!!!!!!!!!!!")
            recentFilesList = removeItemFromArray(recentFilesList, recentFilesList[i])
        }
    }
    showRecentFileBox()
}



function updateRecentFiles(filename){
    console.log("update Recent Files")
    console.log(recentFilesList)
    console.log(filename)
    //clearing all empty members
    recentFilesList = recentFilesList.filter(Boolean)
    
    if(recentFilesList.includes(filename)){
        console.log('this file already in recent file list')
    }
    else {
        if(recentFilesList.length >= recentMaxCount){
            console.log(recentFilesList)
            recentFilesList.pop()
            console.log(recentFilesList)
            recentFilesList.unshift(filename)
            console.log(recentFilesList)
        }else{
            console.log(recentFilesList)
            console.log(filename)
            recentFilesList.unshift(filename)
            console.log(recentFilesList)
        }
    }
            
        
    localStorage.setItem("recentFiles", JSON.stringify(recentFilesList));
    console.log(recentFilesList)
}

function showRecentFileBox(){
    console.log('showRecentFileBox')
    var RecentBoxHtml='';
    
    for (i = 0; i < recentFilesList.length; i++) {
//        console.log(recentFilesList[i])
        
        var filename = recentFilesList[i].replace(/^.*[\\\/]/, '')
        RecentBoxHtml += '<div data-id='+ i +' onclick="openFileWithName(event)"  class="recentFileSingle"> <img data-id='+ i +' src="assets/icons/recentfile.svg" class="fileDetailIcon">  <div>  <div data-id='+ i +' class="filenameText">'+ filename + '</div>    <div data-id='+ i +' >' + recentFilesList[i] +'</div>  </div>   </div>' 
    }
    
    document.getElementById('recentFileDiv').innerHTML = RecentBoxHtml
}

function openFileWithName(event){
    console.log('open file with name');
    console.log(event.target.dataset.id)
    
    console.log(recentFilesList)
    openTheFile = recentFilesList[event.target.dataset.id]
    console.log(openTheFile)
    
    
    openFileFromHome(openTheFile)
//    readFile(openTheFile)
    
}
/////////////////////////////////PLEASE COMPLETE
function openFileFromHome(filename){ // opens file to read and load data
    console.log("open File")
    closeSearchBarBox()
    if(currentSavedData =='' && textarea.value == ""){
        console.log("Complete empty- both strings")
        readFile(filename)
    }
    
    else if(currentSavedData != textarea.value ){
        console.log("Some unsaved changes is there")
        confAlert.render('Unsaved data will be lost. Are you sure you want to open a new file?', 'openfileFromHomeScreen')
     }
    
    else{
         console.log("looks like nothing to save");
         readFile(filename)
     }
    
    
    
}
//Frequent Functions
var searchIsOnGoing = false
function searchIsRunning(){
    console.log("search is running true")
    searchIsOnGoing = true
}
function searchIsNotRunning(){
    console.log("search is Not Running")
    searchIsOnGoing = false
}
function createSelection(field, start, end) {
    console.log("createSelection")
        if( field.createTextRange ) {
            var selRange = field.createTextRange();
            selRange.collapse(true);
            selRange.moveStart('character', start);
            selRange.moveEnd('character', end);
            selRange.select();
        } else if( field.setSelectionRange ) {
            field.setSelectionRange(start, end);
        } else if( field.selectionStart ) {
            field.selectionStart = start;
            field.selectionEnd = end;
        }
        field.focus();
    }
function wordCount(){
    console.log("word count function")
    getLineNumber(textarea)
    var finalCount = 0
    start = textarea.selectionStart;
    end = textarea.selectionEnd;
    var selection = textarea.value.substring(start, end);

    if(selection.toString().length > 0){
        var totCount = selection.toString().split(/\r|\n/)
        for(i =0; i <totCount.length; i++){
            
            if(totCount[i] == "" ){

            }else{
                var sentArray = totCount[i].split(' ')
                for(j=0; j<sentArray.length; j++){
                    if(sentArray[j] == ""){

                    }else{
                        finalCount++
                    }
                }
            }
        }
        console.log('selection endis: ', end)
    }
    else{
        var totCount = textarea.value.split(/\r|\n/)
        for(i =0; i <totCount.length; i++){
            
            if(totCount[i] == "" ){

            }else{
                var sentArray = totCount[i].split(' ')
                for(j=0; j<sentArray.length; j++){
                    if(sentArray[j] == ""){

                    }else{
                        finalCount++
                    }
                }
            }
        }
    }
    
    wordCountDiv.innerHTML = finalCount
}
function getLineNumber(textarea) {
    
    var lines = textarea.value.substr(0, textarea.selectionStart).split(/\r|\n|\.|\?|\!/)
    var lineCount =0
    for(i=0; i < lines.length; i++){
        if(lines[i].trim() == ""){
        }else{
            lineCount++
        }
    }
//    console.log(lines)
    indicator.innerHTML = lineCount;
}
///Alert Boxes & Dialog Boxes
function CustomAlert(){
        
        var dialogOverlay = document.getElementById('dialogOverlay');
        var dialogBox = document.getElementById('dialogBox');
        var dialogBoxBody = document.getElementById('dialogBoxBody');
        var dialogBoxHead = document.getElementById('dialogBoxHead');
        var dialogBoxBottom = document.getElementById('dialogBoxBottom');
    
    this.render = function(dialog, format ){
        closeSearchBarBox()
        var winW = window.innerWidth;
        var winH = window.innerHeight;
        dialogOverlay.style.display = 'block';
        document.getElementById('dialogBoxHead').innerHTML = format.toUpperCase() + ' version of your text'
        dialogBox.style.display = "block";
        dialogBoxOpen = true
        
        dialogBoxBody.innerHTML =dialog;
        dialogBoxBody.focus();
        if(format == 'fml'){
            dialogBoxBody.classList.add('fmlFontClass')
            dialogBoxBody.classList.remove('mlkvFontClass')
        }else if(format == 'mlkv'){
            dialogBoxBody.classList.add('mlkvFontClass')
            dialogBoxBody.classList.remove('fmlFontClass')
        }
        dialogBoxBottom.innerHTML = '<button onclick="Alert.ok()" class="tabGuy"> <i class="fa fa-times" aria-hidden="true"></i>  Close             </button> <button onclick="Alert.copyClipboard()" class="tabGuy"> <i class="fa fa-files-o" aria-hidden="true"></i> Copy text </button> <button onclick="Alert.exportFile()" class="tabGuy"> <i class="fa fa-files-o" aria-hidden="true"></i> Export </button>'
        prepareTabGuys()
    }
    this.exportFile = function(){
        saveChange(dialogBoxBody.textContent)
    }
    this.ok = function(){
        dialogOverlay.style.display = 'none';
        dialogBox.style.display = "none" ;
        dialogBoxOpen = false
    }
    this.copyClipboard = function(){ //copying converted text to clipboard
        var selection = window.getSelection();
        if(selection.toString().length > 0){
            document.execCommand('copy');
        }
        else{
            var range = document.createRange();
            range.selectNodeContents(dialogBoxBody);
            selection.removeAllRanges();
            selection.addRange(range);
            //add to clipboard.
            document.execCommand('copy');
        }
        
    }
} 
var Alert = new CustomAlert();

function confirmAlert(){
        
        var dialogOverlay = document.getElementById('dialogOverlay');
        var confirmBox = document.getElementById('confirmBox');
        var confirmBoxHead = document.getElementById('confirmBoxHead');
        var confirmBoxBottom = document.getElementById('confirmBoxBottom');
        
    this.render = function(dialog, op){
        var titleColor=  window.getComputedStyle(document.getElementById('title-bar')).backgroundColor;
        var bodyColor = window.getComputedStyle(textarea).backgroundColor;
        var fontColor = window.getComputedStyle(textarea).color;
//        console.log(titleColor)
        var winW = window.innerWidth;
        var winH = window.innerHeight;
        dialogOverlay.style.display = 'block';
        confirmBox.style.display = "block";
        confirmBoxOpen = true
        confirmBoxBody.innerHTML =dialog;
        confirmBoxBottom.innerHTML = '<button id="ConfOkButton" class="tabGuy" autofocus="autofocus" onclick="confAlert.proceed(\''+ op + '\')"> <i class="fa fa-check" aria-hidden="true"></i>  Yes </button> <button id="ConfNoButton" class="tabGuy" onclick="confAlert.cancel()"> <i class="fa fa-times" aria-hidden="true"></i>No </button>'
        prepareTabGuys()
    }
    this.proceed = function(op){
        if(op =='clear'){
//            console.log("it is time to clear")
            fileOpened = false;
            openedFileName = "";
            title.innerHTML = "Untitled file";
            var typing=Typing("You just started a new file!", 5)
                typing();
            clearHistory();
            textarea.value = '';
            wordCount()
            currentSavedData = '';
            confirmBoxOpen = false
        }else if(op == 'openfile'){
            dialog.showOpenDialog({ filters: [

               { name: 'text', extensions: ['txt'] }

              ]},(filenames) => {
                  if(filenames === undefined ){
                    // alert("No file selected!");
                    return
                  }
                  else{
                    console.log("Trying to open file");
                    openedFileName = filenames[0];
                    readFile(filenames[0]);
                    title.innerHTML = openedFileName;
                    wordCount()
                    var typing=Typing('A new file opened', 5)
                    typing();
                  }
                });
            confirmBoxOpen = false
        }else if(op =='quit'){
                const window = remote.getCurrentWindow();
                window.close();
                 }
        else if(op =='recover'){
            if(lastSession !=''){
                textarea.value = lastSession
                wordCount()
                var typing=Typing('Last session recoverd!', 5)
                typing();
                
                ///
                fileOpened = false;
                openedFileName = "Untitled.txt";
                title.innerHTML = openedFileName;
            }else{
                textarea.value = 'Nothing to recover!'
                wordCount()
                fileOpened = false;
                openedFileName = "Untitled.txt";
                title.innerHTML = openedFileName;
                var typing=Typing('We cannot find any sessions in our memory!', 5)
                typing();
            }
            
        }else if(op = 'openfileFromHomeScreen'){
            console.log('================')
            console.log(openTheFile)
            readFile(openTheFile)
        }
        dialogOverlay.style.display = 'none';
        confirmBox.style.display = "none" ;
        confirmBoxOpen = false 
        
    }
    this.cancel = function(){ //copying converted text to clipboard
        dialogOverlay.style.display = 'none';
        confirmBox.style.display = "none" ;
        confirmBoxOpen = false
    }
}          
var confAlert = new confirmAlert();

function closeDialogBoxes(){
    document.getElementById('dialogOverlay').style.display = 'none';
    document.getElementById('confirmBox').style.display = "none" ;
    confirmBoxOpen = false
    
    document.getElementById('dialogBox').style.display = "none" ;
    dialogBoxOpen = false
    
    document.getElementById('findReplaceBox').style.display = "none" ;
    findReplaceOpen = false
}
function getConvertedUnicode(text){
    var convertedTextUnicode = ''
    for (i=0; i < text.length; i++){
//        console.log(text[i])
        if(getKeyByValue(fmlUniDict, text[i])){
            convertedTextUnicode += getKeyByValue(fmlUniDict, text[i])
        }
        else if(text[i]== '{'){
            var totalCharacter=''
            console.log('prakaaram in pastefrom fml text')
                var nextChar = getKeyByValue(fmlUniDict, text[i+1])
                totalCharacter = nextChar + "്ര"
                i++
            convertedTextUnicode += totalCharacter
        }
        else if(getKeyByValue(fmlUniVowelsDict, text[i])){
            var totalCharacter=''// Need to replace the next one
            //find the next letter and join it with this one and add
            var thisChar = getKeyByValue(fmlUniVowelsDict, text[i])
            if(text[i + 1] == 's' && text[i] == 's'){
                console.log('1')
                if(getKeyByValue(fmlUniDict, text[i + 2])){
                    var nextChar = getKeyByValue(fmlUniDict, text[i+2])
                    totalCharacter = nextChar + "ൈ"
                    i++
                    i++
                }
                
            }
            else if(text[i + 1] == '{' && text[i] == 's'){
                console.log('2')
                
                if(getKeyByValue(fmlUniDict, text[i + 2])){
                    var nextChar = getKeyByValue(fmlUniDict, text[i+2])
                    totalCharacter = nextChar +"്ര" + 'െ'
                    i++
                    i++
                }
                
            }
            else if(text[i + 1] == '{' && text[i] == 't'){
                console.log('3')
                
                if(getKeyByValue(fmlUniDict, text[i + 2])){
                    var nextChar = getKeyByValue(fmlUniDict, text[i+2])
                    totalCharacter = nextChar +"്ര" + 'േ'
                    i++
                    i++
                }
                
            }
            else{
                console.log('4')
                
                if(getKeyByValue(fmlUniDict, text[i + 1])){
                    var nextChar = getKeyByValue(fmlUniDict, text[i+1])
//                    console.log('next char is', nextChar)
                    totalCharacter = nextChar + thisChar
//                    console.log('total character = nextChar + this Char')
                    console.log(totalCharacter +' = '+ nextChar +' + '+ thisChar)
                    i++
                }
                else{
//                    console.log('5')
                    
                    totalCharacter = "‌"+thisChar
                }
            }
            
            
            
            convertedTextUnicode += totalCharacter
        }else{
            console.log('else statement in pastefrom fml text')
            convertedTextUnicode += text[i]
            
        }
    }
    
//    console.log(convertedTextUnicode)
    return convertedTextUnicode
}
fmlUniDict = {'.':'.',' ': ' ','-':'þ', 'അ':'A','ആ': 'B', 'ഇ':'C','ഉ': 'D',                   'ഋ':'E','എ':'F', 'ഏ':'G', 'ഒ':'H', 
        'ക':'I', 'ഖ':'J', 'ഗ':'K', 'ഘ':'L', 'ങ':'M', 'ച':'N', 'ഛ':'O', 'ജ':'P', 'ഝ':'Q', 'ഞ':'R', 'ട':'S', 'ഠ':'T', 'ഡ':'U', 'ഢ':'V', 'ണ':'W',
        'ത':'X', 'ഥ':'Y', 'ദ':'Z', 'ധ':'[', 'ന':'\\', 
        'പ': ']','ഫ':'^', 'ബ':'_', 'ഭ':'`','മ':'a', 
        'യ':'b', 'ര':'c', 'റ':'d', 'ല':'e', 'ള':'f', 
        'ഴ':'g', 'വ':'h', 'ശ':'i', 'ഷ':'j', 'സ':'k', 'ഹ':'l',
        'ാ':'m','ി':'n','ീ':'o','ു':'p',
        'ൂ':'q','ൃ':'r','ൗ':'u','്':'v',
        'ം':'w','ഃ':'x', 
        'ഈ':'Cu', 'ഊ':'Du', 'ഓ': 'Hm','ഐ':'sF', 'ഔ': 'Hu',
        "ര്‍":'À', 'ണ്‍':'¬', 'ന്‍':'³', 'ല്‍':'Â', 'ള്‍':'Ä' ,
        'ൻ':'³', 'ർ':'À', 'ൾ':'Ä', 'ൽ':'Â', 'ൺ':'¬',
        'ക്ക':'¡','ക്ല':'¢','ക്ഷ':'£',
        'ഗ്ഗ':'¤','ഗ്ല': '¥', 'ങ്ക': '¦','ങ്ങ': '§',
        'ച്ച':'¨', 'ഞ്ച':'©', 'ഞ്ഞ':'ª', 'ട്ട': '«',
        'ണ്ണ':'®','ത്ത': '¯', 'ത്ഥ': '°', 'ദ്ദ':'±',
        'ദ്ധ':'²', 'ന്ത': '´', 'ന്ദ': 'µ', 'ന്ന': '¶',
        'ന്മ': '·', 'പ്പ': '¸',  'പ്ല': '¹', 'ബ്ബ': 'º',
        'ബ്ല': '»','മ്പ': '¼', 'മ്മ': '½', 'മ്ല': '¾',
        'യ്യ':'¿', 'ല്ല':'Ã', 'ള്ള':'Å',
        'വ്വ':'Æ', 'ശ്ല':'Ç', 'ശ്ശ':'È', 'സ്ല':'É', 
        'സ്സ':'Ê','ഡ്ഡ':'Í', 'ക്ട':'Î', 'ബ്ധ':'Ï', 'ബ്ദ':'Ð',
        'ച്ഛ':'Ñ', 'ഹ്മ': 'Ò', 'ഹ്ന':'Ó','ന്ധ': 'Ô', 
        'ത്സ':'Õ', 'ജ്ജ':'Ö', "ണ്മ":'×', "സ്ഥ":'Ø', 
        'ന്ഥ':'Ù', 'ജ്ഞ':'Ú', 'ത്ഭ':'Û', 'ഗ്മ':'Ü',
        'ശ്ച':'Ý', 'ണ്ഡ':'Þ', 'ത്മ':'ß',
        'ക്ത':'à', 'ഗ്ന':'á', "ന്റ":'â',
        'ഷ്ട':'ã', 'റ്റ':'ä', "ണ്ട":'ï', 
        'ത്ത':'¯', "്വ":'z',"്യ":'y', 
               } //"്ര":'{'
fmlUniVowelsDict = {
    'െ':'s', 'േ':'t', 'ൈ': 'ss', 
}
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

//Toolbar functions
var activeLanguageButton = 'langMlBtn'
function makeActiveLanguage(lang){
    console.log('make it active language')
    var langEnBtn = document.getElementById('langEnBtn')
    var langMlBtn = document.getElementById('langMlBtn')
    var langArBtn = document.getElementById('langArBtn')
    
    var langBtnArray = [langEnBtn,langMlBtn,langArBtn]
    for(i=0; i<langBtnArray.length; i++){
        langBtnArray[i].classList.remove('activeLangBtn')
        langBtnArray[i].classList.add('langBtn')
    }
    try{
        document.getElementById(lang).classList.remove('langBtn')
        document.getElementById(lang).classList.add('activeLangBtn')
        activeLanguageButton = lang
        if(activeLanguageButton == 'langEnBtn'){
            changeKeyboardName(userSelectedEnKeyBoard)
            textarea.classList.remove('arabicOn')
            document.getElementById('langMedButton').innerHTML = 'EN'
        }
        else if(activeLanguageButton == 'langArBtn'){
            changeKeyboardName(userSelectedArKeyBoard)
            textarea.classList.add('arabicOn')
            document.getElementById('langMedButton').innerHTML = 'AR'
            
        }
        else if(activeLanguageButton == 'langMlBtn'){
            changeKeyboardName(userSelectedMlKeyBoard)
            textarea.classList.remove('arabicOn')
            document.getElementById('langMedButton').innerHTML = 'ML'
        }
    }catch(e){
        langMlBtn.classList.add('activeLangBtn')
        activeLanguageButton = 'langMlBtn'
        changeKeyboardName(userSelectedMlKeyBoard)
        textarea.classList.remove('arabicOn')
        document.getElementById('langMedButton').innerHTML = 'ML'
        
    }
    changeKeyBoardView()
    if(searchON){
        topSearchBox.focus()
    }else{
        textarea.focus()
        
    }
    audio.play();
}

function startnewFile(){
    clear()
}

function clear(){ //clearing text area
    console.log("clear function")
     if(currentSavedData == textarea.value){
            console.log("clearing cause nothing tosave")
            fileOpened = false;
            openedFileName = "";
            title.innerHTML = "Untitled file";
            
            var typing=Typing("You just started a new file!", 5)
                typing();
            clearHistory();
            textarea.value = '';
            wordCount()
            currentSavedData = '';
     }else if(currentSavedData != textarea.value ){
         confAlert.render('Unsaved data will be lost. Are you sure you want to start a new file?', 'clear')

     }else{
         confAlert.render('Unsaved data will be lost. Are you sure you want to start a new file?', 'clear')
     }
    
}
function changeTheme(){
    console.log("Changing theme");
    if(themeCount == 0){
        document.getElementById('pageStyle').setAttribute('href', 'css/medium.css' );
        localStorage.setItem('theme', 'css/medium.css');
        localStorage.setItem('themeCount', 1);
        themeCount++;
    }else if(themeCount == 1){
        document.getElementById('pageStyle').setAttribute('href', 'css/dark.css' );
        localStorage.setItem('theme', 'css/dark.css');
        localStorage.setItem('themeCount', 2);
        themeCount++;
    }else if(themeCount == 2){
        document.getElementById('pageStyle').setAttribute('href', 'css/green.css' );
        localStorage.setItem('theme', 'css/green.css');
        localStorage.setItem('themeCount', 3);
        themeCount++;
    }
    else{
        document.getElementById('pageStyle').setAttribute('href', 'css/classic.css' );
        localStorage.setItem('theme', 'css/classic.css');
        localStorage.setItem('themeCount', 0);
        themeCount = 0
    }
    
}
function copy_to_clipboard(){ //copying text to clipboard
        console.log("copy to clipboard");
        start = textarea.selectionStart;
        end = textarea.selectionEnd;
        var selection = textarea.value.substring(start, end);

        if(selection.toString().length > 0){
            console.log("copy to clipboard only selected portion");
            createSelection(textarea, start, end);
            document.execCommand('copy');
            
        }
        else{
            console.log("copy to clipboard entire text");
            textarea.select();
            document.execCommand('copy');
        }
    var typing=Typing("Text has been copied to clipboard.", 5)
    typing();
}
function copy_to_clipboard_field(myfield){ //copying text to clipboard
        console.log("copy to clipboard my field");
        start = myfield.selectionStart;
        end = myfield.selectionEnd;
        var selection = myfield.value.substring(start, end);

        if(selection.toString().length > 0){
            console.log("copy to clipboard only selected portion");
            createSelection(myfield, start, end);
            document.execCommand('copy');
            
        }
        
    var typing=Typing("Text has been copied to clipboard.", 5)
    typing();
}
function cut_to_clipboard(currentField){ //copying text to clipboard
        console.log("cut to clipboard");
    if(currentField == undefined){
        currentField = textarea
    }
        start = currentField.selectionStart;
        end = currentField.selectionEnd;
        var selection = currentField.value.substring(start, end);

        if(selection.toString().length > 0){
            console.log("cut to clipboard only selected portion");
            createSelection(currentField, start, end);
            document.execCommand('copy');
            text = currentField.value;
            text = text.slice(0, start) + text.slice(end);
            currentField.value = text;
            currentField.setSelectionRange(start, start);
            var typing=Typing("Text has been copied to clipboard.", 5)
            typing();
        }
        else{
        }
    

}
function saveChange(fileContent){ // saving changes to localstorage
    console.log("Save Change()")
    console.error(fileContent)
    if(fileContent == 'btnClick'){
        console.error('!!!!!!!!!COMING FROM HOME!!!!!')
        fileContent = textarea.value;
        console.log(fileContent)
    }
    closeSearchBarBox()
    dialog.showSaveDialog((filename) => {
      if(filename === undefined ){
        // alert("You didn't save the file");
        return
      }
//      var content = textarea.value;
      var content = fileContent;
        
      var lastFour = filename.substr(filename.length - 4); 
        if(lastFour == '.txt'){
            console.log("extension is present");
            filename = filename.substring(0, filename.length-4);
        }
        console.error('before writing')
        console.error(content)
      fs.writeFile(filename+".txt", content, (err)=> {
        if(err) console.log(err);
        fileOpened = true;
        var re = /(?:\.([^.]+))?$/;
        var ext = re.exec(filename)[1];
        openedFileName = filename+".txt";
        title.innerHTML = openedFileName;
        var typing=Typing("The file has been successfully saved", 5)
        typing();
        textarea.value == currentSavedData
        updateRecentFiles(openedFileName)
      })

    });
}
function updateFile(){
    console.log("updating file");
    
    var typing=Typing("The file has been successfully saved", 5)
        typing();
    currentSavedData = textarea.value;
    console.log(textarea.value == currentSavedData)
    var content = textarea.value;
  fs.writeFile(openedFileName, content, (err)=> {
    if(err) console.log(err);
  })
    saveThisToLastSession()
    console.log(openedFileName)
    updateRecentFiles(openedFileName)
}           
function readFile(filepath){//reading the file
  console.log("read File")
  fs.readFile(filepath, 'utf-8', (err, data) => {
    if(err){
      alert('An alert occured reading the file');
      return ;
    }
    textarea.value = data;
    currentSavedData = data;
    fileOpened = true;
    openedFileName = filepath
    wordCount()
    clearHistory()
    doArray=[textarea.value]
    console.log("file Opened is true");
    textarea.focus()
    title.innerHTML = filepath;
    var typing=Typing('A new file opened' , 5)
    typing();
  })
}
function openFile(){ // opens file to read and load data
    console.log("open File")
    closeSearchBarBox()
    if(currentSavedData =='' && textarea.value == ""){
        console.log("Complete empty- both strings")
        dialog.showOpenDialog({ filters: [

               { name: 'text', extensions: ['txt'] }

              ]},(filenames) => {
                  if(filenames === undefined ){
                    // alert("No file selected!");
                    return
                  }
                  else{
                    console.log("Trying to open file");
                    openedFileName = filenames[0];
                    readFile(filenames[0]);
//                    textarea.focus()
//                    title.innerHTML = openedFileName;
//                    var typing=Typing('A new file opened ' , 5)
//                    typing();
                  }
                });
    }
    
    else if(currentSavedData != textarea.value ){
        console.log("Some unsaved changes is there")
        confAlert.render('Unsaved data will be lost. Are you sure you want to open a new file?', 'openfile')
     }
    
    else{
         console.log("looks like nothing to save");
         dialog.showOpenDialog({ filters: [

               { name: 'text', extensions: ['txt'] }

              ]},(filenames) => {
                  if(filenames === undefined ){
                    // alert("No file selected!");
                    return
                  }
                  else{
                    console.log("Trying to open file");
                    openedFileName = filenames[0];
                    readFile(filenames[0]);
                      textarea.focus()
                    title.innerHTML = openedFileName;
                    var typing=Typing('A new file opened', 5)
                    typing();
                    clearHistory();
                
                  }
                });
     }
    
    
    
}

function stripHtml(html){
    console.log('stripHTML')
    // Create a new div element
    var temporalDivElement = document.createElement("div");
    // Set the HTML content with the providen
    temporalDivElement.innerHTML = html;
    // Retrieve the text property of the element (cross-browser support)
    return temporalDivElement.textContent || temporalDivElement.innerText || "";
}
function getTextToProcess(){
    start = textarea.selectionStart;
    end = textarea.selectionEnd;
    var selection = textarea.value.substring(start, end);

    if(selection.toString().length > 0){
        createSelection(textarea, start, end);
        var wholeText = selection;
        
    }
    else{
        var wholeText = textarea.value;
    }
    return wholeText
}
function convertToFML(){
    console.log("convert to FML")
    var fmlText = getConvertedToFML()
    convertedFMLText = fmlText.replace(/(\r\n|\n|\r)/gm, "<br>");
    emojiClose()
    Alert.render(convertedFMLText, 'fml' );
}
function copyStringToClipboard (str) {
    console.log("copyString to Clipboard")
   // Create new element
   var el = document.createElement('textarea');
   // Set value (string to be copied)
   el.value = str;
   // Set non-editable to avoid focus and move outside of view
   el.setAttribute('readonly', '');
   el.style = {position: 'absolute', left: '-9999px'};
   document.body.appendChild(el);
   // Select text inside element
   el.select();
   // Copy text to clipboard
   document.execCommand('copy');
   // Remove temporary element
   document.body.removeChild(el);
}
function copyToFML(){
    console.log("copy to fml")
    
    var textToday = getTextToProcess()
    if(textToday.trim()!= ''){
        var fmlText = getConvertedToFML()
        fmlText = stripHtml(fmlText)
        copyStringToClipboard(fmlText)
        var typing=Typing("FML text has been copied to clipboard.", 5)
        typing();
        textarea.focus()
    }
    else{
        var typing=Typing("There is no text available to convert.", 5)
        typing();
    }
   
}
function copyToMLKV(){
    console.log("copy to mlkv")
    var textToday = getTextToProcess()
    if(textToday.trim()!= ''){
        var fmlText = getConvertedToFML()
        fmlText = stripHtml(fmlText)
        fmlText = fmlText.replace(/ï/g, '@') 
        copyStringToClipboard(fmlText)

        var typing=Typing("MLK-KV text has been copied to clipboard.", 5)
        typing();
        textarea.focus()
    }
    else{
        var typing=Typing("There is no text available to convert.", 5)
        typing();
    }
}
function convertToMLKV(){
    console.log("convert To MLKV")
    var fmlText = getConvertedToFML()
    convertedFMLText = fmlText.replace(/(\r\n|\n|\r)/gm, "<br>");
    convertedFMLText = convertedFMLText.replace(/ï/g, '@') 
    emojiClose()
    Alert.render(convertedFMLText, 'mlkv');
}

function getConvertedToFML(){
    //initializing settings and localstorage stored data
    console.log('getConvertedFML')
    
        var fmlOut = "";
        var quotation_count = 0
        var single_quotation_count = 0
        fmlDict = {'.':'.',' ': ' ','-':'þ', 
                   'അ':'A','ആ': 'B',          
               'ഇ':'C','ഉ': 'D', 'ഋ':'E','എ':'F', 'ഏ':'G', 'ഒ':'H', 
                'ക':'I', 'ഖ':'J', 'ഗ':'K', 'ഘ':'L', 'ങ':'M', 'ച':'N', 'ഛ':'O', 'ജ':'P', 'ഝ':'Q', 'ഞ':'R', 'ട':'S', 'ഠ':'T', 'ഡ':'U', 'ഢ':'V', 'ണ':'W',
                'ത':'X', 'ഥ':'Y', 'ദ':'Z', 'ധ':'[', 'ന':'\\', 
                'പ': ']','ഫ':'^', 'ബ':'_', 'ഭ':'`','മ':'a', 
                'യ':'b', 'ര':'c', 'റ':'d', 'ല':'e', 'ള':'f', 
                'ഴ':'g', 'വ':'h', 'ശ':'i', 'ഷ':'j', 'സ':'k', 'ഹ':'l','ാ':'m','ി':'n','ീ':'o','ു':'p',
                'ൂ':'q','ൃ':'r','ൗ':'u','്':'v',
                'ം':'w','ഃ':'x', 
                'ഈ':'Cu', 'ഊ':'Du', 'ഓ': 'Hm','ഐ':'sF', 'ഔ': 'Hu',
                "ര്‍":'À', 'ണ്‍':'¬', 'ന്‍':'³', 'ല്‍':'Â', 'ള്‍':'Ä' ,
                'ൻ':'³', 'ർ':'À', 'ൾ':'Ä', 'ൽ':'Â', 'ൺ':'¬',

               }
        fmlKoottaksharam = {
                'കvക':'¡','കvല':'¢','കvഷ':'£',
                'ഗvഗ':'¤','ഗvല': '¥', 'ങvക': '¦','ങvങ': '§',
                'ചvച':'¨', 'ഞvച':'©', 'ഞvഞ':'ª', 'ടvട': '«',
                'ണvണ':'®','തvത': '¯', 'തvഥ': '°', 'ദvദ':'±',
                'ദvധ':'²', 'നvത': '´', 'നvദ': 'µ', 'നvന': '¶',
                'നvമ': '·', 'പvപ': '¸',  'പvല': '¹', 'ബvബ': 'º',
                'ബvല': '»','മvപ': '¼', 'മvമ': '½', 'മvല': '¾',
                'യvയ':'¿', 'ലvല':'Ã', 'ളvള':'Å',
                'വvവ':'Æ', 'ശvല':'Ç', 'ശvശ':'È', 'സvല':'É', 
                'സvസ':'Ê','ഡvഡ':'Í', 'കvട':'Î', 'ബvധ':'Ï', 'ബvദ':'Ð',
                'ചvഛ':'Ñ', 'ഹvമ': 'Ò', 'ഹvന':'Ó','നvധ': 'Ô', 
                'തvസ':'Õ', 'ജvജ':'Ö', 'ണvമ':'×', 'സvഥ':'Ø', 
                'നvഥ':'Ù', 'ജvഞ':'Ú', 'തvഭ':'Û', 'ഗvമ':'Ü',
                'ശvച':'Ý', 'ണvഡ':'Þ', 'തvമ':'ß',
                'കvത':'à', 'ഗvന':'á', 'നvറ':'â',
                'ഷvട':'ã', 'റvറ':'ä', 'ണvട':'ï', 
        }
        fmlVowelsMiddleDict ={
         'ൊ':'s', 'ോ':'t',
        }
        fmlVowelsDict = {
        'െ':'s', 'േ':'t', 'ൈ': 'ss',
        }
        engAlphabet= ['a','b','c','d','e','f','g','h','i','j','k','l','m','n',
                  'o','p','q','r','s','t','u','v','w','x','y','z',
                  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P',
                   'Q','R','S','T','U','V','W','X','Y','Z','#','$','_','['
                      ,']'
                  ];
        koottaksharamList ='¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäï';
        start = textarea.selectionStart;
        end = textarea.selectionEnd;
        var selection = textarea.value.substring(start, end);
        if(selection.toString().length > 0){
            createSelection(textarea, start, end);
            var wholeText = selection;
            
        }
        else{
            var wholeText = textarea.value;
        }
     

     for (var i = 0; i < wholeText.length; i++) {
         console.error('searching for = ' + wholeText.substring(i, i+3 ))
//         console.error(wholeText.substring(i, i+4))
         if(fmlDict[wholeText.substring(i, i+3)]){
                 fmlOut += fmlDict[wholeText.substring(i, i+3)];
                 i+=2;
             }
         else if(wholeText[i] == '"'){
             quotation_count++
             if(quotation_count%2 || quotation_count == 0){
                 fmlOut += '""'
             }else{
                 fmlOut += "''"
             }
         }
         else if(wholeText[i] == "'"){
             single_quotation_count++
             if(single_quotation_count%2 || single_quotation_count == 0){
                 
                 fmlOut += '"'
             }else{
                 
                 fmlOut += "'"
             }
         }
         // chandrakkal and no ra after it
         else if(wholeText[i]=='്' && wholeText[i+1] != 'ര'){
             //if koottaksharam is present
             if(fmlKoottaksharam[wholeText[i-1] +'v'+ wholeText[i+1]]){
                 var doubleLetter = wholeText[i-1] +'v'+ wholeText[i+1];
//                 console.log(doubleLetter);
                 fmlOut = fmlOut.slice(0, -1);
                 fmlOut += fmlKoottaksharam[doubleLetter];
                 i++;
             }//chekking swantham thile 'swa' 
             else if(wholeText[i+1] == 'വ'){
                 fmlOut += 'z'; 
                 i++;
             }
             else if(wholeText[i+1] == 'യ'){
                 fmlOut += 'y'; 
                 i++;
             }
             else{
                 fmlOut += fmlDict[wholeText[i]]; 
            }
         }
         //chandrakkala with ra means pra
         else if(wholeText[i]=='്' && wholeText[i+1] == 'ര'){
             var lastLetter = fmlOut[fmlOut.length-1];
             if(koottaksharamList.indexOf(lastLetter) != -1){
                 fmlOut = fmlOut.slice(0, -1);
                 fmlOut += '{'+ lastLetter;
                 i++;
             }
             else{
                 fmlOut = fmlOut.slice(0, -1);
                 fmlOut += '{'+ lastLetter;
                 i++;
             }
         }
          
         
         else{
             var fourLetterComb  = wholeText.substring(i, i+4)
             console.log('not in the main if clause')
             //is the letter present in just as a letter 
             

             if (fourLetterComb[fourLetterComb.length-1] + fourLetterComb[fourLetterComb.length-2] + fourLetterComb[fourLetterComb.length-3] == 'േവ്') {
                    console.log('nwE type proablem address here')  
//                     fmlOut = fmlOut.slice(0, -2);
                     fmlOut += 't' + fmlDict[fourLetterComb[fourLetterComb.length-4]] + 'z';
                     i+= 3
                 }
            else 
                if(fmlDict[wholeText[i]]){
                 console.log('found' + fmlDict[wholeText[i]] )
                 fmlOut += fmlDict[wholeText[i]];
             }
             //Is the letter present in vowels dictionaty
             else if(fmlVowelsDict[wholeText[i]]){
                 console.log('Heis present in the fmlVowelsDict')
                 
                 var lastLetter = fmlOut[fmlOut.length-1];
                 var secondLastLetter = fmlOut[fmlOut.length-2];
                 var thirdLastLetter = fmlOut[fmlOut.length-3];
                
           
                 
                 //checking nta combination is present
                 if(lastLetter == 'd' && secondLastLetter=='³' ){
                             console.error('***********************')

                     fmlOut = fmlOut.slice(0, -2);
                     fmlOut += fmlVowelsDict[wholeText[i]];
                     fmlOut += 'â';
//                     fmlOut += lastLetter;
                 }else if(lastLetter == 'y'&& fmlVowelsDict[wholeText[i]] =='t'){
                             console.error('***********************')

                     fmlOut = fmlOut.slice(0, -2);
                     fmlOut += 't'
                     fmlOut += secondLastLetter
                     fmlOut += lastLetter
                      }
                 else if(secondLastLetter == '{'){
                     console.error('***********************')
                     fmlOut = fmlOut.slice(0, -2);
                     fmlOut += fmlVowelsDict[wholeText[i]]
                     fmlOut += secondLastLetter
                     fmlOut += lastLetter
                         }
                 else if(lastLetter == '"'){
                     console.log("%%%%%%%%%%%%%%%%")
                     fmlOut += fmlVowelsDict[wholeText[i]]
                 }
                 else{

                     fmlOut = fmlOut.slice(0, -1);
                     fmlOut += fmlVowelsDict[wholeText[i]];
                     
                     if(lastLetter == undefined){
                         console.log('lastletter', lastLetter)
                     }else{
                         
                         
                         fmlOut += lastLetter;
                     }
                 }
                 
             }
             //is the letter present in vowelsMiddle dictionary
             else if(fmlVowelsMiddleDict[wholeText[i]]){
                 var lastLetter = fmlOut[fmlOut.length-1];
                 var secondLastLetter = fmlOut[fmlOut.length-2];
                 if(lastLetter == 'y'){
                     var secondLastLetter = fmlOut[fmlOut.length-2];
                     fmlOut = fmlOut.slice(0, -2);
                     fmlOut += fmlVowelsMiddleDict[wholeText[i]];
                     fmlOut += secondLastLetter;
                     fmlOut += lastLetter;
                     fmlOut += 'm';
                 }else if(secondLastLetter == '{'){
                     fmlOut = fmlOut.slice(0, -2);
                     fmlOut += fmlVowelsMiddleDict[wholeText[i]];
                     fmlOut += secondLastLetter;
                     fmlOut += lastLetter;
                     fmlOut += 'm';
                          }
                 else{
                     console.log('****************')
                     fmlOut = fmlOut.slice(0, -1);
                     fmlOut += fmlVowelsMiddleDict[wholeText[i]];
                     fmlOut += lastLetter;
                     fmlOut += 'm';
                 }

             }
             else if(engAlphabet.includes(wholeText[i])){
                 fmlOut += "<span class='engText'>"+wholeText[i]+"</span>";
             }
             else{
                 console.log('catched the undefined one!')
                 fmlOut += wholeText[i];
                 
             }
             
             
         } 
        
     }
     
     return fmlOut

 }
function alignText(currentAlign){
    console.log("alignText")
    if(currentAlign == 'left'){
        textarea.style.textAlign = 'left'
        backdrop.style.textAlign = 'left'
        localStorage.setItem('align', 'left')
    }else if(currentAlign == 'right'){
        textarea.style.textAlign = 'right'
        backdrop.style.textAlign = 'right'
        localStorage.setItem('align', 'right')
    }else if(currentAlign == 'center'){
        textarea.style.textAlign = 'center'
        backdrop.style.textAlign = 'center'
        localStorage.setItem('align', 'center')
    }else if(currentAlign == 'justify'){
        textarea.style.textAlign = 'justify'
        backdrop.style.textAlign = 'justify'
        localStorage.setItem('align', 'justify')
    }
    
}
function deselectAll() {
  var element = document.activeElement;
  
  if (element && /INPUT|TEXTAREA/i.test(element.tagName)) {
    if ('selectionStart' in element) {
      element.selectionEnd = element.selectionStart;
    }
    element.blur();
  }

  if (window.getSelection) { // All browsers, except IE <=8
    window.getSelection().removeAllRanges();
  } else if (document.selection) { // IE <=8
    document.selection.empty();
  }
}

var compactViewBool = false
function compactView(){
    console.log("compact View")
    var compactBtn = document.getElementById('compactButton')
    if(!compactViewBool && !emojiAdded){
        fakeTextArea.style.marginLeft = '0';
        fakeTextArea.style.width = '100%'
        compactViewBool = true
        compactBtn.classList.remove('fa-expand')
        compactBtn.classList.add('fa-compress')
    }
    else if(compactViewBool && !emojiAdded){
        fakeTextArea.style.marginLeft = '15%';
        fakeTextArea.style.width = '70%'
        compactViewBool = false
        compactBtn.classList.remove('fa-compress')
        compactBtn.classList.add('fa-expand')
    }
    else if(!compactViewBool && emojiAdded){
        fakeTextArea.style.marginLeft = '0%';
        fakeTextArea.style.width = '70%'
        compactViewBool = true
        compactBtn.classList.remove('fa-expand')
        compactBtn.classList.add('fa-compress')
    }
    else if(compactViewBool && emojiAdded){
        fakeTextArea.style.marginLeft = '0%';
        fakeTextArea.style.width = '70%'
        compactViewBool = false
        compactBtn.classList.remove('fa-compress')
        compactBtn.classList.add('fa-expand')
    }
    textarea.focus()
    console.log(compactViewBool)
    localStorage.viewModeBool = compactViewBool
}
function saveAsProjectFile(){
    console.log('save as project file')
}
//Search and Find and Replace
var searchWord;
var wordArray;
var replaceWord;
var searchNextCount = 0
var variationsArray = []
function findReplace(){
    console.log("find Replace")
    closeSearchBarBox()
    prepareTabGuys()
    searchNextCount = 0
    variationsArray = []
    document.getElementById('dialogOverlay').style.display = 'block'
    document.getElementById('findReplaceBox').style.display = 'block'
    document.getElementById('searchWord').value = ''
    document.getElementById('replaceWord').value = ''
    document.getElementById('findBoxRightSide').innerHTML = ''
    findReplaceStatus.innerHTML = 'Please enter your search word'
    document.getElementById('searchWord').focus()
    
}
function closeFindReplaceBox(){
    console.log("close Find Replace Box")
    document.getElementById('findReplaceBox').style.display = 'none'
    document.getElementById('dialogOverlay').style.display = 'none'
}

function findWord(){
    console.log("find Word")
    searchNextCount = 0
    document.getElementById('findBoxRightSide').innerHTML = ''
    textareaValue = textarea.value
    searchWord = document.getElementById('searchWord').value.trim()
    var foundCount = 0
    var variationCount = 0
    variationsArray = []
    var vowelsFilter = ['്', 'ാ', 'ി', 'ീ', 'ു', 'ൂ', 'ൃ', 'െ','േ','ൈ','ൊ','ോ','ൗ','ം','ഃ','ല്‍','ര്‍','ന്‍','ണ്‍', 'ള്‍','്‍',"‍"]
    //finding exact stand alone words
    if(textareaValue.trim() != ''){
        wordArray = textareaValue.split(/\r|\n/)
        if(searchWord != ''){

        for (i=0; i < wordArray.length; i++){
            var wordChildArray = wordArray[i].split(" ")
            for(j=0; j < wordChildArray.length; j++){
                if(wordChildArray[j] == searchWord){
                    foundCount++
                    if(!variationsArray.includes(wordChildArray[j])){
                        
                        variationsArray.push(wordChildArray[j]) 
                    }

                }
            }
        }
        findReplaceStatus.innerHTML = foundCount + " time/s found."
//        console.log('foundCount is', foundCount)

       }
       if(searchWord != ''){
//           console.log("searching for ",searchWord)
           var m = 0;
           for(k=searchWord.length; k > 0; k--){
            m++;
            //searching whether the part of the word is present in any word
            var partOfWord =  searchWord.slice(0, k)
            var partOfWordB =  searchWord.slice(m, searchWord.length)
//            console.log(partOfWord)
//            console.log(partOfWordB)
//            console.log(partOfWordB.length)
            
            for (i=0; i < wordArray.length; i++){
                var wordChildArray = wordArray[i].split(" ")
                for(j=0; j < wordChildArray.length; j++){
                    

                if(partOfWord!='' && vowelsFilter.indexOf(partOfWord)== -1){
//                  console.log("searching match for ", partOfWord)
//                  console.log("comparing with ", wordChildArray[j])
                  if( wordChildArray[j].includes(partOfWord)){
//                      console.log('=======found similar ----------')
                    if(!variationsArray.includes(wordChildArray[j])){
                        variationCount ++
                        variationsArray.push(wordChildArray[j]) 
                        }
                    }  
                }
                if( partOfWordB!='' && vowelsFilter.indexOf(partOfWordB)== -1){
//                    console.log("searching match for Bword ", partOfWordB)
//                    console.log("comparing with ", wordChildArray[j])
                    if(wordChildArray[j].includes(partOfWordB)){
//                        console.log('=======found similar ----------')
                    if(!variationsArray.includes(wordChildArray[j])){
                        variationCount ++
                        variationsArray.push(wordChildArray[j]) 
                        }
                    } 
                }
                    
                } 
            }
            
            
           }
           if(variationsArray.length == 1 ){
               findReplaceStatus.innerHTML = "Results found!"
               showVariations(variationsArray)
           }else if(variationsArray.length > 1 ){
               findReplaceStatus.innerHTML += " Variations found! Please check the possible variations of your word on the right side. Click on them to replace them with suitable words."
               showVariations(variationsArray)
           }
           else{}
               
           
       }
        else{
            findReplaceStatus.innerHTML = "Please make sure the entries are valid"
            } 
        }    
   }
function searchVariation(variationWord){
    console.log("search Variation")
    document.getElementById('searchWord').value = variationWord
    if(textareaValue.trim() != ''){
        wordArray = textareaValue.split(/\r|\n/)
        var variationCount = 0
        if(variationWord != ''){
            
        for (i=0; i < wordArray.length; i++){
            var wordChildArray = wordArray[i].split(" ")
            for(j=0; j < wordChildArray.length; j++){
                if(wordChildArray[j] == variationWord){
                    variationCount++
                }
            }
        }
        findReplaceStatus.innerHTML = variationCount + " time/s found."
//        console.log('foundCount is', foundCount)

       }
    }
}
function showVariations(array){
    console.log("show Variations")
    var variationBox = document.getElementById('findBoxRightSide')
//    console.log(array)
    if(array.length!=0){
        for(i=0; i < array.length; i++){
            variationBox.innerHTML += '<p class="variationWord">'+array[i]+'</p>'
        }
    }
}
function replaceAllWords(){
    console.log('replace all words')
    replaceWord = document.getElementById('replaceWord').value.trim()
    console.log(replaceWord)
    searchWord = document.getElementById('searchWord').value.trim()
    textareaValue = textarea.value
    
    if(replaceWord != ''&& searchWord!=""){

        for (i=0; i < wordArray.length; i++){
                var wordChildArray = wordArray[i].split(" ")
//                console.log(wordChildArray)
                for(j=0; j < wordChildArray.length; j++){
                    if(wordChildArray[j] == searchWord){
                        wordChildArray[j] = replaceWord
                    }
                }
                wordArray[i] = wordChildArray.join(" ")
           
                
            }
            textarea.value = wordArray.join("\n")            
            findReplaceStatus.innerHTML = "Replaced " + searchWord +" with " +
            replaceWord +"!"
            document.getElementById('searchWord').value = ''
       }
    
    else{
        findReplaceStatus.innerHTML = "Please make sure the entries are valid"
    }

}
function removeItemFromArray(arrayName, removingItem){
    console.log("removeItem from Array")
    for (var i = arrayName.length-1; i>=0; i--) {
    if (arrayName[i] == removingItem) {
        console.log('found equal item')
        arrayName.splice(i, 1);
        }
    }
    console.log('arrayName is,', arrayName)
    return arrayName
}
function applyHighlights(text){
    console.log("apply highlights")
    var searchWord = topSearchBox.value
    var WordsFount = []
    console.log('searchWord ', searchWord)
//    var wordArray = text.split(/\r|\n|\(|\)|\[|\]/)
    
        if(searchWord.trim() != ''){ // if something is entered in searchbox
            if(searchWord.trim().split(" ").length >= 2 ){
                var wordArray = text.split(/\r|\n|\.|\?|\!/)
                console.log("two words are in search box")
                for (i=0; i < wordArray.length; i++){
                var wordChildArray = wordArray[i].split(".")
                for(j=0; j < wordChildArray.length; j++){
                    if(wordChildArray[j].includes(searchWord)){
                        if(!WordsFount.includes(wordChildArray[j].trim())){
                            WordsFount.push(wordChildArray[j].trim()) 
                            }
                        }
                    }
                }
            }
            
            //searching if search word is just one word
            else if(searchWord.trim().split(" ").length == 1){
                console.log("One word exist")
                var wordArray = text.split(/\r|\n|\./)
                for (i=0; i < wordArray.length; i++){
                var wordChildArray = wordArray[i].split(" ")
                for(j=0; j < wordChildArray.length; j++){
                    if(wordChildArray[j].includes(searchWord)){
                        if(!WordsFount.includes(wordChildArray[j].trim())){
                            WordsFount.push(wordChildArray[j].trim()) 
                            }
                        }
                    }
                }
            
            }
            
            console.log(WordsFount)
            for(i=0; i<WordsFount.length; i++){
                console.log(WordsFount[i])
                var filteredWordFound = WordsFount[i].replace('?', '\\?')
                var reg = new RegExp(filteredWordFound, "g")
                text = text.replace(reg, '<span class="blueCap">$&</span>');
            }
        }
    
    
    return text;
    
    
}
var MatchNodes;
var searchDetail = document.getElementById('searchDetail');

function findMatch(){
    console.log('find match')
    
    handleScroll()
    backdrop.innerHTML = ''
    var text = textarea.value

    backdrop.innerHTML = applyHighlights(text)  
    NextMatchCount = 0  
    
    MatchNodes = backdrop.children

    console.log("^^^^^^^^",MatchNodes.length)
    if(MatchNodes.length == 1){
        searchDetail.innerHTML= "1 of 1 match"
    }else if(MatchNodes.length > 1){
        console.log("Greater than one")
        searchDetail.innerHTML = "1 of "+ MatchNodes.length + " matches"
    }else if(MatchNodes.length == 0){
        searchDetail.innerHTML= "No match found!" 
    }
    if(searchIsOnGoing){
      whereIstheMatchOf(0)
    }
    
}

function whereIstheMatchOf(NextMatchCount){
    console.log("whereIstheMatchOf")
    console.log(textarea.has)
    if(MatchNodes.length > 0){
        resetElement()
        scrollToFocus(MatchNodes[NextMatchCount])
        focusElement(MatchNodes[NextMatchCount])
        if(MatchNodes.length == 1){
            searchDetail.innerHTML = NextMatchCount+ 1 + " of "+ MatchNodes.length + " match"
        }else{
            searchDetail.innerHTML = NextMatchCount+ 1 + " of "+ MatchNodes.length + " matches"
        }
        }
    else{
        console.log('NO children found in backdrop')
    }
    }
var NextMatchCount = 0
function resetElement(){
    console.log("reset Element")
    for(i=0; i<MatchNodes.length; i++){
        MatchNodes[i].classList.remove('orangeCap')
        MatchNodes[i].classList.add('blueCap')
    }
}
function focusElement(el){
    console.log("focusElement")
    el.classList.add('orangeCap')
    el.classList.remove('blueCap')
}
function scrollToFocus(el){
    console.log("scrollToFocus")
    var amount = window.innerHeight/3
    try {
        backdrop.scrollTop = el.offsetTop - amount
        textarea.scrollTop = el.offsetTop - amount
    } catch (e) {
        //Catch Statement
    }
}
function findNextMatch(){
    console.log('find Next Match', NextMatchCount)
//    console.log('Total Count of Match Children', MatchNodes.length)
    if(NextMatchCount == 0){
        NextMatchCount++
        console.log('Nextmach count is in ----', NextMatchCount)
        whereIstheMatchOf(NextMatchCount)   
        
    }else if((NextMatchCount > 0) && (NextMatchCount < MatchNodes.length - 1)){
        NextMatchCount++
        console.log('Nextmach count is in ||||', NextMatchCount)
        whereIstheMatchOf(NextMatchCount)  
    }
    else{
        console.log('Nextmach count is in =====', NextMatchCount)
        NextMatchCount = 0
        whereIstheMatchOf(NextMatchCount)
    }
    
    
}
function findPreMatch(){
    console.log('find Pre Match', NextMatchCount)
    console.log('Total Count of Match Children', MatchNodes.length)
    if((NextMatchCount < MatchNodes.length) && (NextMatchCount > 0)){
        NextMatchCount--
        console.log('Nextmatch count is in !!!!!!!', NextMatchCount)
        whereIstheMatchOf(NextMatchCount)
        
    }else if(NextMatchCount == 1){
        NextMatchCount--
        console.log('Nextmatch count is in $$$$$$', NextMatchCount)
        whereIstheMatchOf(NextMatchCount)
    }
    else{
        console.log('Nextmatch count is in @@@@@', NextMatchCount)
        NextMatchCount = MatchNodes.length-1
        whereIstheMatchOf(NextMatchCount)
    }
    
    
}
function handleScroll(){
    console.log("handleScroll")
    if(backdrop.innerHTML != ''){
          textarea.scrollHeight = backdrop.scrollHeight
          var scrollTop = textarea.scrollTop
          backdrop.scrollTop = scrollTop
          textarea.scrollTop = backdrop.scrollTop

          var scrollLeft = textarea.scrollLeft
          backdrop.scrollLeft = scrollLeft
    }
  
}

///Undo Redo section and History
var undoCount = 0
var doArray = ['']
var doCursorArray = ['']
var maxUndoAmount = 50
function addItem(){
    console.log("add item to do Array")
//    console.log(textarea.value)
//    console.log(doArray.length)
    if(doArray.length >= 1){
//        console.log('greater than length one')
        if(textarea.value.trim() != doArray[0]){
            if(doArray.length > maxUndoAmount){
                doArray.splice(0,0, textarea.value.trim());
                doCursorArray.splice(0,0, textarea.selectionStart)
                doArray = doArray.slice(0, maxUndoAmount);
                
            }else{
                doArray.splice(0,0, textarea.value.trim());
                doCursorArray.splice(0,0, textarea.selectionStart);
            }
        }
    }
    else{
//        console.log('less than length one')
        doArray.splice(0,0, textarea.value.trim());
        doCursorArray.splice(0,0, textarea.selectionStart);
    }
//    console.log(doArray)
}
function clearHistory(){
    console.log("clear undo history");
    doArray = ['']
    doCursorArray = ['']
    undoCount = 0

}
function undoAction(){
    console.log("undo Action")
    if(doArray.length > 0 && undoCount < doArray.length-1 ){
        undoCount++
        textarea.value = doArray[undoCount];
        var curOldPos = doCursorArray[undoCount]
        createSelection(textarea, curOldPos, curOldPos);
        textarea.setSelectionRange(curOldPos,curOldPos);
        }
    textarea.blur()
    textarea.focus()
    wordCount()
}
function redoAction(){
    console.log("redoAction")
    if(doArray.length > 0 && undoCount > 0){
        undoCount--
        textarea.value = doArray[undoCount]
        var curOldPos = doCursorArray[undoCount]
        createSelection(textarea, curOldPos, curOldPos);
        textarea.setSelectionRange(curOldPos,curOldPos);
    }
    textarea.blur()
    textarea.focus()
    wordCount()
}

//File preferences and window resizing
function bannerHide(){
    document.getElementById('appBanner').style.display = 'none'
}
function showBanner(){
        document.getElementById('appBanner').style.display = 'flex'
    showRecentFileBox()
}
document.getElementById('bannerImage').ondragstart = function() { return false; };
document.getElementById('aboutBoxLogo').ondragstart = function() { return false; };
document.getElementById('planegif').ondragstart = function() { return false; };
document.getElementById('appIcon').ondragstart = function() { return false; };

var userSelectedMlKeyBoard = 'Phonetic';
var userSelectedEnKeyBoard = 'QWERTY';
var userSelectedArKeyBoard = 'Phonetic';
function loadPreference(){
    console.log("loadPreference")
    loadRecentFiles()
    document.getElementById('planeAnimBox').style.display = 'none'
    if (localStorage.getItem('theme')== 'css/classic.css' ||
        localStorage.getItem('theme')== 'css/medium.css' ||
        localStorage.getItem('theme')== 'css/dark.css' ||
        localStorage.getItem('theme')== 'css/green.css'){
        
            document.getElementById('pageStyle').setAttribute('href', localStorage.theme);
            themeCount = localStorage.themeCount
            console.log('theme set')

        }else{
            localStorage.setItem('theme','css/classic.css');
            document.getElementById('pageStyle').setAttribute('href','css/classic.css' )
            themeCount = 0;
    }
    
    if(localStorage.fontSize == null ||
      localStorage.fontSize == undefined 
      ){
        fakeTextArea.style.fontSize = "20px";
        localStorage.setItem('fontSize' , '20px')
        fontSizeIndicator.innerHTML = '20px'
    }else{
        fakeTextArea.style.fontSize = localStorage.fontSize;
//        click_count = Number(localStorage.click_count)
        fontSizeIndicator.innerHTML = localStorage.fontSize;
    }
    //window width and top buttons text display ta height problem
    resizeHappens()
    //loading the last session 
    if(localStorage.newSession == undefined ||
      localStorage.newSession == null){}
    else{
        lastSession = localStorage.newSession
    }
    
    
    
    //loading Compact View 
    console.log(compactViewBool)
    console.log(localStorage.viewModeBool)
    var viewMode = localStorage.viewModeBool
    if(viewMode == undefined ){}
    else if(viewMode == 'true'){
        console.log('view mode  is true')
        compactViewBool = false;
        compactView()
    }
    else if(viewMode == 'false'){
        console.log('view mode  is false')
        compactViewBool = true;
        compactView()
    }
    
    
    
    //loading Malayalam keyboard layout - For English and Arabic there is only one keyboard layout available.
    if(localStorage.keyBoard == 'ASCII'){
        userSelectedMlKeyBoard = 'ASCII'
        showMlASCKeyboard()
    }else if(localStorage.keyBoard == 'Inscript'){
        userSelectedMlKeyBoard = 'Inscript'
        showMlInscriptKeboard()
    }else{
        userSelectedMlKeyBoard = 'Phonetic'
        showMlPhoneticKeyboard()
    }
    
    if(localStorage.ArkeyBoard == 'Phonetic'){
        userSelectedArKeyBoard = 'Phonetic'
//        showArPhoneticKeyboard()
    }else if(localStorage.ArkeyBoard == '101'){
        userSelectedArKeyBoard = '101'
//        showAr101Keyboard()
    }else{
        userSelectedArKeyBoard = 'Phonetic'
//        showArPhoneticKeyboard()
    }
    //load align
    if(localStorage.align){
        try {
            textarea.style.textAlign = localStorage.align
        } catch (e) {
            textarea.style.textAlign = 'left'
            backdrop.style.textAlign = 'left'
        }
        try {
            backdrop.style.textAlign = localStorage.align
        } catch (e) {
            textarea.style.textAlign = 'left'
            backdrop.style.textAlign = 'left'
        }
    }else{
        textarea.style.textAlign = 'left'
        backdrop.style.textAlign = 'left'
    }
    
     if(localStorage.appTimes == undefined ||
      localStorage.appTimes == null){
        console.log("appTimes is undefined")
        localStorage.setItem("appTimes", 1 );
        appTimeCount = 1;
     }
     else{
        console.log("appTimes is ", localStorage.appTimes)
        appTimeCount = localStorage.appTimes
        appTimeCount ++
        localStorage.setItem("appTimes", appTimeCount );
        console.log("appTimes updated is ", localStorage.appTimes)
         
         if(appTimeCount % 100 == 0){
            console.log('divisible')
             document.getElementById('planeAnimBox').style.display = 'flex'
             document.getElementById('bannerDesc').innerHTML = 
                 'YOU ARE USING THIS SOFTWARE FOR THE '+ appTimeCount +'TH TIME!'
            var audioplane = new Audio('audio/planesound.mp3');
            document.getElementById('planeAnimBox').classList.add('comeIn');
            audioplane.play()
         }
     }
    
    
}
function saveThisToLastSession(){
    console.log('saveThisToLastSession')
    console.log('------------------------')
    localStorage.setItem('newSession',textarea.value )
    lastSession = localStorage.newSession
    console.log(localStorage.newSession)
}

window.onload = function(){
    loadPreference()
}
window.onresize = resizeHappens
function resizeHappens(){
    console.log('resizing resizing...')
//    console.log(window.innerWidth)
    hideAll()
    //margin-left: 0px; width: 100%; margin-right: 15%;
    if(window.innerWidth <= 700 && !emojiAdded && !compactViewBool){
        fakeTextArea.style.marginLeft = '0px'
        fakeTextArea.style.width = '100%'
        fakeTextArea.style.marginRight = '0px'
        closeKeyBoardView()
    }
    else if(window.innerWidth <= 700 && emojiAdded && !compactViewBool){
        fakeTextArea.style.marginLeft = '0px'
        fakeTextArea.style.width = '70%'
        fakeTextArea.style.marginRight = '15%'
        closeKeyBoardView()
        
    }
    else if(window.innerWidth <= 700 && emojiAdded && compactViewBool){
        fakeTextArea.style.marginLeft = '0px'
        fakeTextArea.style.width = '70%'
        fakeTextArea.style.marginRight = '15%'
        closeKeyBoardView()
        
    }
    else if(window.innerWidth <= 700 && !emojiAdded && compactViewBool){
        fakeTextArea.style.marginLeft = '0px'
        fakeTextArea.style.width = '100%'
        fakeTextArea.style.marginRight = '0%'
        closeKeyBoardView()
        
    }
    else if(window.innerWidth > 700 && !emojiAdded && !compactViewBool){
        fakeTextArea.style.marginLeft = '15%'
        fakeTextArea.style.width = '70%'
        fakeTextArea.style.marginRight = '15%'
    }
    else if(window.innerWidth > 700 && emojiAdded && !compactViewBool){
        fakeTextArea.style.marginLeft = '0%'
        fakeTextArea.style.width = '70%'
        fakeTextArea.style.marginRight = '15%'
    }
    else if(window.innerWidth > 700 && emojiAdded && compactViewBool){
        fakeTextArea.style.marginLeft = '0%'
        fakeTextArea.style.width = '70%'
        fakeTextArea.style.marginRight = '15%'
    }
    else if(window.innerWidth > 700 && !emojiAdded && compactViewBool){
        fakeTextArea.style.marginLeft = '0%'
        fakeTextArea.style.width = '100%'
        fakeTextArea.style.marginRight = '0%'
    }

}
function recoverLastSession(){
    console.log("recover Last session")
     if(currentSavedData != textarea.value ){
         confAlert.render('Unsaved data will be lost. Are you sure you want to close this file and proceed to recover last session?', 'recover')

     }else{
         textarea.value = lastSession
         fileOpened = false;
         openedFileName = "Untitled.txt";
         title.innerHTML = openedFileName;
         var typing=Typing('Last session recoverd!', 5)
         typing();
     }
    
}
document.body.ondrop = (ev) => {
    console.log(ev.dataTransfer.files[0].path)
    ev.preventDefault()
    openedFileName = ev.dataTransfer.files[0].path
    readFile(openedFileName);
    textarea.focus()
    title.innerHTML =  openedFileName;
    var typing=Typing('A new file opened', 5)
    typing();
    clearHistory();
}

////Context Manu area
window.onclick = hideEveryMenu
window.onkeydown = listenKeys;
function systemPasteListener(currentField) {
    console.log("System Paste listener");
    if(currentField == undefined){
        currentField = textarea
    }
    console.log(currentField);
    const {clipboard} = require('electron');
    insertAtCursor(currentField, clipboard.readText())
    updateDetails()
//    return clipboard.readText()
}
function gettingClipboardText(evt) {
    console.log("System Paste listener");
    const {clipboard} = require('electron');
//    console.log(clipboard.readText());
//    console.log(clipboard.readHTML())
    return clipboard.readText()
}
function quoteSelection(){
    console.log("quote selection")
        start = textarea.selectionStart;
        end = textarea.selectionEnd;
        var selection = textarea.value.substring(start, end);

        if(selection.toString().length > 0){
            console.log("quoting ");
            createSelection(textarea, start, end);
//            document.execCommand('copy');
            text = textarea.value;
            
            var output = [text.slice(0, start), '\n\n>>>> ', text.slice(start, end), ' <<<<\n\n', text.slice(end)].join('');
            textarea.value = output;
            textarea.setSelectionRange(end+14, end+14);
        }
        else{
        }
//    addItem()
    updateDetails()
}
function italicizeSelection(){
    console.log("italicize selection")
    start = textarea.selectionStart;
        end = textarea.selectionEnd;
        var selection = textarea.value.substring(start, end);

        if(selection.toString().length > 0){
            console.log("italicizing ");
            createSelection(textarea, start, end);
//            document.execCommand('copy');
            text = textarea.value;
            var formatedText = insertSymbol(text.slice(start, end),'_')
            var output = [text.slice(0, start),formatedText, text.slice(end)].join('');
            textarea.value = output;
            textarea.setSelectionRange(end+ 1, end+ 1);
        }
        else{
        }
//    addItem()
    updateDetails()
}
function boldSelection(){
    console.log("bold selection")
    start = textarea.selectionStart;
        end = textarea.selectionEnd;
        var selection = textarea.value.substring(start, end);

        if(selection.toString().length > 0){
            console.log("bolding ");
            createSelection(textarea, start, end);
//            document.execCommand('copy');
            text = textarea.value;
            
            var formatedText = insertSymbol(text.slice(start, end),'*')
            
            var output = [text.slice(0, start), formatedText,text.slice(end)].join('');
            textarea.value = output;
            textarea.setSelectionRange(end+ 1, end+ 1);
        }
        else{
        }
//    addItem()
    updateDetails()
}
function strikeSelection(){
    console.log("strike selection")
    start = textarea.selectionStart;
        end = textarea.selectionEnd;
        var selection = textarea.value.substring(start, end);

        if(selection.toString().length > 0){
            console.log("striking ");
            createSelection(textarea, start, end);
//            document.execCommand('copy');
            text = textarea.value;
            var formatedText = insertSymbol(text.slice(start, end),'~')
            var output = [text.slice(0, start),formatedText, text.slice(end)].join('');
            textarea.value = output;
            textarea.setSelectionRange(end+ 1, end+ 1);
        }
        else{
        }
//    addItem()
    updateDetails()
}
function insertSymbol(text, symbol){
    console.log("insert Symbol")
    var x = text.trim().split(/\r|\n/)
    var returnText = ''
    for (i = 0; i < x.length; i++){
        if(x[i]== ''){
            returnText += ''
        }else{
            returnText += symbol + x[i] + symbol + ' '
        }
        returnText += '\n'
    }
    return returnText
}
function cleanText(){
    console.log("clean Text")
        start = textarea.selectionStart;
        end = textarea.selectionEnd;
        var selection = textarea.value.substring(start, end);

        if(selection.toString().length > 0){
            text = textarea.value;
            text = text.slice(0, start) + text.slice(end);
            textarea.value = text;
            textarea.setSelectionRange(start, start);
            cleanedText = selection.replace(/[*_~]/g, '')
            cleanedText = cleanedText.replace(/[[]\d:\d\d \w\w, \d\/\d\d\/\d\d\d\d]\s/g, '')
            cleanedText = cleanedText.replace(/[[]\d\d:\d\d \w\w, \d\/\d\d\/\d\d\d\d]\s/g, '')
            insertAtCursor(textarea, cleanedText)
            
        }
        else{
            cleanedText = textarea.value.replace(/[*_~]/g, '')
            cleanedText = cleanedText.replace(/[[]\d:\d\d \w\w, \d\/\d\d\/\d\d\d\d]\s/g, '')
            textarea.value = cleanedText.replace(/[[]\d\d:\d\d \w\w, \d\/\d\d\/\d\d\d\d]\s/g, '')
    
        }
//    addItem()
    updateDetails()
}
//[[]\d:\d\d \w\w, \d/\d\d/\d\d\d\d]
//[[]\d\d:\d\d \w\w, \d/\d\d/\d\d\d\d]
var contextMenu = document.getElementById('contextMenu');
var menuBox = document.getElementById('menuBox')
var convertBoxMenu = document.getElementById('convertBoxMenu')
var alignBoxMenu = document.getElementById('alignBoxMenu')
var pasteFromMenuBox = document.getElementById('pasteFromMenuBox')
var MlKeyBoardBoxMenu = document.getElementById('MlKeyboardBoxMenu')
var EnKeyBoardBoxMenu = document.getElementById('EnKeyboardBoxMenu')
var ArKeyBoardBoxMenu = document.getElementById('ArKeyboardBoxMenu')
var saveAsMenuBox = document.getElementById('saveAsMenuBox')
function isHidden(el) {
    return (el.offsetParent === null)
}

var availableTabGuys = []
var tabTimes = 0
function prepareTabGuys(){
    var tabGuys = []
    availableTabGuys = []
    var tabTimes = 0
    tabGuys = document.getElementsByClassName('tabGuy')
    for(i=0; i<tabGuys.length; i++){
        if(!isHidden(tabGuys[i])){
            console.log(tabGuys[i])
            availableTabGuys.push(tabGuys[i])
        }
    }
    console.log(availableTabGuys)
}
function removeTabGuys(){
    var tabGuys = []
    availableTabGuys = []
    var tabTimes = 0
}
function listenKeys (event) {
    console.log('listenkeys')
//    hideContextMenu()
    var keyCode = event.which || event.keyCode;
    console.log(keyCode)
    if(keyCode == 32){
        console.log(appTimeCount)
        localStorage.setItem("newSession", textarea.value);
        
    }
    if(keyCode == 9 && !event.shiftKey && event.target.id!='ta'){
        console.log(event.target.id)
        console.log('tab pressed!!!!!!!!!!')
        console.log(availableTabGuys)
        if(availableTabGuys.length > 1){
            event.preventDefault()
            console.log("tabTimes- before ", tabTimes)
            totalTabCount  = availableTabGuys.length -1
            if(tabTimes < totalTabCount){
                tabTimes++
                console.log("tabTimes- working now ", tabTimes)
                console.log(availableTabGuys[tabTimes])
                try {
                    console.log('trying to Focus')
                    availableTabGuys[tabTimes].focus()
                } catch (e) {
                    //Catch Statement
                    console.log('tabFocus is not available for the below item')
                }
                
            }

            else{
                console.log("in greater than active focus on")
                tabTimes = 0
                console.log(availableTabGuys[tabTimes])
                try {
                    availableTabGuys[tabTimes].focus()
                } catch (e) {
                    console.log('tabFocus is not available for the below item')
                }
                
            }
        }

    }
    if(keyCode == 9 && event.shiftKey){
        console.log('shift tab is pressed!.....')
        console.log(availableTabGuys)
        if(availableTabGuys.length > 1){
            event.preventDefault()
            console.log("tabTimes- before ", tabTimes)
            totalTabCount  = availableTabGuys.length -1
            if(tabTimes <= totalTabCount && tabTimes > 0){
                tabTimes--
                console.log("tabTimes- working now ", tabTimes)
                try {
                    availableTabGuys[tabTimes].focus()
                } catch (e) {
                    //Catch Statement
                    console.log('tabFocus is not available for the below item')
                }
                console.log(availableTabGuys[tabTimes])
            }
            else if(tabTimes == 0 ){
                tabTimes = totalTabCount
                try {
                    availableTabGuys[tabTimes].focus()
                } catch (e) {
                    console.log('tabFocus is not available for the below item')
                }
                console.log(availableTabGuys[tabTimes])
            }
            else{
                console.log("in greater than active focus on")
                tabTimes = 0
                try {
                    availableTabGuys[tabTimes].focus()
                } catch (e) {
                    console.log('tabFocus is not available for the below item')
                }
                console.log(availableTabGuys[tabTimes])
            }
        }
    }
    if(keyCode == 9 && !event.shiftKey && event.target.id=='ta'){
        event.preventDefault()
        makeItIndent()
    }
    if(keyCode == 9 && event.shiftKey && event.target.id=='ta'){
        event.preventDefault()
        makeItUnindent()
    }
    if(keyCode == 27){ 
        hideAll()
        closeDialogBoxes()
    }
}


function hideEveryMenu(e){//using to hide everything and to open everything
    console.log('hide every menu')
    if(dialogBoxOpen == false){
        start = textarea.selectionStart;
        end = textarea.selectionEnd;
        var selection = textarea.value.substring(start, end);

        if(selection.toString().length > 0){
                createSelection(textarea, start, end);
            }
    }
    var elementId = e.target.id
    console.log(e)
    console.log(elementId)
    if(elementId == 'menuButton' || elementId == 'moreMedBtn' || elementId == 'optionArrow'){
        hideAll()
        showTopMenuBox(Event, elementId, 'menuBox' )
        openMenuBox()
    }
    else if(elementId == 'convertButton' || elementId == 'convertMedBtn' || elementId == 'convertArrow'){
        hideAll()
        showTopMenuBox(Event, elementId, 'convertBoxMenu' )
        openConvertBoxMenu()
    }
    else if(elementId == 'alignMedButton' ){        
        hideAll()
        showTopMenuBox(e,elementId, 'alignBoxMenu' )
        openAlignBoxMenu()
    }
    else if(elementId == 'langMedButton' ){        
        hideAll()
        showTopMenuBox(e,elementId, 'langBoxMenu' )
        openLangBoxMenu()
    }
    else if(elementId == 'keyboardSelect'|| elementId == 'keyboardMedIcon' || elementId == 'keyboardArrow'){
        hideAll()
        if(activeLanguageButton == 'langMlBtn'){
            showTopMenuBox(e,elementId, 'MlKeyboardBoxMenu' )
            openMlKeyBoardBoxMenu()
        }
        else if(activeLanguageButton == 'langEnBtn'){
            showTopMenuBox(e,elementId, 'EnKeyboardBoxMenu' )
            openEnKeyBoardBoxMenu()
        }
        else if(activeLanguageButton == 'langArBtn'){
            showTopMenuBox(e,elementId, 'ArKeyboardBoxMenu' )
            openArKeyBoardBoxMenu()
        }
    }
    else if (e.target.className == 'variationWord'){
        var target = e.target || e.srcElement,
        text = target.textContent || text.innerText;  
        console.log(text)
        if(text){
            searchVariation(text)
        }
    }
    else if(elementId == 'searchButton'){
        hideAll()
        if(searchON){
            closeSearchBarBox()
        }else{
            showSearchBarBox()
        }
        
    }
    else if(elementId == 'TopSearchCloseBtn'){
        hideAll()
        closeSearchBarBox()
    }
    else if(elementId == 'clearButton'){
        hideAll()
        closeSearchBarBox()
        clear()
    }   
    else if(elementId == 'pasteFromBtn'){
        hideAll()
        showSideMenuBox(e, elementId, 'pasteFromMenuBox')
        openPasteFromMenuBox()
    }
//    else if(elementId == 'saveAsBtn'){
//        hideAll()
//        showSideMenuBox(e, elementId, 'saveAsMenuBox')
//        openSaveAsMenuBox()
//    }
    else{
        hideAll()
    }
}
//Variables to determine whether the box is open or closed
var searchON = false // Whether the searchBox is Visible or not
var menuBoxOpen = false
var convertBoxMenuOpen = false
var contextMenuOpen = false
var MlKeyBoardMenuOpen = false
var EnKeyBoardMenuOpen = false
var ArKeyBoardMenuOpen = false
var alignBoxMenuOpen = false
var langBoxMenuOpen = false
var pasteFromMenuOpen = false
var aboutBoxOpen = false
var dialogBoxOpen = false
var confirmBoxOpen = false
var findReplaceOpen = false

function hideAll(){
    console.log("hideAll")
    closeMenuBox()
    closeConvertBoxMenu()
    closeContextMenu()
    closeMlKeyBoardBoxMenu()
    closeEnKeyBoardBoxMenu()
    closeArKeyBoardBoxMenu()
    closeAlignBoxMenu()
    closeLangBoxMenu()
    closePasteFromMenuBox()
//    closeFindReplaceBox()
    wordCount()
}
function showFindReplaceBox(){
    document.getElementById('dialogOverlay').style.display = 'block'
    document.getElementById('findReplaceBox').style.display = 'block'
    findReplaceOpen = true
}

function closeMenuBox(){
    menuBox.style.display = 'none'
    menuBoxOpen = false
}
function openMenuBox(){
    menuBox.style.display = 'block'
    menuBoxOpen = true
}
function closeConvertBoxMenu(){
    convertBoxMenu.style.display = 'none'
    convertBoxMenuOpen = false
}
function openConvertBoxMenu(){
    convertBoxMenu.style.display = 'block'
    convertBoxMenuOpen = true
}
function closeContextMenu(){
    contextMenu.style.display = 'none';
    contextMenuOpen = false
}
function showContextMenu(event) {
    console.log("showContextMenu")
    var contextMenu = document.getElementById('contextMenu');
    console.log("show context menu")
    
    var winW = window.innerWidth;
    var winH = window.innerHeight;

    if((winW - event.clientX) < 210 && (winH - event.clientY) > 280){
//        console.log("too right")
        contextMenu.style.left = (winW - 220 )+ 'px';
        contextMenu.style.top = event.clientY + 'px';
    }else if((winW - event.clientX) < 210 && (winH - event.clientY) < 280){
//        console.log("too right bottom")
        contextMenu.style.left = (winW - 220 )+ 'px';
        contextMenu.style.top = (winH - 550 )+ 'px';
    }else if((winH - event.clientY) < 550){
//        console.log("too bottom")
        contextMenu.style.left = (event.clientX)+ 'px';
        contextMenu.style.top = (winH - 550 )+ 'px';
    }
    else{
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
    }
    
    hideAll()
    contextMenu.style.display = 'block';
    contextMenuOpen = true
    return false;
}
function closeMlKeyBoardBoxMenu(){
    MlKeyBoardBoxMenu.style.display = 'none'
    MlKeyBoardMenuOpen = false
}
function openMlKeyBoardBoxMenu(){
    MlKeyBoardBoxMenu.style.display = 'block'
    MlKeyBoardMenuOpen = true
}
function closeEnKeyBoardBoxMenu(){
    EnKeyBoardBoxMenu.style.display = 'none'
    EnKeyBoardMenuOpen = false
}
function openEnKeyBoardBoxMenu(){
    EnKeyBoardBoxMenu.style.display = 'block'
    EnKeyBoardMenuOpen = true
}
function closeArKeyBoardBoxMenu(){
    ArKeyBoardBoxMenu.style.display = 'none'
    ArKeyBoardMenuOpen = false
}
function openArKeyBoardBoxMenu(){
    ArKeyBoardBoxMenu.style.display = 'block'
    ArKeyBoardMenuOpen = true
}
function closeAlignBoxMenu(){
    alignBoxMenu.style.display = 'none'
    alignBoxMenuOpen = false
}
function openAlignBoxMenu(){
    alignBoxMenu.style.display = 'block'
    alignBoxMenuOpen = true
}
function closeLangBoxMenu(){
    langBoxMenu.style.display = 'none'
    langBoxMenuOpen = false
}
function openLangBoxMenu(){
    langBoxMenu.style.display = 'block'
    langBoxMenuOpen = true
}
function closePasteFromMenuBox(){
    pasteFromMenuBox.style.display = 'none'
    pasteFromMenuOpen = false
}
function openPasteFromMenuBox(){
    pasteFromMenuBox.style.display = 'block'
    pasteFromMenuOpen = true
}
//function closeSaveAsMenuBox(){
//    saveAsMenuBox.style.display = 'none'
//    saveAsMenuOpen = false
//}
//function openSaveAsMenuBox(){
//    saveAsMenuBox.style.display = 'block'
//    saveAsMenuOpen = true
//}
function showSearchBarBox(){
    console.log('show search Box ')
    deselectAll()
    searchBoxMenu.style.display = 'flex'
    closeKeyBoardView()
    fakeTextArea.style.bottom = '150px'
    searchON = true
    topSearchBox.focus()
    prepareTabGuys()
}
function closeSearchBarBox(){
    console.log("close search box")
    searchON = false
    TopSearchBox.value = ''
    backdrop.innerHTML = ''
    searchBoxMenu.style.display = 'none'
    fakeTextArea.style.bottom = '30px'
}
function showAboutBox(){
    console.log("Show About Box")
    document.getElementById('dialogOverlay').style.display = 'block'
    aboutBox.style.display = 'flex'
    aboutBoxOpen = true
}
function closeAboutBox(){
    console.log("close About Box")
    document.getElementById('dialogOverlay').style.display = 'none'
    aboutBox.style.display = 'none'
    aboutBoxOpen = false
}
//function showTopMenuBox(e, elName, elBoxName){ //show menus in position
function showTopMenuBox(e, elName, elBoxName){ //show menus in position
    console.log("show Top Menu Box")
    var el = document.getElementById(elName)
    var box = document.getElementById(elBoxName)

    /////
    box.style.display = 'block'
    var winWidth = window.innerWidth
    var elRight =  el.getBoundingClientRect().left;
    var elWidth =  el.getBoundingClientRect().width / 2;
    
    var sBWidth = box.getBoundingClientRect().width;
    var position = elRight + elWidth - sBWidth / 2
//    console.log(elWidth)
    box.style.top = '50px'
    if(position < 60){
        box.style.left = '62px'
    }
    else{
        var leftPos = position+'px'
        box.style.left = leftPos
    }
} // showing top menu box according to click
function showSideMenuBox(e, elName, elBoxName){
    console.log("showConvertBox")
    var el = document.getElementById(elName)
    var box = document.getElementById(elBoxName)

    /////
    box.style.display = 'block'
    var winWidth = window.innerWidth
    var elRight =  el.getBoundingClientRect().left;
    console.log(el.offsetTop)
    var elWidth =  el.getBoundingClientRect().width / 2;
    
    var sBWidth = box.getBoundingClientRect().width;
    var position = elRight + elWidth - sBWidth / 2
    console.log(elWidth)
    
    box.style.top = el.offsetTop+'px'
    if(position < 60){
        box.style.left = '62px'
    }
    else{
        var leftPos = position+'px'
        box.style.left = leftPos
    }
}
//Print section
function printText(){
    console.log("printing")
    var data = textarea.value.replace(/\t/g, '    ')
    data =  data.replace(/\n/g, '<br/>')
    localStorage.setItem('printData', data)
    window.open('printWindow.html')

    
}

/////Changing keyboard name in topBar/////
function changeKeyboardName(el){
    console.log("changekeyBoardName")
    document.getElementById('keyboardSelect').innerHTML = 'Keyboard: '+ el +' <i id="keyboardArrow" class="fa fa-angle-down" aria-hidden="true"></i>'
}

function showMlPhoneticKeyboard(){
    console.log('showMlPhoneticKeyboard')
    userSelectedMlKeyBoard = 'Phonetic'
    textarea.focus()
    changeKeyboardName('Phonetic')
    localStorage.setItem('keyBoard', 'Phonetic')
    
    changeKeyBoardView()
}
function showMlInscriptKeboard(){
    console.log('showMlInscriptKeboard')
    
    userSelectedMlKeyBoard = 'Inscript'
    textarea.focus()
    //chaning the nav tab btn colors
    changeKeyboardName('Inscript')
    localStorage.setItem('keyBoard', 'Inscript')
    
    changeKeyBoardView()
}
function showMlASCKeyboard(){
    console.log('showMlASCKeyboard')
    userSelectedMlKeyBoard = 'ASCII'
    textarea.focus()
    changeKeyboardName('ASCII')
    localStorage.setItem('keyBoard', 'ASCII')
    
    changeKeyBoardView()
}
function showArPhoneticKeyboard(){
    console.log('showArPhoneticKeyboard')
    userSelectedArKeyBoard = 'Phonetic'
    textarea.focus()
    changeKeyboardName('Phonetic')
    localStorage.setItem('ArkeyBoard', 'Phonetic')
    changeKeyBoardView()
}
function showAr101Keyboard(){
    console.log('showAr101Keyboard')
    userSelectedArKeyBoard = '101'
    textarea.focus()
    changeKeyboardName('101')
    localStorage.setItem('ArkeyBoard', '101')
    changeKeyBoardView()
}
//Text manipulation tools
function getPreChar(myField){
    console.log("getPreChar")
    var startPos = myField.selectionStart;
    var preText = myField.value.substring(0, startPos)
    if(preText.length>0){
        var preCharacter = preText[preText.length-1]
        return preCharacter
    }
    
}
function getSecPreChar(myField){
    console.log("getSecPrechar")
    var startPos = myField.selectionStart;
    var preText = myField.value.substring(0, startPos)
    if(preText.length>1){
        var preSecCharacter = preText[preText.length-2]
        return preSecCharacter
    }else{
        return false
    }
    
}
function removeAndAdd(myField, myValue, times){
    console.log("removeAndAdd")
    if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        
        console.log(startPos)
        console.log(endPos)
        
        var preText = myField.value.substring(0, startPos)
        myField.value = preText.slice(0, -times)
            + myValue 
            + myField.value.substring(endPos, myField.value.length);
        myField.selectionStart = startPos + myValue.length+times-1;
        myField.selectionEnd = startPos + myValue.length+times-1;
        
        console.log(endPos)
        console.log(myValue)
        console.log(myValue.length)

        
        lastPos = endPos + myValue.length - 2
        createSelection(myField, startPos, endPos);
        myField.setSelectionRange(lastPos, lastPos)
        
        console.log(lastPos)
    }
}
function insertAtCursor(myField, myValue) {
    console.log("insert at cursor")
//    console.log("my FIeld here is " , myField)
    if (myField.selectionStart || myField.selectionStart == '0') {
        console.log('first part')
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos)
            + myValue
            + myField.value.substring(endPos, myField.value.length);
        myField.selectionStart = startPos + myValue.length;
        myField.selectionEnd = startPos + myValue.length;
//        lastPos = endPos + myValue.length
        lastPos = startPos + myValue.length
        createSelection(myField, startPos, endPos);
        myField.setSelectionRange(lastPos, lastPos)
    } else {
        console.log('first part')
        myField.value += myValue;
    }
//    addItem()
}

//Inscript Keyboard things
var RightSideConsonants = {' ':' ','y':'ബ', 'Y':'ഭ', 'u':'ഹ','U':'ങ', 'i':'ഗ', 'I':'ഘ',                         'o':'ദ', 'O':'ധ', 'p':'ജ', 'P':'ത്സ', '[':'ഡ','{':'ഢ','}':'ഞ','\\':'\\','^':'^', "|":"‌",
                   
                   'h':'പ','H':'ഫ',
                   'J':'റ','k':'ക','K':'ഖ','l':'ത','L':'ഥ',
                   ';':'ച',':':'ഛ',"'":'ട','"':'ഠ',
                   
                   'c':'മ','C':'ണ','v':'ന','j':'ര','/':'യ', 'b':'വ',
                    'B':'ഴ', 'n':'ല','N':'ള','m':'സ','M':'ശ','<':'ഷ',
                                    
                  } //
var RightSideVowels = {' ':' ',
    '~':'ഒ','-':'-','+':'ഋ',
   'Q':'ഔ','W':'ഐ','E':'ആ', 'R':'ഈ', 'T':'ഊ',
    
    'A':'ഓ','S':'ഏ','D':'അ','F':'ഇ','G':'ഉ',
    
     'Z':'എ',
}
var RightSideSmallVowels = {
    '=':"ൃ",'q':"ൗ", 'e':"ാ",'r':"ീ",'t':"ൂ",'f':"ി",'g':"ു",'x':"ം",'X':"ം",
}
var BothSideVowels = {'`':"ൊ",'a':"ോ" }
var LeftSideVowels = { 's':"േ", 'w':"ൈ",'z':"െ"}
var RightSideChill = {
    'ന്':'ന്‍', 'ല്':'ല്‍','ള്':'ള്‍', 'ര്':'ര്‍','ണ്':'ണ്‍', 
}
var RightSideExtras = {'d':"്", '_':'ഃ'}
function toinscript(e, myField){ 
    console.log('to inscript')
    
    var newLetter = e.key
    var preChar = getPreChar(myField)
    var secPreChar = getSecPreChar(myField)
    if(RightSideVowels[newLetter]){
        insertAtCursor(myField,RightSideVowels[newLetter] )
    }
    else if(RightSideSmallVowels[newLetter]){
        insertAtCursor(myField, RightSideSmallVowels[newLetter])
    }
    else if(BothSideVowels[newLetter]){
        insertAtCursor(myField,BothSideVowels[newLetter] )
    }
    else if(LeftSideVowels[newLetter]){
        insertAtCursor(myField, LeftSideVowels[newLetter])     
    }
    else if(RightSideConsonants[newLetter]){
        insertAtCursor(myField, RightSideConsonants[newLetter])

    }else if(RightSideExtras[newLetter]){
            insertAtCursor(myField, RightSideExtras[newLetter])
    }
    else if(newLetter == ']' && preChar == "്"){
        var newChill = secPreChar+ preChar
        if(RightSideChill[newChill]){
            removeAndAdd(myField, RightSideChill[newChill], 2)
        }
    }else{
        insertAtCursor(myField, newLetter)
    }
}

////FML Keyboard things 
var infmlVowels = {
    'A':'അ', 'B':'ആ', 'C':'ഇ', 'D':'ഉ', 'E':'ഋ', 'F':'എ', 'G':'ഏ', 'H':'ഒ',
     'v':'്','m':'ാ','n': 'ി','o': 'ീ','p':'ു'  ,'q':'ൂ' ,'r': 'ൃ',   
     'u':"ൗ",  'v':"്",  'w':"ം",  'x':"ഃ", 'y':"്യ",  'z' :"്വ","|":"‌"
} 
var infmlLeftVowels = {'s': "െ",  't':"േ", }
var infmlConsonants = {
    'I':'ക', 'J':'ഖ', 'K':'ഗ', 'L':'ഘ', 'M':'ങ',
    'N':'ച', 'O':'ഛ','P':'ജ','Q':'ത്സ','R':'ഞ', 'S':'ട','T':'ഠ','U':'ഡ','V':'ഢ','W':'ണ','X':'ത','Y':'ഥ','Z':'ദ',
    'a':'മ','b':'യ','c':'ര','d':'റ','e':'ല','f':'ള','g':'ഴ','h':'വ','i':'ശ','j':'ഷ',
    'k':'സ', 'l':'ഹ',
    '=':'=', '+':'+', '`':'ഭ','{':"്ര", '}':'}',';':';',':':':','"':'"',"'":"'",
                       '<':'<','/':'/','~':'~','_':'_',']':'പ','[':'ധ','\\':'ന',
    '^':'ഫ','_':'ബ',

}
var infmlCombinations = {
    '0161': 'ക്ക', '0162' :'ക്ല','0163': 'ക്ഷ', '0164':'ഗ്ഗ',
    '0165': 'ഗ്ല', '0166': 'ങ്ക', '0167': 'ങ്ങ', '0168' : 'ച്ച', '0169' : 'ഞ്ച',
    '0170':'ഞ്ഞ', '0171': 'ട്ട' , '0172': 'ണ്‍', '0173': 'ണ്ട', '0174': 'ണ്ണ',
    '0175': 'ത്ത', '0176': 'ത്ഥ', '0177': 'ദ്ദ', '0178' : 'ദ്ധ', '0179' : 'ന്‍',
    '0180': 'ന്ത', '0181' : 'ന്ദ', '0182' : 'ന്ന', '0183' :'ന്മ', '0184' : 'പ്പ',
    '0185':'പ്ല', '0186':'ബ്ബ', '0187' : 'ബ്ല', '0188': 'മ്പ', '0189': 'മ്മ',
    '0190':'മ്ല','0191':'യ്യ','0192':'ര്‍','0193':'റ്റ','0194':'ല്‍','0195':'ല്ല','0196':'ള്‍',
    '0197':'ള്ള','0198':'വ്വ','0199':'ശ്ല','0200':'ശ്ശ','0201':'സ്ല','0202':'സ്സ','0203':'ഹ്ല',
    '0204':'സ്റ്റ','0205':'ഡ്ഡ','0206': 'ക്ട','0207': 'ബ്ധ','0208':'ബ്ദ','0209':'ച്ഛ','0210': 'ഹ്മ',
    '0211': 'ഹ്ന','0212':'ന്ധ','0213': 'ത്സ','0214': 'ജ്ജ','0215': 'ണ്മ','0216':'സ്ഥ',
    '0217': 'ന്ഥ','0218': 'ജ്ഞ','0219': 'ത്ഭ','0220': 'ഗ്മ',    '0221':'ശ്ച','0222' :'ണ്ഡ', '0223': 'ത്മ','0224': 'ക്ത','0225' :'ഗ്ന','0226': 'ന്റ','0227' :'ഷ്ട','0228':'റ്റ',
    '0239': 'ണ്ട','0240':'ല്‍','0241' :'ല്ല','0242': 'ന്മ','0243': 'ന്ന','0244': 'ഞ്ച'

}
var combination = false;
var comboCount = 0
var comboCode ='';
function addCombo(key, myField){
    console.log('addCombo')
    console.log(key)
    
    if(comboCount<3){
        comboCount++
        comboCode = comboCode + key
        console.log('comboCode is', comboCode)
    }else if(comboCount == 3){
        comboCode = comboCode + key
        console.log('comboCode is', comboCode)
        console.log('combination is finished')
        if(infmlCombinations[comboCode]){
            insertAtCursor(myField, infmlCombinations[comboCode])
        }
        combination = false
        comboCount = 0
        comboCode = ''
    }
}
function addfmlLetter(e, myField){
    console.log("add fml Letter")
    var newLetter = e.key
//    console.log("myField in add fml letter is,", myField)
    if(infmlVowels[newLetter]){ 
        insertAtCursor(myField, infmlVowels[newLetter])
    }
    else if (infmlConsonants[newLetter]){
        insertAtCursor(myField, infmlConsonants[newLetter])
    }else if(infmlLeftVowels[newLetter]){
        insertAtCursor(myField, infmlLeftVowels[newLetter])
    }
    else if(isFinite(e.key)){
        insertAtCursor(myField, e.key) 
    }
    
}
function tofml(e, myField){
    
    console.log('to fml')
    if(combination == false){
        console.log('combination is false')
        e.preventDefault()
        addfmlLetter(e, myField)
    }

    else{// combination is true
        //check whether they are numbers or not
        console.log('combination is true')
        console.log(isFinite(e.key))
        if(isFinite(e.key)){
            console.log('entered key is a number')
            e.preventDefault()
            addCombo(e.key, myField)
        }else{
            console.log('key entered is not a number')
            e.preventDefault()
            combination = false
            addfmlLetter(e, myField)
        }


    }
    
}

/////New phonetic Malayalam keyboard things
var newPhoneticDict = {
    '~': "്",
    '-A': '-ാ',
    '-അa': '-ാ',
    "0": "0",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "്a": "",
    "്e": "െ",
    "്i": "ി",
    "്o": "ൊ",
    "്u": "ു",
    "്A": "ാ",
    "്E": "േ",
    "്I": "ീ",
    "്O": "ോ",
    "്U": "ൂ",
    "്Y": "ൈ",
    "െe": "ീ",
    "ൊo": "ൂ",
    "ിi": "ീ",
    "ിe": "ീ",
    "ുu": "ൂ",
    "ുo": "ൂ",
    "്r": "്ര്",
    "്ര്R": "ൃ",
    "k": "ക്",
    "ക്a": "ക",
    "ക്h": "ഖ്",
    "g": "ഗ്",
    "ഗ്h": "ഘ്",
    "ൻg": "ങ്",
    "c": "ക്‍",
    "ക്‍h": "ച്",
    "ച്h": "ഛ്",
    "j": "ജ്",
    "ജ്h": "ഝ്",
    "ൻj": "ഞ്",
    "ൻh": "ഞ്",
    "T": "ട്",
    "ട്h": "ഠ്",
    "D": "ഡ്",
    "ഡ്h": "ഢ്",
    "റ്റ്h": "ത്",
    "ത്h": "ഥ്",
    "d": "ദ്",
    "ദ്h": "ധ്",
    "p": "പ്",
    "പ്h": "ഫ്",
    "f": "ഫ്",
    "b": "ബ്",
    "ബ്h": "ഭ്",
    "y": "യ്",
    "v": "വ്",
    "w": "വ്",
    "z": "ശ്",
    "S": "ശ്",
    "സ്h": "ഷ്",
    "s": "സ്",
    "h": "ഹ്",
    "ശ്h": "ഴ്",
    "x": "ക്ഷ്",
    "R": "റ്",
    "t": "റ്റ്",
    "N": "ൺ",
    "n": "ൻ",
    "m": "ം",
    "r": "ർ",
    "l": "ൽ",
    "L": "ൾ",
    "a": "അ",
    "അa": "ആ",
    "A": "ആ",
    "e": "എ",
    "E": "ഏ",
    "എe": "ഈ",
    "i": "ഇ",
    "ഇi": "ഈ",
    "ഇe": "ഈ",
    "അi": "ഐ",
    "I": "ഐ",
    "o": "ഒ",
    "ഒo": "ഊ",
    "O": "ഓ",
    "അu": "ഔ",
    "ഒu": "ഔ",
    "u": "ഉ",
    "ഉu": "ഊ",
    "U": "ഊ",
    "H": "ഃ",
    "ർr": "ഋ",
    "ഋr": "ൠ",
    "ൽ^": "ഌ",
    "ഌu": "ൡ",
    "ൻt": "ന്റ്",
    "ന്റ്h": "ന്ത്",
    "ൻk": "ങ്ക്",
    "ൻn": "ന്ന്",
    "ൺN": "ണ്ണ്",
    "ൾL": "ള്ള്",
    "ൽl": "ല്ല്",
    "ംm": "മ്മ്",
    "ൻm": "ന്മ്",
    "ന്ന്g": "ങ്ങ്",
    "ൻd": "ന്ദ്",
    "ൺm": "ണ്മ്",
    "ൽp": "ല്പ്",
    "ംp": "മ്പ്",
    "റ്റ്t": "ട്ട്",
    "ൻT": "ണ്ട്",
    "ൺT": "ണ്ട്",
    "ണ്T": "ണ്ട്",
    "്ര്r": "ൃ",
    "ൻc": "ൻ‍",
    "ൻ‍h": "ഞ്ച്",
    "ൺD": "ണ്ഡ്",
    "B": "ബ്ബ്",
    "C": "ക്ക്‍",
    "F": "ഫ്",
    "G": "ഗ്ഗ്",
    "J": "ജ്ജ്",
    "K": "ക്ക്",
    "M": "മ്മ്",
    "P": "പ്പ്",
    "Q": "ക്യൂ",
    "V": "വ്വ്",
    "W": "വ്വ്",
    "X": "ക്ഷ്",
    "Y": "യ്യ്",
    "Z": "ശ്ശ്",
    "്L": "്ല്",
    "്~": "്‌",
    "‌~": "‌",
    "ം~": "മ്‌",
    "ക്‍c": "ക്ക്‍",
    "ക്ക്‍h": "ച്ച്",
    "q": "ക്യൂ",
    "കa": "കാ",
    "കe": "കേ",
    "കi": "കൈ",
    "കo": "കോ",
    "കu": "കൗ",
    "ഖa": "ഖാ",
    "ഖe": "ഖേ",
    "ഖi": "ഖൈ",
    "ഖo": "ഖോ",
    "ഖu": "ഖൗ",
    "ഗa": "ഗാ",
    "ഗe": "ഗേ",
    "ഗi": "ഗൈ",
    "ഗo": "ഗോ",
    "ഗu": "ഗൗ",
    "ഘa": "ഘാ",
    "ഘe": "ഘേ",
    "ഘi": "ഘൈ",
    "ഘo": "ഘോ",
    "ഘu": "ഘൗ",
    "ങa": "ങാ",
    "ങe": "ങേ",
    "ങi": "ങൈ",
    "ങo": "ങോ",
    "ങu": "ങൗ",
    "ചa": "ചാ",
    "ചe": "ചേ",
    "ചi": "ചൈ",
    "ചo": "ചോ",
    "ചu": "ചൗ",
    "ഛa": "ഛാ",
    "ഛe": "ഛേ",
    "ഛi": "ഛൈ",
    "ഛo": "ഛോ",
    "ഛu": "ഛൗ",
    "ജa": "ജാ",
    "ജe": "ജേ",
    "ജi": "ജൈ",
    "ജo": "ജോ",
    "ജu": "ജൗ",
    "ഝa": "ഝാ",
    "ഝe": "ഝേ",
    "ഝi": "ഝൈ",
    "ഝo": "ഝോ",
    "ഝu": "ഝൗ",
    "ഞa": "ഞാ",
    "ഞe": "ഞേ",
    "ഞi": "ഞൈ",
    "ഞo": "ഞോ",
    "ഞu": "ഞൗ",
    "ടa": "ടാ",
    "ടe": "ടേ",
    "ടi": "ടൈ",
    "ടo": "ടോ",
    "ടu": "ടൗ",
    "ഠa": "ഠാ",
    "ഠe": "ഠേ",
    "ഠi": "ഠൈ",
    "ഠo": "ഠോ",
    "ഠu": "ഠൗ",
    "ഡa": "ഡാ",
    "ഡe": "ഡേ",
    "ഡi": "ഡൈ",
    "ഡo": "ഡോ",
    "ഡu": "ഡൗ",
    "ഢa": "ഢാ",
    "ഢe": "ഢേ",
    "ഢi": "ഢൈ",
    "ഢo": "ഢോ",
    "ഢu": "ഢൗ",
    "ണa": "ണാ",
    "ണe": "ണേ",
    "ണi": "ണൈ",
    "ണo": "ണോ",
    "ണu": "ണൗ",
    "തa": "താ",
    "തe": "തേ",
    "തi": "തൈ",
    "തo": "തോ",
    "തu": "തൗ",
    "ഥa": "ഥാ",
    "ഥe": "ഥേ",
    "ഥi": "ഥൈ",
    "ഥo": "ഥോ",
    "ഥu": "ഥൗ",
    "ദa": "ദാ",
    "ദe": "ദേ",
    "ദi": "ദൈ",
    "ദo": "ദോ",
    "ദu": "ദൗ",
    "ധa": "ധാ",
    "ധe": "ധേ",
    "ധi": "ധൈ",
    "ധo": "ധോ",
    "ധu": "ധൗ",
    "നa": "നാ",
    "നe": "നേ",
    "നi": "നൈ",
    "നo": "നോ",
    "നu": "നൗ",
    "പa": "പാ",
    "പe": "പേ",
    "പi": "പൈ",
    "പo": "പോ",
    "പu": "പൗ",
    "ഫa": "ഫാ",
    "ഫe": "ഫേ",
    "ഫi": "ഫൈ",
    "ഫo": "ഫോ",
    "ഫu": "ഫൗ",
    "ബa": "ബാ",
    "ബe": "ബേ",
    "ബi": "ബൈ",
    "ബo": "ബോ",
    "ബu": "ബൗ",
    "ഭa": "ഭാ",
    "ഭe": "ഭേ",
    "ഭi": "ഭൈ",
    "ഭo": "ഭോ",
    "ഭu": "ഭൗ",
    "മa": "മാ",
    "മe": "മേ",
    "മi": "മൈ",
    "മo": "മോ",
    "മu": "മൗ",
    "യa": "യാ",
    "യe": "യേ",
    "യi": "യൈ",
    "യo": "യോ",
    "യu": "യൗ",
    "രa": "രാ",
    "രe": "രേ",
    "രi": "രൈ",
    "രo": "രോ",
    "രu": "രൗ",
    "ലa": "ലാ",
    "ലe": "ലേ",
    "ലi": "ലൈ",
    "ലo": "ലോ",
    "ലu": "ലൗ",
    "വa": "വാ",
    "വe": "വേ",
    "വi": "വൈ",
    "വo": "വോ",
    "വu": "വൗ",
    "ശa": "ശാ",
    "ശe": "ശേ",
    "ശi": "ശൈ",
    "ശo": "ശോ",
    "ശu": "ശൗ",
    "ഷa": "ഷാ",
    "ഷe": "ഷേ",
    "ഷi": "ഷൈ",
    "ഷo": "ഷോ",
    "ഷu": "ഷൗ",
    "സa": "സാ",
    "സe": "സേ",
    "സi": "സൈ",
    "സo": "സോ",
    "സu": "സൗ",
    "ഹa": "ഹാ",
    "ഹe": "ഹേ",
    "ഹi": "ഹൈ",
    "ഹo": "ഹോ",
    "ഹu": "ഹൗ",
    "ളa": "ളാ",
    "ളe": "ളേ",
    "ളi": "ളൈ",
    "ളo": "ളോ",
    "ളu": "ളൗ",
    "ഴa": "ഴാ",
    "ഴe": "ഴേ",
    "ഴi": "ഴൈ",
    "ഴo": "ഴോ",
    "ഴu": "ഴൗ",
    "റa": "റാ",
    "റe": "റേ",
    "റi": "റൈ",
    "റo": "റോ",
    "റu": "റൗ",
    "റ്റa": "റ്റാ",
    "റ്റe": "റ്റേ",
    "റ്റi": "റ്റൈ",
    "റ്റo": "റ്റോ",
    "റ്റu": "റ്റൗ",
    "ൺa": "ണ",
    "ൺe": "ണെ",
    "ൺi": "ണി",
    "ൺo": "ണൊ",
    "ൺu": "ണു",
    "ൺA": "ണാ",
    "ൺE": "ണേ",
    "ൺI": "ണീ",
    "ൺO": "ണോ",
    "ൺU": "ണൂ",
    "ൺY": "ണൈ",
    "ൺr": "ണ്ര്",
    "ൺy": "ണ്യ്",
    "ൺw": "ണ്വ്",
    "ൺ~": "ണ്‌",
    "ൻa": "ന",
    "ൻe": "നെ",
    "ൻi": "നി",
    "ൻo": "നൊ",
    "ൻu": "നു",
    "ൻA": "നാ",
    "ൻE": "നേ",
    "ൻI": "നീ",
    "ൻO": "നോ",
    "ൻU": "നൂ",
    "ൻY": "നൈ",
    "ൻr": "ന്ര്",
    "ൻy": "ന്യ്",
    "ൻw": "ന്വ്",
    "ൻ~": "ന്‌",
    "ംa": "മ",
    "ംe": "മെ",
    "ംi": "മി",
    "ംo": "മൊ",
    "ംu": "മു",
    "ംA": "മാ",
    "ംE": "മേ",
    "ംI": "മീ",
    "ംO": "മോ",
    "ംU": "മൂ",
    "ംY": "മൈ",
    "ംr": "മ്ര്",
    "ംy": "മ്യ്",
    "ംw": "മ്വ്",
    "ർa": "ര",
    "ർe": "രെ",
    "ർi": "രി",
    "ർo": "രൊ",
    "ർu": "രു",
    "ർA": "രാ",
    "ർE": "രേ",
    "ർI": "രീ",
    "ർO": "രോ",
    "ർU": "രൂ",
    "ർY": "രൈ",
    "ർy": "ര്യ്",
    "ർw": "ര്വ്",
    "ർ~": "ര്‌",
    "ൽa": "ല",
    "ൽe": "ലെ",
    "ൽi": "ലി",
    "ൽo": "ലൊ",
    "ൽu": "ലു",
    "ൽA": "ലാ",
    "ൽE": "ലേ",
    "ൽI": "ലീ",
    "ൽO": "ലോ",
    "ൽU": "ലൂ",
    "ൽY": "ലൈ",
    "ൽr": "ല്ര്",
    "ൽy": "ല്യ്",
    "ൽw": "ല്വ്",
    "ൽ~": "ല്‌",
    "ൾa": "ള",
    "ൾe": "ളെ",
    "ൾi": "ളി",
    "ൾo": "ളൊ",
    "ൾu": "ളു",
    "ൾA": "ളാ",
    "ൾE": "ളേ",
    "ൾI": "ളീ",
    "ൾO": "ളോ",
    "ൾU": "ളൂ",
    "ൾY": "ളൈ",
    "ൾr": "ള്ര്",
    "ൾy": "ള്യ്",
    "ൾw": "ള്വ്",
    "ൾ~": "ള്‌",
    "്‍a": "",
    "്‍e": "െ",
    "്‍i": "ി",
    "്‍o": "ൊ",
    "്‍u": "ു",
    "്‍A": "ാ",
    "്‍E": "േ",
    "്‍I": "ീ",
    "്‍O": "ോ",
    "്‍U": "ൂ",
    "്‍Y": "ൈ",
    "്‍r": "്ര്",
    "്‍y": "്യ്",
    "്‍w": "്വ്",
    "്‍~": "്‌",
    "|": "‌",
    'ംL': 'മ്ല്',
    'ത്a': 'ത',
    'ഥ്a': 'ഥ',
    'ധ്a': 'ധ',
    'ഭ്a': 'ഭ',
    'ഷ്a': 'ഷ',
    'ഴ്a': 'ഴ',
    'ന്ത്a': 'ന്ത',
    'ത്ത്a': 'ത്ത',
    'ക്ത്a': 'ക്ത',
    'ല്ല്a': 'ല്ല',
    'ന്ന്a': 'ന്ന',
    'ണ്ണ്a': 'ണ്ണ',
    'ള്ള്a': 'ള്ള',
    'ന്മ്a': 'ന്മ',
    'ണ്മ്a': 'ണ്മ',
    " ": " ",
    'ബ്a': 'ബ',
    'ക്‍a': 'ക',
    'ദ്a': 'ദ',
    'ഫ്a': 'ഫ',
    'ഗ്a': 'ഗ',
    'ഹ്a': 'ഹ',
    'ജ്a': 'ജ',
    'പ്a': 'പ',
    'ഖ്a': 'ഖ',
    'സ്a': 'സ',
    'റ്റ്a': 'റ്റ',
    'വ്a': 'വ',
    'ക്ഷ്a': 'ക്ഷ',
    'യ്a': 'യ',
    'ശ്a': 'ശ',
    'ബ്ബ്a': 'ബ്ബ',
    'ക്ക്‍a': 'ക്ക',
    'ഡ്a': 'ഡ',
    'ഗ്ഗ്a': 'ഗ്ഗ',
    'ജ്ജ്a': 'ജ്ജ',
    'ക്ക്a': 'ക്ക',
    'മ്മ്a': 'മ്മ',
    'പ്പ്a': 'പ്പ',
    'റ്a': 'റ',
    'ട്a': 'ട',
    'വ്വ്a': 'വ്വ',
    'യ്യ്a': 'യ്യ',
    'ശ്ശ്a': 'ശ്ശ',
    'ഘ്a': 'ഘ',
    'ങ്a': 'ങ',
    'ച്a': 'ച',
    'ഛ്a': 'ഛ',
    'ഝ്a': 'ഝ',
    'ഞ്a': 'ഞ',
    'ഠ്a': 'ഠ',
    'ഢ്a': 'ഢ',
    "്ല്a": "്ല",
    'ക്ര്a': 'ക്ര',
    'ഖ്ര്a': 'ഖ്ര',
    'ഗ്ര്a': 'ഗ്ര',
    'ഘ്ര്a': 'ഘ്ര',
    'ങ്ര്a': 'ങ്ര',
    'ച്ര്a': 'ച്ര',
    'ഛ്ര്a': 'ഛ്ര',
    'ജ്ര്a': 'ജ്ര',
    'ഝ്ര്a': 'ഝ്ര',
    'ഞ്ര്a': 'ഞ്ര',
    'ട്ര്a': 'ട്ര',
    'ഠ്ര്a': 'ഠ്ര',
    'ഡ്ര്a': 'ഡ്ര',
    'ഢ്ര്a': 'ഢ്ര',
    'ണ്ര്a': 'ണ്ര',
    'ത്ര്a': 'ത്ര',
    'ഥ്ര്a': 'ഥ്ര',
    'ദ്ര്a': 'ദ്ര',
    'ധ്ര്a': 'ധ്ര',
    'ന്ര്a': 'ന്ര',
    'പ്ര്a': 'പ്ര',
    'ഫ്ര്a': 'ഫ്ര',
    'ബ്ര്a': 'ബ്ര',
    'ഭ്ര്a': 'ഭ്ര',
    'മ്ര്a': 'മ്ര',
    'ല്ര്a': 'ല്ര',
    'വ്ര്a': 'വ്ര',
    'ശ്ര്a': 'ശ്ര',
    'ഷ്ര്a': 'ഷ്ര',
    'സ്ര്a': 'സ്ര',
    'ഹ്ര്a': 'ഹ്ര',
    'ള്ര്a': 'ള്ര',
    '=': '=',
    '+': '+',
    '{': '{',
    '}': '}',
    ';': ';',
    ':': ':',
    '"': '"',
    "'": "'",
    '<': '<',
    '/': '/',
    '_': '_',
    ']': ']',
    '[': '[',
    '\\': '\\',
    '^': '^',
    '`': '`'
}
function getPhoneticLetter(myField, letter){
    console.log('getPhoneticLetter')
    var startPos = myField.selectionStart;
    var preText = myField.value.substring(0, startPos) + letter

    var loopCount = 0  
    if(preText.length >=5){
        loopCount = 5
    }
    else if(preText.length > 0 && preText.length < 5){
        loopCount = preText.length
    }
    
    for (i = loopCount; i>0; i--){
        var phrase = preText.substring(preText.length-i, preText.length)
        if(newPhoneticDict[phrase]){
            insertPhoneticLetter(myField, newPhoneticDict[phrase], phrase.length-1 )
            return true
        }
    }
    
}
function insertPhoneticLetter(myField, myValue, steps ){
    console.log('insertPhoneticLetter')
    if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        var preText = myField.value.substring(0, startPos)
        if(steps!=0){
            preText = preText.slice(0, -steps)
        }else{
            preText = preText
        }
        var postText = myField.value.substring(endPos, myField.value.length)
        if(postText != '' && postText[0] != "‌" ){
            console.log('Need to add a solver here')
            postText = "‌" + myField.value.substring(endPos, myField.value.length)
            console.log('solver added solver is true now')
        }
        else if(postText != '' && postText[0] == "‌"){
            console.log('No need to add a solver')
        }else{}
        
        myField.value = preText + myValue+ postText
        var curPos = preText.length +myValue.length
        createSelection(myField, curPos, curPos);
        myField.setSelectionRange(curPos, curPos)

    }
}

/////Arabic Phonetic Keyboard Operations
function insertArabicLetter(myField, myValue, steps ){
    console.log('insertPhoneticLetter')
    if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        var preText = myField.value.substring(0, startPos)
        if(steps!=0){
            preText = preText.slice(0, -steps)
        }else{
            preText = preText
        }
        var postText = myField.value.substring(endPos, myField.value.length)

        postText = myField.value.substring(endPos, myField.value.length)
        myField.value = preText + myValue+ postText
        var curPos = preText.length +myValue.length
        createSelection(myField, curPos, curPos);
        myField.setSelectionRange(curPos, curPos)

    }
}

var arabicPhoneticDict = {
    "ت'":'ث',
    "ح'":'خ',
    "د'":'ذ',
    "س'":'ش',
    "ع'":'غ',
    "ه'":'ة',
    ' ':' ', 
    'ءa': 'أ',
    'اء-':'إ',
    'اa':'آ',
    'e':'ٱ',
    'A':"ٰ",
    'a':'ا','b':'ب','t':'ت','j':'ج', 'H':'ح', 'd':'د',
    'w':'و','z':'ز','s':'س','S':'ص','D':'ض', 'T':'ط','Z':'ظ','g':'ع','f':'ف',
    'q':'ق','k':'ك','l':'ل','m':'م','n':'ن','h':'ه','w':'و','y':'ي', 
    '-':'ء','u':'َ', 'i':'ِ', 'o':'ُ',
    'U':'ً', 'I':'ٍ', 'O':'ٌ', 'v':'ْ', 'p':'ّ', 'r' : 'ر',
    
     
     'Y':'ى',
    'يء-':'ئ' , 'وء-':'ؤ', 
    
    '?':'؟', ',':'،',
    
    '0':'٠','1':'١','2':'٢', '3':'٣', '4':'٤','5':'٥', '6':'٦',
    '7':'٧','8':'٨', '9':'٩','c':'٫' ,
    
    ';':'؛',
    "'":"'", '`':'`', "~":'~', '{':'{', '}':'}', '[':'[',']':']', ':':':', '"':'"',
    '<':'<', '>':'>', ".":".", '/':'/', '?':'؟', 'x':'-'
    //e,x, c
}
function getPhoneticArabicLetter(myField, letter){
    console.log('getPhoneticArabicLetter')
    console.log('letter is: ', letter)
    var startPos = myField.selectionStart;
    var preText = myField.value.substring(0, startPos) + letter

    var loopCount = 0 
    if(preText.length >=5){
        loopCount = 5
    }
    else if(preText.length > 0 && preText.length < 5){
        loopCount = preText.length
    }
    
    for (i = loopCount; i>0; i--){
        var phrase = preText.substring(preText.length-i, preText.length)
        if(arabicPhoneticDict[phrase]){
            insertArabicLetter(myField, arabicPhoneticDict[phrase], phrase.length-1 )
            return true
        }
        else{
            
        }
    }
    
}
var arabic101Dict = {
    'a':'ش', 
    'A':'ِ', 
    'b':'لا', 
    'B':'لآ',
    'c':'ؤ', 
    'C':'{',
    'd':'ي', 
    'D':']',
    'e':'ث',
    'E':'ُ',
    'f':'ب', 
    'F':'[',
    'g':'ل', 
    'G':'لأ',
    'h':'ا', 
    'H':'أ',
    'i':'ه', 
    'I':'/',
    'j':'ت', 
    'J':'-',
    'k':'ن', 
    'K':'٫',
    'l':'م', 
    'L':'/',
    'm':'ة', 
    'M':"'",
    'n':'ى', 
    'N':'آ',
    'o':'خ', 
    'O':'*',
    'p':'ح', 
    'P':'؛',
    'q':'ض', 
    'Q':'َ',
    'r':'ق', 
    'R':'ٌ',
    's':'س', 
    'S':'ٍ',
    't':'ف', 
    'T':'',
    'u':'ع', 
    'U':"'",
    'T':'لإ',
    'v':'ر', 
    'V':'}',
    'w':'ص', 
    'W':'ً',
    'x':'ء', 
    'X':'ْ',
    'y':'غ', 
    'Y':'إ',
    'z':'ئ', 
    'Z':"ٰ",
    '`':'ذ', 
    '~':'ّ',
    '[':'ج', 
    '{':'<',
    ']':'د', 
    '}':'>',
    ';':'ك', 
    ':':':',
    "'":'ط', 
    '"':'"',
    ',':'و', 
    '<':',',
    '.':'ز',
    '>':'.',
    '/':'ظ',
    '?':'؟',
    '0':'٠','1':'١','2':'٢', '3':'٣', '4':'٤','5':'٥', '6':'٦',
    '7':'٧','8':'٨', '9':'٩'
}

function get101ArabicLetter(myField, letter){
    console.log('get101ArabicLetter')
    var startPos = myField.selectionStart;
    var preText = myField.value.substring(0, startPos) + letter

    var loopCount = 0 
    if(preText.length >=5){
        loopCount = 5
    }
    else if(preText.length > 0 && preText.length < 5){
        loopCount = preText.length
    }
    
    for (i = loopCount; i>0; i--){
        var phrase = preText.substring(preText.length-i, preText.length)
        console.log("+++++++++++++++++")
        console.log(phrase)
        console.log(arabic101Dict[phrase])
        if(arabic101Dict[phrase]){
            insertArabicLetter(myField, arabic101Dict[phrase], phrase.length-1 )
            return true
        }
        else{
            
        }
    }
    

}
//All keyboard operations start from here
function timeToType(e){
    console.log('timeToType')
    console.log(e.keyCode)
    console.log(e)
    var hijackKeys = [43,34,39,60,47]
    var arabicKeys = [
 'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','1','2','3','4','5','6','7','8','9','0','?',',','-',"'",'`','~','{','[','}',']',':',';','"', '<','>','.','/','?'
    ]
    var myField = document.getElementById(e.target.id)
    if(e.keyCode != 13){ // Make sure it is not enter key
        if(activeLanguageButton === 'langMlBtn'){
//        var inp = String.fromCharCode(event.keyCode);
    
        if ((e.keyCode >= 48 && e.keyCode <= 61) ||  (event.keyCode >= 65 && event.keyCode <= 96) || (e.keyCode >= 97 && e.keyCode <= 126) || hijackKeys.includes(e.keyCode)){
            
            var preChar = getPreChar(textarea)
            if(preChar == " " && e.keyCode == 124){
                console.log("Hmmm..There is a space")
                insertAtCursor(textarea, '|')
            }
            
            if(userSelectedMlKeyBoard == 'Phonetic'){
                //phonetic section code
                e.preventDefault()
                console.log('phonetic time')
                var newLetter = e.key
                getPhoneticLetter(myField, newLetter)
                
            }else if(userSelectedMlKeyBoard == 'Inscript'){
                console.log('current keyboard is inscript')
                e.preventDefault()
                toinscript(e, myField)
            }else if(userSelectedMlKeyBoard == 'ASCII'){
                e.preventDefault()
                tofml(e, myField)
            }
        }
        else { 
                
        }
    
    }
    else if(activeLanguageButton === 'langEnBtn'){
//        console.log('English is active')
    }
    else if(activeLanguageButton === 'langArBtn'){
        console.log(userSelectedArKeyBoard)
        if(arabicKeys.includes(e.key)){ 
            if(userSelectedArKeyBoard == 'Phonetic'){
                e.preventDefault()
                var newLetter = e.key
                getPhoneticArabicLetter(myField, newLetter)
                }
            else if(userSelectedArKeyBoard == '101'){
                e.preventDefault()
                var newLetter = e.key
                console.log(newLetter)
                get101ArabicLetter(myField, newLetter)
                }
        }//if it inluce in the arabic keys
        else{
            
        }//if they are not present in arabicKeys
        
        }
        if(e.keyCode == 32){
            console.log("space pressed!")
            saveThisToLastSession()
//            focusOnTracker(e)
            }//
           //if it is arabic time
        }
    else{//enter key pressed scroll into view
        console.log("enter pressed!")
//        focusOnTracker()
    }
    focusOnTracker(e)
    myField.focus()
}
function focusOnTracker(e){
    console.log('focus on tracer')
    var startPos = textarea.selectionStart;
    var endPos = textarea.selectionEnd;
    var preText = textarea.value.substring(0, startPos)
    var postText = textarea.value.substring(endPos, textarea.value.length)
    
    backdrop.innerHTML = preText + '<span id="trackElement">A</span>'+ postText
    var element = document.getElementById('trackElement')
    scrollToFocus(element)
    backdrop.innerHTML = ''
}

function backspaceController(myField){
    console.log('backspace controller')
    
    if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
//        console.log('start pos is ', startPos)
        var endPos = myField.selectionEnd;
        var preText = myField.value.substring(0, startPos)
        var postText = myField.value.substring(endPos, myField.value.length)
        if(postText != '' && postText[0] != "‌" ){
            console.log('Need to add a solver here')
            postText = "‌" + myField.value.substring(endPos, myField.value.length)
            console.log('solver added solver is true now')
        }
        else if(postText != '' && postText[0] == "‌"){
            console.log('No need to add a solver')
        }else{}
        //adding to the textarea
        var newPreText = preText.substring(0,preText.length - 1 )
        myField.value =  newPreText + postText
        //setting cursor
        console.log()
        var curPos = newPreText.length
//        console.log("curosr pos is", curPos)
        createSelection(myField, curPos, curPos);
        myField.setSelectionRange(curPos, curPos)

    }
    updateDetails()
}
function backspaceControllerArabic(myField){
    console.log('backspace controller')
    
    if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
//        console.log('start pos is ', startPos)
        var endPos = myField.selectionEnd;
        var preText = myField.value.substring(0, startPos)
        var postText = myField.value.substring(endPos, myField.value.length)
        postText = myField.value.substring(endPos, myField.value.length)
        //adding to the textarea
        var newPreText = preText.substring(0,preText.length - 1 )
        myField.value =  newPreText + postText
        //setting cursor
        console.log()
        var curPos = newPreText.length
//        console.log("curosr pos is", curPos)
        createSelection(myField, curPos, curPos);
        myField.setSelectionRange(curPos, curPos)

    }
    updateDetails()
}
function increaseFontSize(){
    var curFontSize = window.getComputedStyle(textarea).fontSize
    var curFontSize = parseInt(curFontSize.replace('px', ''))
    console.log(curFontSize)
    if(curFontSize > 100){
        fakeTextArea.style.fontSize = 100 +'px'
        localStorage.setItem("fontSize", "100px");
        
    }else{
        fakeTextArea.style.fontSize = curFontSize + 2 +'px'
        localStorage.setItem("fontSize", window.getComputedStyle(textarea).fontSize);
        
    }
    textarea.focus()
    fontSizeIndicator.innerHTML = fakeTextArea.style.fontSize
}
function decreaseFontSize(){
    var curFontSize = window.getComputedStyle(textarea).fontSize
    var curFontSize = parseInt(curFontSize.replace('px', ''))
    console.log(curFontSize)
    if(curFontSize < 11 ){
        fakeTextArea.style.fontSize = 11 +'px'
        localStorage.setItem("fontSize", "11px");
        
    }else{
        fakeTextArea.style.fontSize = curFontSize - 2 +'px'
        localStorage.setItem("fontSize", window.getComputedStyle(textarea).fontSize);
    }
    textarea.focus()
    fontSizeIndicator.innerHTML = fakeTextArea.style.fontSize
    
}
function shortCutsController(e){
        console.log('shorcuts checking')        
        var myField = document.getElementById(e.target.id)
        console.log(e.keyCode)
        console.log(process.platform);
        if(process.platform == 'darwin'){//Add mac shortcuts here!
            
            if(e.keyCode === 18 && userSelectedMlKeyBoard =='ASCII'){
                console.log('combination found')
                combination = true;
                var typing=Typing("Make sure your NumLock key is ON when you use combinations.", 5)
                typing();
            }
            else if(e.altKey && e.keyCode == 83){
                console.log('special code for SAW');
                e.preventDefault()
                insertAtCursor(myField, 'ﷺ');
            }
            else if(e.altKey && e.keyCode == 82){
                console.log('special code for Rupees sign');
                e.preventDefault()
                insertAtCursor(myField, '₹');
            }
            else if(e.altKey && e.keyCode == 89){
                console.log('special code for Euro sign');
                e.preventDefault()
                insertAtCursor(myField, '€');
            }
            else if(e.altKey && e.keyCode == 71){
                console.log('special code for Copyright sign');
                e.preventDefault()
                insertAtCursor(myField, '©');
            }
            else if(e.altKey && e.keyCode == 84){
                console.log('special code for Trademark sign');
                e.preventDefault()
                insertAtCursor(myField, '™');
            }
            else if(e.altKey && e.keyCode == 68){
                console.log('special code for Registered sign');
                e.preventDefault()
                insertAtCursor(myField, '®');
            }
            else if(e.keyCode === 83 && e.metaKey){
                e.preventDefault()
             console.log("Save File!!!!");
             if(fileOpened === true){
                 updateFile();
                 
             }
             else{
                 saveChange(textarea.value);
             }
            }
            else if((e.keyCode === 107 && e.metaKey) || (e.keyCode === 187 && e.metaKey)){
                console.log('Increase font size')
                e.preventDefault()
                increaseFontSize()
                
            }
            else if((e.keyCode === 109 && e.metaKey) || (e.keyCode === 189 && e.metaKey)){
                console.log('Decrease font size')
                e.preventDefault()
                decreaseFontSize()
                
            }
            else if(e.keyCode === 77 && e.metaKey){
                console.log('copy ToMLKV shortcut')
                e.preventDefault()
                copyToMLKV();
            }
            else if(e.keyCode === 65 && e.metaKey){
                console.log('SelectAll please')
                e.preventDefault()
                textarea.select()
            }
            else if(e.keyCode === 88 && e.metaKey){
                console.log('Cut please')
                e.preventDefault()
                cut_to_clipboard(textarea)
            }
            else if(e.keyCode === 67 && e.metaKey){
                console.log('Copy please')
                e.preventDefault()
                copy_to_clipboard()
            }
            else if(e.keyCode === 86 && e.metaKey){
                console.log('Paste please in textarea')
                e.preventDefault()
                systemPasteListener(textarea)
            }
            else if(e.keyCode === 70 && e.metaKey){
                console.log('copy TO fml shortcut')
                e.preventDefault()
                copyToFML();
            }
            
            else if(e.keyCode == 49 && e.metaKey){
                makeActiveLanguage('langEnBtn')
            }
            else if(e.keyCode === 50 && e.metaKey){
                makeActiveLanguage('langMlBtn')
            }
            else if(e.keyCode === 51 && e.metaKey){
                makeActiveLanguage('langArBtn')
            }
            else if(e.keyCode === 90 && e.metaKey){
             undoAction()
             e.preventDefault()
            }
            else if(e.keyCode === 89 && e.metaKey){
             redoAction()
             e.preventDefault()
            }
            else if(e.keyCode === 78 && e.metaKey){
             clear()
             e.preventDefault()
            }
            else if(e.keyCode === 79 && e.metaKey){
             openFile()
             e.preventDefault()
            }
            else if(e.keyCode == 8){
                e.preventDefault()
                if(activeLanguageButton == 'langArBtn'){
                  backspaceControllerArabic(myField) 
                }else{
                  backspaceController(myField)  
                }
            }
            else{
                console.log('what happens here!', e.keyCode)
                
                if(combination == true){
                    tofml(e, myField)
                    }
            
             
            }
        
        }
    
        else{ //Short cuts for windows and linux
             if(e.altKey && userSelectedMlKeyBoard =='ASCII'){
                console.log('combination found')
                combination = true;
                var typing=Typing("Make sure your NumLock key is ON when you use combinations.", 5)
                typing();
            }
            else if(e.altKey && e.keyCode == 83){
                console.log('special code for SAW');
                insertAtCursor(myField, 'ﷺ');
                
            }
            else if(e.altKey && e.keyCode == 82){
                console.log('special code for Rupees sign');
                insertAtCursor(myField, '₹');
            }
            else if(e.altKey && e.keyCode == 79){
                console.log('special code for Euro sign');
                insertAtCursor(myField, '€');
            }
            else if(e.altKey && e.keyCode == 71){
                console.log('special code for Copyright sign');
                insertAtCursor(myField, '©');
            }
            else if(e.altKey && e.keyCode == 84){
                console.log('special code for Trademark sign');
                insertAtCursor(myField, '™');
            }
            else if(e.altKey && e.keyCode == 68){
                console.log('special code for Registered sign');
                insertAtCursor(myField, '®');
            }
            else if(e.keyCode === 83 && e.ctrlKey){
             console.log("Save File!!!!");
             if(fileOpened === true){
                 updateFile();
                 
             }
             else{
                 saveChange(textarea.value);
             }
            }
            else if((e.keyCode === 107 && e.ctrlKey) || (e.keyCode === 187 && e.ctrlKey)){
                console.log('Increase font size')
                e.preventDefault()
                increaseFontSize()
                
            }
            else if((e.keyCode === 109 && e.ctrlKey) || (e.keyCode === 189 && e.ctrlKey)){
                console.log('Decrease font size')
                e.preventDefault()
                decreaseFontSize()
                
            }
            else if(e.keyCode === 77 && e.ctrlKey){
                console.log('coopy ToMLKV shortcut')
                e.preventDefault()
                copyToMLKV();
            }
            else if(e.keyCode === 65 && e.ctrlKey){
                console.log('SelectAll please')
                e.preventDefault()
                textarea.select()
            }
            else if(e.keyCode === 70 && e.ctrlKey){
                console.log('coopy TO fml shortcut')
                e.preventDefault()
                copyToFML();
            }
            
            else if(e.keyCode === 112){
                makeActiveLanguage('langEnBtn')
            }
            else if(e.keyCode === 113){
                makeActiveLanguage('langMlBtn')
            }
            else if(e.keyCode === 114){
                makeActiveLanguage('langArBtn')
            }
            else if(e.keyCode === 90 && e.ctrlKey){
             undoAction()
             e.preventDefault()
            }
            else if(e.keyCode === 89 && e.ctrlKey){
             redoAction()
             e.preventDefault()
            }
            else if(e.keyCode === 78 && e.ctrlKey){
             clear()
             e.preventDefault()
            }
            else if(e.keyCode === 79 && e.ctrlKey){
             openFile()
             e.preventDefault()
            }
            else if(e.keyCode == 8){
                e.preventDefault()
                if(activeLanguageButton == 'langArBtn'){
                  backspaceControllerArabic(myField) 
                }else{
                  backspaceController(myField)  
                }
            }
            else{
                console.log('what happens here!', e.keyCode)
                
                if(combination == true){
                    tofml(e, myField)
                    }
            
             
            }  
        }
        
        
}
function TypingFieldShortCutController(e){
    console.log('TypingFieldShortCutController')      
        var myField = document.getElementById(e.target.id)
        
        console.log(process.platform);
        if(process.platform == 'darwin'){//Add mac shortcuts here!
            if(e.altKey && userSelectedMlKeyBoard =='ASCII'){
                console.log('combination found')
                combination = true;
                var typing=Typing("Make sure your NumLock key is ON when you use combinations.", 5)
                typing();
            }
            else if(e.altKey && e.keyCode == 83){
                e.preventDefault()
                console.log('special code for SAW');
                
                insertAtCursor(myField, 'ﷺ');
            }
            else if(e.altKey && e.keyCode == 82){
                e.preventDefault()
                console.log('special code for Rupees sign');
                
                insertAtCursor(myField, '₹');
            }
            else if(e.altKey && e.keyCode == 89){
                e.preventDefault()
                console.log('special code for Euro sign');
                insertAtCursor(myField, '€');
            }
            else if(e.altKey && e.keyCode == 71){
                e.preventDefault()
                console.log('special code for Copyright sign');
                insertAtCursor(myField, '©');
            }
            else if(e.altKey && e.keyCode == 84){
                e.preventDefault()
                console.log('special code for Trademark sign');
                insertAtCursor(myField, '™');
            }
            else if(e.altKey && e.keyCode == 68){
                e.preventDefault()
                console.log('special code for Registered sign');
                insertAtCursor(myField, '®');
            }
            else if(e.keyCode === 65 && e.metaKey){
                console.log('SelectAll please')
                e.preventDefault()
                myField.select()
            }
            else if(e.keyCode === 88 && e.metaKey){
                console.log('Cut please in myfield')
                e.preventDefault()
                cut_to_clipboard(myField)
            }
            else if(e.keyCode === 67 && e.metaKey){
                console.log('Copy please in myField')
                e.preventDefault()
                copy_to_clipboard_field(myField)
            }
            else if(e.keyCode === 86 && e.metaKey){
                console.log('Paste please in myfield')
                e.preventDefault()
                systemPasteListener(myField)
            }
            else if(e.keyCode === 83 && e.metaKey){
             console.log("Save File!!!!");
                e.preventDefault()
             if(fileOpened === true){
                 updateFile();
             }
             else{
                 saveChange(textarea.value);
             }
            }
            else if(e.keyCode === 49 && e.metaKey){
                makeActiveLanguage('langEnBtn')
            }
            else if(e.keyCode === 50 && e.metaKey){
                makeActiveLanguage('langMlBtn')
            }
            else if(e.keyCode === 51 && e.metaKey){
                makeActiveLanguage('langArBtn')
            }

            else if(e.keyCode === 79 && e.ctrlKey){
             openFile()
             e.preventDefault()
            }
            else if(e.keyCode == 8){
             e.preventDefault()
            if(activeLanguageButton == 'langArBtn'){
              backspaceControllerArabic(myField) 
            }else{
              backspaceController(myField)  
            }
             
            }
            else{
                console.log('what happens here!', e.keyCode)

                if(combination == true && userSelectedMlKeyBoard == 'ASCII'){
                    tofml(e, myField)
                    }
            }
        
        }
    
        else{ //Short cuts for windows and linux
             if(e.altKey && userSelectedMlKeyBoard =='ASCII'){
                console.log('combination found')
                combination = true;
                var typing=Typing("Make sure your NumLock key is ON when you use combinations.", 5)
                typing();
            }
            else if(e.altKey && e.keyCode == 83){
                console.log('special code for SAW');
                insertAtCursor(myField, 'ﷺ');
            }
            else if(e.altKey && e.keyCode == 82){
                console.log('special code for Rupees sign');
                insertAtCursor(myField, '₹');
            }
            else if(e.altKey && e.keyCode == 85){
                console.log('special code for Euro sign');
                insertAtCursor(myField, '€');
            }
            else if(e.altKey && e.keyCode == 71){
                console.log('special code for Copyright sign');
                insertAtCursor(myField, '©');
            }
            else if(e.altKey && e.keyCode == 84){
                console.log('special code for Trademark sign');
                insertAtCursor(myField, '™');
            }
            else if(e.altKey && e.keyCode == 68){
                console.log('special code for Registered sign');
                insertAtCursor(myField, '®');
            }
            else if(e.keyCode === 83 && e.ctrlKey){
             console.log("Save File!!!!");
             if(fileOpened === true){
                 updateFile();
             }
             else{
                 saveChange(textarea.value);
             }
            }
            else if(e.keyCode === 112){
                makeActiveLanguage('langEnBtn')
            }
            else if(e.keyCode === 113){
                makeActiveLanguage('langMlBtn')
            }
            else if(e.keyCode === 114){
                makeActiveLanguage('langArBtn')
            }

            else if(e.keyCode === 79 && e.ctrlKey){
             openFile()
             e.preventDefault()
            }
            else if(e.keyCode == 8){
             e.preventDefault()
            if(activeLanguageButton == 'langArBtn'){
              backspaceControllerArabic(myField) 
            }else{
              backspaceController(myField)  
            }
             
            }
            else{
                console.log('what happens here!', e.keyCode)

                if(combination == true && userSelectedMlKeyBoard == 'ASCII'){
                    tofml(e, myField)
                    }
            }  
        }
}



