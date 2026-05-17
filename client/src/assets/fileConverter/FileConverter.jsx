import './uploadStyles.css'
import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX, faCloud, faRightLong } from '@fortawesome/free-solid-svg-icons'
import conversionTypes from './conversionTypes.json'
import { uploadFileService } from './services/uploadFileService.js'

// HELPER/s
const getFileExtension = (filename) => {
    if (!filename) return ''
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase()
}

// ==========================================
// MAIN CONTAINER
// ==========================================
function FileConverter() {
    const [showFileModal, setShowFileModal] = useState(false)
    const [useFileType, setUseFileType] = useState("file")

    return (
        <div className="page file-converter-root">
            {conversionTypes.map((type) => (
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
            ))}

            {showFileModal && (
                <ModalController
                    useFileType={useFileType}
                    onClose={() => setShowFileModal(false)}
                />
            )}
        </div>
    )
}

// ==========================================
// FILE TYPE CARD COMPONENT
// ==========================================
function FileTypeSelect({ fileType, logoSrc, supportedFormat, onSelect }) {
    // Show top 5 formats cleanly without messy conditional mapping loops
    const visibleFormats = supportedFormat.slice(0, 5).join(', ')
    const hasMore = supportedFormat.length > 5

    return (
        <div className="file-type-select" id={fileType} onClick={() => onSelect(fileType)}>
            <div className='left flex-row-centerx'>
                <div className='file-type-logo-container'>
                    <img className='file-type-logo' src={logoSrc} alt={`${fileType} logo`} />
                </div>
                <h3>{fileType}</h3>
            </div>
            <div className='right'>
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

    const selectedType = conversionTypes.find(type => type.name === useFileType)
    const acceptFormats = selectedType ? selectedType.supportedFormat.map(f => `.${f}`).join(",") : ""

    useEffect(() => {
        if (!isConverting || !fileIDRef.current) return

        const intervalId = setInterval(async () => {
            try {
                const req = await fetch(`http://127.0.0.1:5001/convert/${fileIDRef.current}`)
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
                useFileType,
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
            await fetch(`http://127.0.0.1:5001/convert/${useFileType}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileID: fileIDRef.current,
                    originalFormat: currentFormat,
                    toConvertTo: selectedConversionFormat
                })
            })
        } catch (error) {
            console.error("Conversion triggering failed:", error)
            setIsConverting(false)
        }
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
                    fileName={selectedFile?.name}
                    currentFormat={currentFormat}
                    supportedFormats={selectedType?.supportedFormat || []}
                    selectedConversionFormat={selectedConversionFormat}
                    setSelectedConversionFormat={setSelectedConversionFormat}
                    convertProgress={convertProgress}
                    isConverting={isConverting}
                    onConvert={handleConversion}
                    onClose={onClose}
                />
            )}
        </div>
    )
}

// ==========================================
// SUB-STEPS (Clean Separation of Concerns)
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
    fileName, currentFormat, supportedFormats, selectedConversionFormat, 
    setSelectedConversionFormat, convertProgress, isConverting, onConvert, onClose 
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
                            {supportedFormats.map(format => {
                                if (format.toLowerCase() === currentFormat.toLowerCase()) return null
                                return (
                                    <li key={format} onClick={() => setSelectedConversionFormat(format)}>
                                        <a>{format}</a>
                                    </li>
                                )
                            })}
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
            </div>
        </div>
    )
}

export default FileConverter