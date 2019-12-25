import names from 'programing-language-names' //alias for language filename

export const regexFileType = (file) => {
    const typeMatch = file.match(/[^\.]{1}(\w+)$/g)
    if(typeMatch !== null && typeMatch.length === 1){
        return (names[typeMatch[0]] || 'javascript').toLowerCase()
    }
}