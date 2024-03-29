export async function checkFile(file: File) {
    console.log("file is ", file);


    let errorMessage=""
    const fileExtensionArray = file.type.split("/");
    const fileExtension = fileExtensionArray[fileExtensionArray.length - 1];
    
    let fileokay=true;
    return {
        errorMessage:errorMessage,
        fileExtension: fileExtension
    };
}


export function checkColumns(fields: (string[] | undefined), requiredFields:string[]) {
    for (const field of requiredFields) {
        if (!fields) {
            return {
                errorMessage:"Error: Unable to parse CSV file"

            }
        } else {
          if (!fields.includes(field)) {
            return {
                errorMessage:`Error: required column ${field} not found`
            }
          }
        }
      }
      return {
        errorMessage:""
      }
}