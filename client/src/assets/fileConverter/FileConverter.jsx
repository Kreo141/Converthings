import './fileConverterStyles.css'
import conversionTypes from './conversionTypes.json'
import { useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX, faFile, faCloud } from '@fortawesome/free-solid-svg-icons'

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

        if (file) {
            setFileName(file.name)
            console.log(file)
        }
    }

    function handleFileChange(e){
        const file = e.target.files[0]

        if(file){
            setFileName(file.name)
            console.log(file)
        }
    }

    return(
        <div className='upload-file-modal-container'>
            <div className='upload-file-modal'>
                <input
                    ref={inputFileRef}
                    type='file'
                    hidden
                    onChange={handleFileChange}
                />
                <div className='head flex-column-centery'>
                    <p className='upload-modal-head-label'>Upload File</p>
                    <p className='upload-modal-head-description'>Select or upload {useFileType}</p>
                    <FontAwesomeIcon icon={faX} className='upload-modal-close' onClick={() => {onCloseModalClick(showFileModal, setShowFileModal)}}/>
                </div>
                <div className='main'
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <FontAwesomeIcon icon={faCloud} className='upload-modal-cloud-icon' />
                    <p>Choose a file or drag & drop it here</p>
                    <button
                        onClick={() => inputFileRef.current.click()}
                    >Browse file</button>
                </div>
            </div>
        </div>
    )
}

export default FileConverter