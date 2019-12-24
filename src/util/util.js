import names from 'programing-language-names' //alias for language filename

export const regexFileType = (file) => {
    const typeMatch = file.match(/(?<=\.)\w+$/g)
    if(typeMatch && typeMatch.length === 1){
        return names[typeMatch[0]].toLowerCase()
    }
}