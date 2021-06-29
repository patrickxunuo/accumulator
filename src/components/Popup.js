import React from 'react'

const Popup = (props) => {

    return (
        <div className="popup">
            <div>Do you want to end the session?</div>
            <div>
                <button className='btn-pop' onClick={() => {
                    props.stoprun()
                    props.endpop()
                    props.submittime()
                }}>Yes
                </button>
                <button className='btn-pop' onClick={() => {
                    props.startrun()
                    props.endpop()
                }}>No
                </button>
            </div>
        </div>
    )
}

export default Popup
