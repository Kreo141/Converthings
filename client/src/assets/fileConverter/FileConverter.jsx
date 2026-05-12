import './fileConverterStyles.css'
import conversionTypes from './conversionTypes.json'
import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX, faFile, faCloud, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'

function FileConverter(){

    const [showFileModal, setShowFileModal] = useState(false)
    const [useFileType, setUseFileType] = useState("file")

    return(
        <div className="page file-converter-root">
            {
                conversionTypes.map((type, index) => (
                    <FileTypeSelect fileType={type.name} logoSrc={type.logoSrc} supportedFormat={type.supportedFormat} showFileModal={showFileModal} setShowFileModal={setShowFileModal} setUseFileType={setUseFileType}/>
                ))
            }
            {
                showFileModal && <UploadFileModal useFileType={useFileType} showFileModal={showFileModal} setShowFileModal={setShowFileModal}/>
            }
        </div>
    )
}

function FileTypeSelect( {fileType, logoSrc, supportedFormat, showFileModal, setShowFileModal, setUseFileType} ){
    function onFileTypeSelect(fileType){
        setUseFileType(fileType)
        setShowFileModal(!showFileModal)
    }

    return(
        <div className="file-type-select" id={fileType} onClick={() => onFileTypeSelect(fileType)}>
            <div className='left flex-row-centerx'>
                <div className='file-type-logo-container'>
                    <img className='file-type-logo' src={logoSrc} alt={`${fileType} logo`}/>            
                </div>
                <h3>{fileType}</h3>
            </div>
            <div className='right'>
                <p>{
                    supportedFormat.map((format, index) => {
                        if(index == 5){
                            return (' and more')
                        }
                        if(index > 5){
                            return false
                        }
                        return(
                            `${format}, `
                        )
                    })    
                }</p>
            </div>
        </div>
    )
}

function UploadFileModal({useFileType, showFileModal, setShowFileModal}){
    const inputFileRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false)
    const [fileName, setFileName] = useState("")
    const [selectedFile, setSelectedFile] = useState(null)
    const [isToUpload, setIsToUpload] = useState(false);
    const [progress, setProgress] = useState(0)

    const selectedType = conversionTypes.find(
        type => type.name === useFileType
    )

    const acceptFormats = selectedType
        ? selectedType.supportedFormat
            .map(format => `.${format}`)
            .join(",")
        : ""

    useEffect(() => {
        if (progress == 100){
            setShowFileModal(false)
        }
    }, [progress])

    function onCloseModalClick(showFileModal, setShowFileModal){
        setShowFileModal(!showFileModal)
    }    

    function handleDragOver(e){
        e.preventDefault()
        setIsDragging(true)
    }

    function handleDragLeave(){
        setIsDragging(false)
    }

    function handleDrop(e){
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if(acceptFormats.split(',').some(format => 
            file.name.toLowerCase().endsWith(format)
        )){
            if (file) {
                setFileName(file.name)
                setSelectedFile(file)
                console.log(file)
            }
        } else {
            alert('This file is not supported or wrong file type')
        }

        
    }

    function handleFileChange(e){
        const file = e.target.files[0]

        if(file){
            setFileName(file.name)
            setSelectedFile(file)
            console.log(file)
        }
    }



    function handleConvert(){
        setIsToUpload(true)
        setFileName(null)
        let formData = new FormData()

        formData.append("file", selectedFile, fileName)
        //ormData.append
        alert(useFileType + " " + selectedFile + " " + fileName)

        // fetch(`http://127.0.0.1:5001/convert/${useFileType}`, {
        //     method: 'POST',
        //     body: formData,
        // })
        // .then(res => res.json())
        // .then(data => console.log(data))

        const xhr = new XMLHttpRequest()

        xhr.open(
            "POST",
            `http://127.0.0.1:5001/convert/${useFileType}`
        )

        xhr.upload.onprogress = (event) => {
            if(event.lengthComputable) {
                const percent = Math.round(
                    (event.loaded / event.total) * 100
                )

                setProgress(percent)
            }
        }

        xhr.onload = () => {
            if(xhr.status === 200){
                console.log(JSON.parse(xhr.responseText))
            }
        }

        xhr.onerror = () => {
            alert("Upload failed")
            console.log("Upload Failed")
        }

        xhr.send(formData)
    }

    return(
        <div className='upload-file-modal-container'>
            { !isToUpload && <div className='upload-file-modal'>
                <input
                    ref={inputFileRef}
                    type='file'
                    accept={acceptFormats}
                    hidden
                    onChange={handleFileChange}
                />
                <div className='modal-head flex-column-centery'>
                    <p className='upload-modal-head-label'>Upload File</p>
                    <p className='upload-modal-head-description'>Select or upload {useFileType}</p>
                    <FontAwesomeIcon icon={faX} className='upload-modal-close' onClick={() => {onCloseModalClick(showFileModal, setShowFileModal)}}/>
                </div>
                <div className='main'
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    { (!fileName && !isToUpload) && <><FontAwesomeIcon icon={faCloud} className='upload-modal-cloud-icon' /> 
                     <p>Choose a file or drag & drop it here</p> 
                    <button
                        className='browse-file-btn'
                        onClick={() => inputFileRef.current.click()}
                    >Browse file</button> </>}

                    { fileName && <>
                        <h3>{fileName}</h3>
                        <button className='convert-file-btn' onClick={() => handleConvert()}>Convert?</button>
                        <a className='orChooseAnother' onClick={() => inputFileRef.current.click()}>or choose other {useFileType}</a>
                    </>}
                </div>
            </div>}

            { isToUpload && <>
                <div className='uploading-modal'>
                    <h2 className='uploading-modal-header'>Uploading {selectedFile.name}</h2>
                    <div className='progress-container'>
                        <p>{progress}%</p>
                        <progress className="progress progress-primary w-56" value={progress} max="100"></progress>
                    </div>
                </div>
            </>}

            {

            }
        </div>
    )
}

export default FileConverter