import './homeStyle.css'
import { BrowserRouter, Link } from 'react-router-dom'

function Home(){
    return(
        <div className='page homePage'>
            <Link to="/FileConverter">
                <button>File Converter</button>
            </Link>
        </div>
    )
}

export default Home