function pasteFromFMLText(){
    console.log('paste from fml text')
    var pastingText = gettingClipboardText()
    pastingText = pastingText.replace(/[\u00AD\u002D\u2011]+/g,'');
    console.log(pastingText)
    var text = getConvertedUnicode(pastingText)
//    console.log(text)
    insertAtCursor(textarea, text)
}
function pasteFromMLKVText(){
    console.log('paste from mlkv text')
    var pastingText = gettingClipboardText()
    console.log(pastingText)
    var text = getConvertedUnicode(pastingText)
    text = text.replace(/@/g, 'ണ്ട')
    console.log(text)
    text = text.replace(/[\u00AD\u002D\u2011]+/g,'');
    insertAtCursor(textarea, text) 
}
function pasteFromML(){
    console.log('paste from ml text')
    var pastingText = gettingClipboardText()
    console.log(pastingText)
    var text = getConvertedUnicode(pastingText)
    text = text.replace(/-/g, 'ണ്ട')
    text = text.replace(/[\u00AD\u002D\u2011]+/g,'');
    insertAtCursor(textarea, text) 
}


function makeItIndent(){
        console.log("make it Indent")
        start = textarea.selectionStart;
        end = textarea.selectionEnd;
        var selection = textarea.value.substring(start, end);

        if(selection.toString().length > 0){
            createSelection(textarea, start, end);
            text = textarea.value;
            
        
            var replacementCount = 0
            for(var j=0; j<selection.length; j++){
                if(selection[j]=='\n'){
                    replacementCount ++
                }
            }
            console.log('replacementCount',replacementCount)
            
            
            var formatedText = '\t'+ selection.replace(/\n/g, '\n\t')
            
            var output = [text.slice(0, start), formatedText,text.slice(end)].join('');
            textarea.value = output;
            textarea.setSelectionRange(start, end+replacementCount+1);
        }
        else{
            var val = textarea.value,
            start = textarea.selectionStart,
            end = textarea.selectionEnd;   

            // set textarea value to: text before caret + tab + text after caret
            textarea.value = val.substring(0, start) + '\t' + val.substring(end);

            // put caret at right position again
            textarea.selectionStart = textarea.selectionEnd = start + 1;

            // prevent the focus lose
            //                 updateDetails()
            return true;
        }

    updateDetails()
}
function makeItUnindent(){
        console.log("make it UnIndent")
        start = textarea.selectionStart;
        end = textarea.selectionEnd;
        var selection = textarea.value.substring(start, end);

        if(selection.toString().length > 0){
            createSelection(textarea, start, end);
            text = textarea.value;
            
            //change this line
           
            var formatedText = selection.replace(/\t/g, '')
            
            var output = [text.slice(0, start), formatedText,text.slice(end)].join('');
            textarea.value = output;
            textarea.setSelectionRange(start, start);
        }
        else{
            var val = textarea.value,
            start = textarea.selectionStart,
            end = textarea.selectionEnd;   

            // set textarea value to: text before caret + tab + text after caret
            var modifiedText = val.substring(0, start).replace(/\t$/, '')
            textarea.value = modifiedText + val.substring(end);

            // put caret at right position again
            textarea.selectionStart = textarea.selectionEnd = start - 1;

            // prevent the focus lose
            //                 updateDetails()
            return true;
        }

    updateDetails()
}

function makeItEnglish(){
    console.log("make it English")
    start = textarea.selectionStart;
        end = textarea.selectionEnd;
        var selection = textarea.value.substring(start, end);

        if(selection.toString().length > 0){
            console.log("bolding ");
            createSelection(textarea, start, end);
            text = textarea.value;
            
            //change this line
            var reg = new RegExp('</span>', 'g')
            var formatedText = getConvertedToFML()
            formatedText = formatedText.replace(/<span class='engText'>/g, '</span>').replace(reg, '').replace('þ','-')
            
            var output = [text.slice(0, start), formatedText,text.slice(end)].join('');
            textarea.value = output;
            textarea.setSelectionRange(end+ 1, end+ 1);
        }
        else{
        }
//    addItem()
    updateDetails()
}

function addBullets(){
        console.log("add Bullets")
        start = textarea.selectionStart;
        end = textarea.selectionEnd;
        var selection = textarea.value.substring(start, end);

        if(selection.toString().length > 0){
            createSelection(textarea, start, end);
            text = textarea.value;
            
            //change this line
           
            var formatedText = '• '+ selection.replace(/\n/g, '\n• ')
            
            var output = [text.slice(0, start), formatedText,text.slice(end)].join('');
            textarea.value = output;
            textarea.setSelectionRange(start, start);
        }
        else{

        }

    updateDetails()
}
function addNumbering(){
        console.log("add Bullets")
        start = textarea.selectionStart;
        end = textarea.selectionEnd;
        var selection = textarea.value.substring(start, end);

        if(selection.toString().length > 0){
            createSelection(textarea, start, end);
            text = textarea.value;
            
            //change this line
            var replacementCount = 1
            var formatedText  = '1. '
            for(var j=0; j<selection.length; j++){
                if(selection[j]=='\n'){
                    replacementCount ++
                    formatedText += '\n'+ replacementCount +'. '
                }else{
                    formatedText += selection[j]
                }
                
            }
//            var formatedText = '1. '+ selection.replace(/\n/g, '\n1. ')
            
            var output = [text.slice(0, start), formatedText ,text.slice(end)].join('');
            textarea.value = output;
            textarea.setSelectionRange(start, start);
        }
        else{
        }

    updateDetails()
}
function addBulletsArabic(){
        console.log("add Bullets")
        start = textarea.selectionStart;
        end = textarea.selectionEnd;
        var selection = textarea.value.substring(start, end);

        if(selection.toString().length > 0){
            createSelection(textarea, start, end);
            text = textarea.value;
            
            //change this line
           
            var formatedText =  selection.replace(/\n/g, ' •\n') + ' •'
            
            var output = [text.slice(0, start), formatedText,text.slice(end)].join('');
            textarea.value = output;
            textarea.setSelectionRange(start, start);
        }
        else{ 

        }

    updateDetails()
}
function addNumberingArabic(){
        console.log("add Bullets")
        start = textarea.selectionStart;
        end = textarea.selectionEnd;
        var selection = textarea.value.substring(start, end);

        if(selection.toString().length > 0){
            createSelection(textarea, start, end);
            text = textarea.value;
            
            //change this line
            var replacementCount = 1
            var formatedText  = '١. '
            for(var j=0; j<selection.length; j++){
                if(selection[j]=='\n'){
                    replacementCount ++
                    formatedText += '\n'+ convertToArabicNumber(replacementCount) + '. '
                }else{
                    formatedText += selection[j]
                }
                
            }
//            var formatedText = '1. '+ selection.replace(/\n/g, '\n1. ')
            
            var output = [text.slice(0, start), formatedText ,text.slice(end)].join('');
            textarea.value = output;
            textarea.setSelectionRange(start, start);
        }
        else{
        }

    updateDetails()
}
function convertToArabicNumber(number){
    console.log('convertToArabicNumber')
    console.log(number)
    var arabicEnglishDigits = {'0':'٠','1':'١','2':'٢', '3':'٣', '4':'٤','5':'٥', '6':'٦',
    '7':'٧','8':'٨', '9':'٩'}
    var convertedArabicDigit = ''
    var gotNumber = number.toString()
    for(i=0; i < gotNumber.length; i++){
        console.log(i)
        console.log(gotNumber[i])
        console.log(arabicEnglishDigits[gotNumber[i]])
        convertedArabicDigit += arabicEnglishDigits[gotNumber[i]]
    }
    console.log(convertedArabicDigit)
    return convertedArabicDigit
}