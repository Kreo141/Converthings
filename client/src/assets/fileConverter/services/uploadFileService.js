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
            `http://127.0.0.1:5001/upload/${useFileType}`
        )

        xhr.upload.onprogress = (event) => {
            if(event.lengthComputable){
                const percent = Math.round(
                    (event.loaded / event.total) * 100
                )

                setProgress(percent)
            }
        }

        xhr.onload = () => {
            if(xhr.status === 200){
                const data = JSON.parse(xhr.responseText)
                resolve(data) // ✅ now the await in handleUpload can continue
            } else {
                reject(new Error(`Server error: ${xhr.status}`)) // ✅ handle bad responses too
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