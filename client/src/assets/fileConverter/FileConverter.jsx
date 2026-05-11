import './fileConverterStyles.css'
import conversionTypes from './conversionTypes.json'

function FileConverter(){
    return(
        <div className="page file-converter-root">
            {
                conversionTypes.map((type, index) => (
                    <FileTypeSelect fileType={type.name} logoSrc={type.logoSrc} supportedFormat={type.supportedFormat}/>
                ))
            }
        </div>
    )
}

function FileTypeSelect( {fileType, logoSrc, supportedFormat} ){
    function onFileTypeSelect(fileType){
        alert(`Converting as ${fileType}`)
    }

    return(
        <div className="file-type-select" id={fileType} onClick={() => onFileTypeSelect(fileType)}>
            <div className='left flex-row align-items-center'>
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

export default FileConverter