var keyIds = [
    {'~':'`'},  {'!':'1'},  {'@':'2'},  {'#':'3'}, {'$':'4'},  
              {'%':'5'},{'^':'6'}, {'&':'7'}, {'*':'8'}, {'(':'9'}, {')':'0'}, {'_':'-'},{'+':'='}, {'':'Backspace'},
             
              {'':'Tab'},{'Q':''},{'W':''},{'E':''},{'R':''},{'T':''},{'Y':''},
              {'U':''},{'I':''},{'O':''},{'P':''},{'{':'['},{'}':']'},{'|':'\\'},
              
              {'':'CapsLk'},{'A':''},{'S':''},{'D':''},{'F':''},{'G':''},
              {'H':''},{'J':''},{'K':''},{'L':''},{':':';'},{'"':"'"},{'':'Enter'},
              
              {'':'Shift'}, {'Z':''}, {'X':''}, {'C':''}, {'V':''}, {'B':''},
              {'N':''}, {'M':''},{'<':','}, {'>':'.'}, {'?':'/'},{'':'Shift'},
              
              {'':'Ctrl'}, {'':''},{'':'Alt'},{'':'Space'},{'':'Alt'},
              {'':''},{'':''},{'':'Ctrl'}
              
             ]
var keyInsHash = [ 
    {'D':'അ'},{'E':'ആ'},{'F':'ഇ'},{'R':'ഈ'},{'G':'ഉ'},{'T':'ഊ'},{'+':'ഋ'}, {'Z':'എ'},{'S':'ഏ'},{'W':'ഐ'}, {'~':'ഒ'},{'A':'ഓ'},{'Q':'ഔ'},{'Dx':'അം'},{'D_':'അഃ'},
    
    {'k':'ക'},{'K':'ഖ'},{'i':'ഗ'},{'I':'ഘ'},{'U':'ങ'},
    {';':'ച'},{':':'ഛ'},{'p':'ജ'},{'P':'ഝ'},{'}':'ഞ'},
    {"'":'ട'},{'"':'ഠ'},{'[':'ഡ'},{'{':'ഢ'}, {'C':'ണ'},
    {'l':'ത'},{'L':'ഥ'},{'o':'ദ'},{'O':'ധ'},{'v':'ന'},
    {'h':'പ'},{'H':'ഫ'},{'y':'ബ'},{'Y':'ഭ'},{'c':'മ'},
    
    {'/':'യ'},{'j':'ര'},{'J':'റ'},{'n':'ല'},{'N':'ള'},{'b':'വ'},{'B':'ഴ'},
    {'M':'ശ'},{'<':'ഷ'},{'m':'സ'},{'u':'ഹ'},
    
    {'d':'്'},{'e':'ാ'},{'f':'ി'},{'r':'ീ'},{'g':'ു'},{'t':'ൂ'},{'=':'ൃ'}, {'z':'െ'},{'s':'േ'},{'w': 'ൈ'}, {'`':'ൊ'},{'a':'ോ'},{'q':'ൗ'},{'x':'ം'},
    {'_':'ഃ'},
    
    {'Cd]':'ണ്‍'}, {'vd]':'ന്‍'}, {'jd]':'ര്‍'}, {'nd]':'ല്‍'}, {'Nd]':'ള്‍'},
    
    {'kdk':'ക്ക'}, {'ldl':'ത്ത' }, {';d;': 'ച്ച'}, {'pdp':'ജ്ജ'}, 
    {'}d}': 'ഞ്ഞ'}, {"'d'":'ട്ട'}, {'CdC':'ണ്ണ'},{'ldL':'ത്ഥ'},
    {'odO':'ദ്ധ'}, {'vdv':'ന്ന'},{'hdh':'പ്പ'}, {"kd<": 'ക്ഷ' }, {'udv': 'ഹ്ന' },
    { 'JdJ': 'റ്റ'},{ '}d;': 'ഞ്ച'},{ 'cdh': 'മ്പ'  },{ 'Udk': 'ങ്ക'  },
    { 'Md;': 'ശ്ച'  },{ 'UdU':'ങ്ങ'  },{ "Cd'" : 'ണ്ട'  },{ 'vdJ' :'ന്റ'  },
    { 'vdl' :'ന്ത'  },{ 'mdL':'സ്ഥ'  },{ 'vdo' :'ന്ദ'  },{ 'mdJdJ' : 'സ്റ്റ'  },
    { 'vdO':'ന്ധ'  },{ 'kdl':'ക്ത'  },{ 'ldm': 'ത്സ'  },{ 'vdc':'ന്മ'  },
    { 'ldc':'ത്മ'  },{ 'pd}':'ജ്ഞ'  },{ ';d:':'ച്ഛ'  },{ 'vdL':'ന്ഥ'  },
    { 'ldY':'ത്ഭ'  },{ 'Cdc':'ണ്മ'  },{ '[d{':'ഡ്ഢ'  }
    ]

var keyASCHash = [
    {'':'ഭ'},{},{},{},{},{},{'ഫ':''},{},{},{},{},{},{'ബ':''},
                  {},{},{'ത്സ':'ൂ'},{'ണ':'ം'},{'ഋ':'ല'},{'ഞ':'ൃ'},{'ഠ':'േ'},{'ഥ':'്യ'},
                  
                  {'ഡ':'ൗ'},{'ക':'ശ'},{'ഛ':'ീ'},{'ജ':'ു'},{'്ര':'ധ'},{'':'പ'},{'':'ന'},
                  
                  {},{'അ':'മ'},{'ട':'െ'},{'ഉ':'റ'},{'എ':'ള'},{'ഏ':'ഴ'},{'ഒ':'വ'},{'ഖ':'ഷ'},{'ഗ':'സ'},{'ഘ':'ഹ'},{},{},{},
                  
                  {},{'ദ':'്വ'},{'ത':'ഃ'},{'ഇ':'ര'},{'ഢ':'്'},{'ആ':'യ'}, {'ച':'ി'},{'ങ':'ാ'}
                 ]
var altCombHash = [
    {'A':'അ'},{'B':'ആ'},{'C':'ഇ'},{'Cu':'ഈ'},{'D':'ഉ'},{'Du':'ഊ'},{'E':'ഋ'}, {'F':'എ'},{'G':'ഏ'},{'Fs':'ഐ'}, {'H':'ഒ'},{'Hm':'ഓ'},{'Hu':'ഔ'},{'Aw':'അം'},{'Ax':'അഃ'},
    
    {'I':'ക'},{'J':'ഖ'},{'K':'ഗ'},{'L':'ഘ'},{'M':'ങ'},
    {'N':'ച'},{'O':'ഛ'},{'P':'ജ'},{'Q':'ഝ'},{'R':'ഞ'},
    {"S":'ട'},{'T':'ഠ'},{'U':'ഡ'},{'V':'ഢ'}, {'W':'ണ'},
    {'X':'ത'},{'Y':'ഥ'},{'Z':'ദ'},{'[':'ധ'},{'\\':'ന'},
    {']':'പ'},{'^':'ഫ'},{'_':'ബ'},{'`':'ഭ'},{'a':'മ'},
    
    {'b':'യ'},{'c':'ര'},{'d':'റ'},{'e':'ല'},{'f':'ള'},{'g':'ഴ'},{'h':'വ'},
    {'i':'ശ'},{'j':'ഷ'},{'k':'സ'},{'l':'ഹ'},
    
    {'v':'്'},{'m':'ാ'},{'n':'ി'},{'o':'ീ'},{'p':'ു'},{'q':'ൂ'},{'r':'ൃ'}, {'s':'െ'},{'t':'േ'},{'ss': 'ൈ'}, {'sm':'ൊ'},{'tm':'ോ'},{'u':'ൗ'},{'w':'ം'},    {'x':'ഃ'},
    
    {'0172': 'ണ്‍'},{'0179' : 'ന്‍'},{'0192':'ര്‍'},{'0194':'ല്‍'},{'0196':'ള്‍'},
    
    {'0161': 'ക്ക'}, {'0162' :'ക്ല'},{'0163': 'ക്ഷ'}, {'0164':'ഗ്ഗ'},
    {'0165': 'ഗ്ല'}, {'0166': 'ങ്ക'}, {'0167': 'ങ്ങ'}, {'0168' : 'ച്ച'}, {'0169' : 'ഞ്ച'},
    {'0170':'ഞ്ഞ'},{ '0171': 'ട്ട'} ,  {'0173': 'ണ്ട'}, {'0174': 'ണ്ണ'},
    {'0175': 'ത്ത'}, {'0176': 'ത്ഥ'}, {'0177': 'ദ്ദ'}, {'0178' : 'ദ്ധ'}, 
    {'0180': 'ന്ത'}, {'0181' : 'ന്ദ'}, {'0182' : 'ന്ന'}, {'0183' :'ന്മ'}, {'0184' : 'പ്പ'},
    {'0185':'പ്ല'}, {'0186':'ബ്ബ'},{ '0187' : 'ബ്ല'}, {'0188': 'മ്പ'}, {'0189': 'മ്മ'},
    {'0190':'മ്ല'},{'0191':'യ്യ'},{'0193':'റ്റ'},{'0195':'ല്ല'},
    {'0197':'ള്ള'},{'0198':'വ്വ'},{'0199':'ശ്ല'},{'0200':'ശ്ശ'},{'0201':'സ്ല'},{'0202':'സ്സ'},{'0203':'ഹ്ല'},
    {'0204':'സ്റ്റ'},{'0205':'ഡ്ഡ'},{'0206': 'ക്ട'},{'0207': 'ബ്ധ'},{'0208':'ബ്ദ'},{'0209':'ച്ഛ'},{'0210': 'ഹ്മ'},
    {'0211': 'ഹ്ന'},{'0212':'ന്ധ'},{'0213': 'ത്സ'},{'0214': 'ജ്ജ'},{'0215': 'ണ്മ'},{'0216':'സ്ഥ'},
    {'0217': 'ന്ഥ'},{'0218': 'ജ്ഞ'},{'0219': 'ത്ഭ'},{'0220': 'ഗ്മ'},    {'0221':'ശ്ച'},{'0222' :'ണ്ഡ'}, {'0223': 'ത്മ'},{'0224': 'ക്ത'},{'0225' :'ഗ്ന'},{'0226': 'ന്റ'},{'0227' :'ഷ്ട'},{'0228':'റ്റ'},
    {'0239': 'ണ്ട'},{'0240':'ല്‍'},{'0241' :'ല്ല'},{'0242': 'ന്മ'},{'0243': 'ന്ന'},{'0244': 'ഞ്ച'}
]
var keyPhoHash = [
    {'a':'അ'}, {'aa':'ആ'}, {'i':'ഇ'}, {'ii':'ഈ'}, {'u':'ഉ'}, {'uu':'ഊ'},
    {'rr':'ഋ'}, {'e':'എ'}, {'E':'ഏ'}, {'ai':'ഐ'}, {'o':'ഒ'},{'O':'ഓ'}, {'au':'ഔ'},
    {'am':'അം'}, {'aH':'അഃ'},
    
    {'ka':'ക'}, {'kha':'ഖ'}, {'ga':'ഗ'}, {'gha':'ഘ'}, {'nga':'ങ'}, {'cha':'ച'}, {'chha':'ഛ'}, {'ja':'ജ'}, {'jha':'ഝ'}, {'nja':'ഞ'},
    {'Ta':'ട'}, {'Tha':'ഠ'}, {'Da':'ഡ'}, {'Dha':'ഢ'}, {'Na':'ണ'},
    {'tha':'ത'}, {'thha':'ഥ'}, {'da':'ദ'}, {'dha':'ധ'}, {'na':'ന'},
    {'pa':'പ'}, {'fa':'ഫ'}, {'ba':'ബ'}, {'bha':'ഭ'}, {'ma':'മ'},
    
    {'ya':'യ'}, {'ra':'ര'}, {'la':'ല'}, {'va':'വ'}, {'za':'ശ'}, {'sha':'ഷ'},
    {'sa':'സ'}, {'ha':'ഹ'}, {'La':'ള'}, {'zha':'ഴ'}, {'Ra':'റ'},
    
    {'~':'്'},{'aa': 'ാ'}, {'i':'ി'},{'ii':'ീ'},{'u':'ു'},{'uu':'ൂ'},{'rr':'ൃ'},{'e':'െ'},
    {'E':'േ'}, {'ai':'െെ'},{'o':'ൊ'},{'O':'ോ'},{'au':'ൗ'},{'m':'ം'},{'H':'ഃ'},
    
    {'N':'ണ്‍'}, {'n':'ന്‍'}, {'r':'ര്‍'}, {'l':'ല്‍'}, {'L':'ള്‍'},
    
    {'kka':'ക്ക'}, {'ththa':'ത്ത' }, {'chcha': 'ച്ച'}, {'jja':'ജ്ജ'}, 
    {'njnja': 'ഞ്ഞ'}, {'TTa':'ട്ട'}, {'NNa':'ണ്ണ'},{'ththha':'ത്ഥ'},
    {'ddha':'ദ്ധ'}, {'nna':'ന്ന'},{'ppa':'പ്പ'}, {"ksha": 'ക്ഷ' }, {'hna': 'ഹ്ന' },
    { 'ta': 'റ്റ'},{ 'njcha': 'ഞ്ച'},{ 'mpa': 'മ്പ'  },{ 'nka': 'ങ്ക'  },
    { 'zcha': 'ശ്ച'  },{ 'ngnga':'ങ്ങ'  },{ 'NTa' : 'ണ്ട'  },{ 'nta' :'ന്റ'  },
    { 'ntha' :'ന്ത'  },{ 'sthha':'സ്ഥ'  },{ 'nda' :'ന്ദ'  },{ 'sta' : 'സ്റ്റ'  },
    { 'ndha':'ന്ധ'  },{ 'ktha':'ക്ത'  },{ 'thsa': 'ത്സ'  },{ 'nma':'ന്മ'  },
    { 'thma':'ത്മ'  },{ 'jnja':'ജ്ഞ'  },{ 'chchha':'ച്ഛ'  },{ 'nthha':'ന്ഥ'  },
    { 'thbha':'ത്ഭ'  },{ 'Nma':'ണ്മ'  },{ 'DDha':'ഡ്ഢ'  }
]
var keyArPhoHash = [
    {'a':'ا'}
    , {'b':'ب'}
    , {'t':'ت'}
    , {"t'":'ث'}
    , {'j':'ج'}
    , {'H':'ح'}
    , {"H'":'خ'}
    , {'d':'د'}
    , {"d'":'ذ'}
    , {"r":'ر'}
    , {'z':'ز'}
    , {'s':'س'}
    , {"s'":'ش'}
    , {'S':'ص'}
    , {'D':'ض'}
    , {'T': 'ط'}
    , {'Z': 'ظ'}
    , {'g':'ع'}
    , {"g'":'غ'}
    , { 'f':'ف'}
    , { 'q':'ق'}
    , { 'k':'ك'}
    , {'l': 'ل'}
    , {'m':'م'}
    , {'n':'ن'}
    , {'h':'ه'}
    , {'w':'و'}
    , {'y':'ي'}
    , {'-':'ء'}
    , {'Y': 'ى'}
    , {'y--':'ئ'}
    , {'w--':'ؤ'}
    , {"h'": 'ة'}
    , { 'a--': 'إ'}
    , {'-a': 'أ'}
    , {'e':'ٱ'}
    , { 'aa': 'آ'},
    {'A':"ٰ",},
    { 'u':'َ'}, 
    { 'U':'ً'}, 
    {'o':'ُ'}, 
    {'O':'ٌ'}, 
    {'p':'ّ'}, 
    {'v':'ْ'}, 
    {'i': 'ِ'}, 
    {'I': 'ٍ'},
    {';':'؛'},
    {'c':'٫'},
    {'x':'-'}
    
]
var keyAr101Hash = [
    {'H':'أ'}
    , {'f': 'ب'}
    , {'j': 'ت'}
    , {'e': 'ث'}
    , {'[': 'ج'}
    , {'p': 'ح'}
    , {'o': 'خ'}
    , {']': 'د'}
    , {'`': 'ذ'}
    , {'v': 'ر'}
    , {'.': 'ز'}
    , {'s': 'س'}
    , {'a': 'ش'}
    , {'w': 'ص'}
    , {'q': 'ض'}
    , {"'": 'ط'}
    , {'/': 'ظ'}
    , {'u': 'ع'}
    , {'y': 'غ'}
    , {'t': 'ف'}
    , {'r': 'ق'}
    , {';': 'ك'}
    , {'g': 'ل'}
    , {'l': 'م'}
    , {'k': 'ن'}
    , {'i': 'ه'}
    , {',': 'و'}
    , {'d': 'ي'}    
    , {'n': 'ى'}
    , {'z': 'ئ'}
    , {'c': 'ؤ'}
    , {'m': 'ة'}
    , {'h': 'ا'}
    , {'x': 'ء'}
    , {'Y': 'إ'}
    , {'H': 'أ'}
    , {'N': 'آ'},  
    {'Z':"ٰ",},
    {'G':'لأ'},
    {'T':'لإ'},
    {'B':'لآ'},
    {'Q':'َ'},
    {'W':'ً'},
    {'E':'ُ'},
    {'R':'ٌ'},
    {'~':'ّ'},
    {'X':'ْ'},
    {'A':'ِ'},
    {'S':'ٍ'}, 
    {'U':"'"},
    {'P':'؛'},
    {"M":"'"},
    {"<": ","},
    {">":"."},
    {"?":"؟"},
    {'J':'-'},
    {'K':"،"},
    {'{':'<'},
    {'}':'>'},
    {'D':']'},
    {'F':'['},
    {'L':'/'},
    {'V':'{'},
    {'C':'}'}
        
]
var keyArNothing = []
var InsKeyBoardBox = document.getElementById('InsKeyBoardBox')
var keyBoardON  = false
///Subfunction
function getString(keyLT,keyLB, keyRT ,keyRB, extraClass){
    return '<div class="grid-container '+ extraClass+'">  <div class="grid-item">'+ keyLT+'</div>             <div class="grid-item malLetter">'+ keyRT+'</div>  <div class="grid-item">'+ keyLB+'</div>             <div class="grid-item malLetter">'+ keyRB+'</div>    </div>'
}

function getNewString(keyLT,keyLB, extraClass){
    return '<div class="grid-new-container '+ extraClass+'">  <div class="malLetter">'
        + keyLB+'</div> <div >'+ keyLT+'</div> </div>'
}
function getArNewString(keyLT,keyLB, extraClass){
    return '<div class="grid-arabic-container '+ extraClass+'">  <div class="araLetter">'
        + keyLB+'</div> <div >'+ keyLT+'</div> </div>'
}
function showMlKeyBoardLayout(Hash){
    console.log('showmlKeyBoardLayout')
    var KeyInnerText = '<i class="fa fa-close keyCloseBtn" onclick="showKeyBoardView()" aria-hidden="true"></i>'
    var ArrayHash = Hash
    var keyLT, keyLB
    
    InsKeyBoardBox.style.display = 'flex'
    for (var i = 0; i < Hash.length; i++ ){
        keyLT = Object.keys(ArrayHash[i]);
        keyLB = Object.values(ArrayHash[i]);
        if((i > 14 && i < 40) ||(i > 50 && i < 66) || (i > 70) ){
            KeyInnerText += getNewString(keyLT,keyLB, 'gridDark')  
        }else{
            KeyInnerText += getNewString(keyLT,keyLB, 'gridLight')  
        } 
    }
    InsKeyBoardBox.innerHTML = KeyInnerText
    keyBoardON = true
    
//    adjustHeightOfUI()
    
}
function showArKeyBoardLayout(Hash){
    console.log('showArKeyBoardLayout')
    var KeyInnerText = '<i class="fa fa-close keyCloseBtn" onclick="showKeyBoardView()" aria-hidden="true"></i>'
    var ArrayHash = Hash
    var keyLT, keyLB
    
    InsKeyBoardBox.style.display = 'flex'
    for (var i = 0; i < Hash.length; i++ ){
        keyLT = Object.keys(ArrayHash[i]);
        keyLB = Object.values(ArrayHash[i]);
        KeyInnerText += getArNewString(keyLT,keyLB, 'gridDark')   
    }
    InsKeyBoardBox.innerHTML = KeyInnerText
    keyBoardON = true
    
//    adjustHeightOfUI()
    
}
function closeKeyBoardView(){
    fakeTextArea.style.bottom ='30px'
    InsKeyBoardBox.style.display = 'none'
        keyBoardON = false
}
function showKeyBoardView(){
    console.log('show keyboard view')
    closeSearchBarBox()
    if(keyBoardON == false){
       if(userSelectedMlKeyBoard == 'Inscript' && activeLanguageButton == 'langMlBtn'){
            showMlKeyBoardLayout(keyInsHash)
        } 
        else if(userSelectedMlKeyBoard == 'Phonetic' && activeLanguageButton == 'langMlBtn'){
            showMlKeyBoardLayout(keyPhoHash)
        }
        else if(userSelectedMlKeyBoard == "ASCII" && activeLanguageButton == 'langMlBtn'){
            showMlKeyBoardLayout(altCombHash)
        }
        else if(userSelectedArKeyBoard == 'Phonetic' && activeLanguageButton == 'langArBtn'){
            showArKeyBoardLayout(keyArPhoHash)
        }
        else if(userSelectedArKeyBoard == '101' && activeLanguageButton == 'langArBtn'){
            showArKeyBoardLayout(keyAr101Hash)
        }
        //need to adjust the textarea size
        adjustHeightOfUI()
        
    }
    else{
        closeKeyBoardView()
    }
}
function changeKeyBoardView(){
    console.log('changeKeyBoardView')
//    console.log(userSelectedMlKeyBoard)
    if(keyBoardON){
       if(userSelectedMlKeyBoard == 'Inscript' && activeLanguageButton == 'langMlBtn'){
            showMlKeyBoardLayout(keyInsHash)
        } 
        else if(userSelectedMlKeyBoard == 'Phonetic' && activeLanguageButton == 'langMlBtn'){
            showMlKeyBoardLayout(keyPhoHash)
        }
        else if(userSelectedMlKeyBoard == "ASCII" && activeLanguageButton == 'langMlBtn'){
            showMlKeyBoardLayout(altCombHash)
        }
        else if(userSelectedArKeyBoard == 'Phonetic' && activeLanguageButton == 'langArBtn'){
            showArKeyBoardLayout(keyArPhoHash)
        }
        else if(userSelectedArKeyBoard == '101' && activeLanguageButton == 'langArBtn'){
            showArKeyBoardLayout(keyAr101Hash)
        }
        else{
            showArKeyBoardLayout(keyArNothing)
        }
        closeSearchBarBox()
        adjustHeightOfUI()
    }
    else{
        closeKeyBoardView()
    }
}
function adjustHeightOfUI(){
    console.log('adjust Height of UI')
    var keyboardHeight = InsKeyBoardBox.clientHeight+ 30
    fakeTextArea.style.bottom = keyboardHeight + 'px'
}