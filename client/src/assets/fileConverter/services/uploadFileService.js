/** 
*
* @param {File} file
* @param {string} fileName
* @param {string} useFileType
* @param {Function} setProgress
*
*/

export const uploadFileService = (file, fileName, useFileType, setProgress) => {
    return new Promise((resolve, reject) => {
        const formData = new FormData()
        formData.append("file", file, fileName)

        const xhr = new XMLHttpRequest()

        xhr.open(
            "POST",
            `http://127.0.0.1:5001/convert/${useFileType}`
        )

        xhr.upload.onprogress = (event) => {
            if(event.lengthComputable){
                const percent = Math.round(
                    (event.loaded / event.total) * 100
                )

                setProgress(percent)
            }
        }

        xhr.upload.onProgress = (event) => {
            if(event.lengthComputable){
                const percent = Math.round((event / event.total) * 100)
                onProgress(percent)
            }
        }

        xhr.onload = () => {
            if(xhr.status === 200){
                console.log(JSON.parse(xhr.responseText))
            }
        }

        xhr.onerror = () => {
            reject(new Error("Network Error"))
        }

        xhr.send(formData)
    })
}

export const getFileExtension = (filename) => {
    if(!filename) return ""
    const parts = filename.split('.')
    return parts[parts.length - 1]
}