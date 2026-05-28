import './uploadStyles.css'
import { useState, useEffect, useRef } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX, faCloud, faRightLong } from '@fortawesome/free-solid-svg-icons'

import { uploadFileService } from '../services/uploadFileService.js'
import conversionTypes from './conversionTypes.json'

// HELPER/s
const getFileExtension = (filename) => {
    if (!filename) return ''
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase()
}

const documentSupportedFormatsRaw = conversionTypes.find(item => item.name === "Document").supportedFormat
const documentSupportedFormats = Object.keys(documentSupportedFormatsRaw)

console.log(documentSupportedFormatsRaw)

const serverDev = "http://192.168.100.12:5001"
const serverProd = "http://server:5001"
const isDev = true ? serverDev : serverProd


// ==========================================
// MAIN CONTAINER
// ==========================================
function FileConverter() {
    const [showFileModal, setShowFileModal] = useState(false)
    const [useFileType, setUseFileType] = useState("file")

    return (
        <div className='file-converter-root'>
            <div className="page file-converter-wrapper">
                {conversionTypes.map((type) => {
                    if(type.name == "Document"){
                        console.log(documentSupportedFormats)
                        return(
                            <FileTypeSelect
                                key={type.name}
                                fileType={type.name}
                                logoSrc={type.logoSrc}
                                supportedFormat={documentSupportedFormats}
                                onSelect={(selectedType) => {
                                    setUseFileType(selectedType)
                                    setShowFileModal(true)
                                }}
                            />
                        )
                    }

                    console.log(documentSupportedFormats)
                    return(
                        <FileTypeSelect
                            key={type.name}
                            fileType={type.name}
                            logoSrc={type.logoSrc}
                            supportedFormat={type.supportedFormat}
                            onSelect={(selectedType) => {
                                setUseFileType(selectedType)
                                setShowFileModal(true)
                            }}
                        />
                    )
                    
                })}

                {showFileModal && (
                    <ModalController
                        useFileType={useFileType}
                        onClose={() => setShowFileModal(false)}
                    />
                )}
            </div>
        </div>
    )
}

// ==========================================
// FILE TYPE CARD COMPONENT
// ==========================================
function FileTypeSelect({ fileType, logoSrc, supportedFormat, onSelect }) {
    const visibleFormats = supportedFormat.slice(0, 5).join(', ')
    const hasMore = supportedFormat.length > 5

    return (
        <div className="file-type-select" id={fileType} onClick={() => onSelect(fileType)}>
            <div className='left flex-row-centerx'>
                <div className='file-type-logo-container'>
                    <img className='file-type-logo' src={logoSrc} alt={`${fileType} logo`} />
                </div>
                
            </div>
            <div className='right'>
                <h3 className='file-type-select-label'>{fileType}</h3>
                <p>{visibleFormats}{hasMore ? ' and more' : ''}</p>
            </div>
        </div>
    )
}

// ==========================================
// MODAL STATE CONTROLLER & WORKFLOW
// ==========================================
function ModalController({ useFileType, onClose }) {
    const fileIDRef = useRef(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const [currentFormat, setCurrentFormat] = useState("")
    
    const [step, setStep] = useState('select')
    const [uploadProgress, setUploadProgress] = useState(0)
    const [convertProgress, setConvertProgress] = useState(0)
    const [isConverting, setIsConverting] = useState(false)
    const [selectedConversionFormat, setSelectedConversionFormat] = useState("None")
    const [convertedFileID, setConvertedFileID] = useState(null)
    const [isShowErrorAlert, setIsShowErrorAlert] = useState(false)

    const selectedType = conversionTypes.find(type => type.name === useFileType)
    let acceptFormats = ""
    
    if(useFileType === "Document"){
        acceptFormats = selectedType ? Object.keys(conversionTypes.find(item => item.name === "Document").supportedFormat).map(f => `.${f}`).join(",") : ""
    } else {
        acceptFormats = selectedType ? selectedType.supportedFormat.map(f => `.${f}`).join(",") : ""
    }


    useEffect(() => {
        if (!isConverting || !fileIDRef.current) return

        const intervalId = setInterval(async () => {
            try {
                const req = await fetch(`${isDev}/convert/progress/${fileIDRef.current}`)
                const data = await req.json()
                const progressInt = Math.trunc(data.progress)
                
                setConvertProgress(progressInt)

                if (progressInt >= 100) {
                    setIsConverting(false)
                }
            } catch (error) {
                console.error("Polling error:", error)
                setIsConverting(false)
            }
        }, 2000)

        return () => clearInterval(intervalId) 
    }, [isConverting])

    const handleUpload = async (file) => {
        setStep('uploading')
        setCurrentFormat(getFileExtension(file.name))

        try {
            const data = await uploadFileService(
                file,
                file.name,
                (percent) => setUploadProgress(percent)
            )
            fileIDRef.current = data.filename
            setStep('convert')
        } catch (error) {
            alert(error.message || "Upload failed")
            setStep('select')
        }
    }

    const handleConversion = async () => {
        if (selectedConversionFormat === "None") return alert("Please select a target format")
        setIsConverting(true)
        setConvertProgress(0)

        try {
            const req = await fetch(`${isDev}/convert/${useFileType}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileID: fileIDRef.current,
                    originalFormat: currentFormat,
                    toConvertTo: selectedConversionFormat
                })
            })

            if(!req.ok){
                const errorData = await req.json()
                console.log(errorData.error)
                handleError()
                return
            }

            const data = await req.json()
            await setConvertedFileID(data.convertedFileID)
        } catch (error) {
            console.error("Conversion triggering failed:", error)
            setIsConverting(false)
        }
    }

    function handleError(){
        setIsShowErrorAlert(true)

        setTimeout(() => {
            setIsShowErrorAlert(false)
        }, 2000)
    }

    return (
        <div className='upload-file-modal-container'>
            {step === 'select' && (
                <UploadStep 
                    useFileType={useFileType} 
                    acceptFormats={acceptFormats} 
                    onClose={onClose} 
                    onFileValidated={(file) => {
                        setSelectedFile(file)
                        handleUpload(file)
                    }} 
                />
            )}

            {step === 'uploading' && (
                <ProgressStep fileName={selectedFile?.name} progress={uploadProgress} />
            )}
            {step === 'convert' && (
                <ConvertStep 
                    useFileType={useFileType}
                    fileName={selectedFile?.name}
                    currentFormat={currentFormat}
                    supportedFormats={selectedType.name === "Document" ? documentSupportedFormats : selectedType?.supportedFormat || []}
                    selectedConversionFormat={selectedConversionFormat}
                    setSelectedConversionFormat={setSelectedConversionFormat}
                    convertProgress={convertProgress}
                    convertedFileID={convertedFileID}
                    isConverting={isConverting}
                    onConvert={handleConversion}
                    onClose={onClose}
                />
            )}

            {isShowErrorAlert && <div role="alert" class="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Error! Task failed.</span>
            </div>}
        </div>
    )
}

// ==========================================
// SUB-STEPS
// ==========================================

function UploadStep({ useFileType, acceptFormats, onClose, onFileValidated }) {
    const inputFileRef = useRef(null)
    const [isDragging, setIsDragging] = useState(false)

    const verifyAndProcessFile = (file) => {
        if (!file) return
        const matches = acceptFormats.split(',').some(format => file.name.toLowerCase().endsWith(format.trim()))
        if (matches) {
            onFileValidated(file)
        } else {
            alert('This file is not supported or wrong file type')
        }
    }

    return (
        <div className={`upload-file-modal ${isDragging ? 'dragging' : ''}`}>
            <input ref={inputFileRef} type='file' accept={acceptFormats} hidden onChange={(e) => verifyAndProcessFile(e.target.files[0])} />
            
            <div className='modal-head flex-column-centery'>
                <p className='upload-modal-head-label'>Upload File</p>
                <p className='upload-modal-head-description'>Select or upload {useFileType}</p>
                <FontAwesomeIcon icon={faX} className='upload-modal-close' onClick={onClose} />
            </div>

            <div 
                className='main'
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); verifyAndProcessFile(e.dataTransfer.files[0]); }}
            >
                <FontAwesomeIcon icon={faCloud} className='upload-modal-cloud-icon' />
                <p>Choose a file or drag & drop it here</p>
                <button className='browse-file-btn' onClick={() => inputFileRef.current.click()}>Browse file</button>
            </div>
        </div>
    )
}

function ProgressStep({ fileName, progress }) {
    return (
        <div className='uploading-modal'>
            <h2 className='uploading-modal-header'>Uploading {fileName}</h2>
            <div className='progress-container'>
                <p>{progress}%</p>
                <progress className="progress progress-primary w-56" value={progress} max="100" />
            </div>
        </div>
    )
}

function ConvertStep({ 
    useFileType, fileName, currentFormat, supportedFormats, selectedConversionFormat, 
    setSelectedConversionFormat, convertProgress, convertedFileID, isConverting, onConvert, onClose 
}) {
    return (
        <div className='convert-modal'>
            <div className='convert-modal-head'>
                <h3>Select format to convert</h3>
                <FontAwesomeIcon icon={faX} className='convert-modal-close' onClick={onClose} />
            </div>

            <div className='convert-modal-main'>
                <h1>{fileName}</h1>
                <div className='convert-modal-format'>
                    <p className='file-format-badge original-format'>{currentFormat}</p>
                    <FontAwesomeIcon icon={faRightLong} />

                    <div className="dropdown dropdown-hover">
                        <div tabIndex={0} role="button" className="btn m-1">
                            {selectedConversionFormat}
                        </div>
                        <ul tabIndex={-1} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                            {
                                useFileType !== "Document"
                                ?
                                    supportedFormats.map(format => {
                                        if (format.toLowerCase() === currentFormat.toLowerCase()) {
                                            return null
                                        }
                                        return (
                                            <li
                                                key={format}
                                                onClick={() => setSelectedConversionFormat(format)}
                                            >
                                                <a>{format}</a>
                                            </li>
                                        )
                                    })
                                :
                                    documentSupportedFormatsRaw[currentFormat].map(format => {
                                        return (
                                            <li key={format} onClick={() => setSelectedConversionFormat(format)}>
                                                <a>{format}</a>
                                            </li>
                                        )
                                    })
                            }
                        </ul>
                    </div>
                </div>
                <progress className="progress progress-error w-56" value={convertProgress} max="100" />
                <button 
                    className={`convert-btn ${isConverting ? "disable-btn" : ""}`} 
                    disabled={isConverting} 
                    onClick={onConvert}
                >
                    {isConverting ? 'Converting...' : 'Convert'}
                </button>

                { (convertProgress == 100 && !isConverting)  && 
                <button
                    className={`download-btn ${convertProgress == 100 ? "" : "disable-btn"}`} 
                    onClick={() => {
                        window.location.href = `${isDev}/convert/download/${convertedFileID}`
                    }}
                >
                    Download
                </button>}
            </div>
        </div>
    )
}

export default FileConverter