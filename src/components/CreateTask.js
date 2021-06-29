import React from 'react'
import firebase from 'firebase'
import firebaseConfig from "./firebaseConfig";
import emailjs, {init} from 'emailjs-com'

init("user_Onrh0ZtrXCqhljdWu3iqJ")

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore()
db.settings({timestampsInSnapshot: true})

const CreateTask = () => {
    const createTask = (event) => {
        event.preventDefault()
        let params = {
            newTask: document.getElementById('newTask').value,
            toEmail: document.getElementById('newEmail').value,
        }
        db.collection('apps').add({
            'appname': params.newTask,
            'email': params.toEmail,
        }).then(newDoc => {
            console.log(newDoc.id)
            params.url = 'https://timecounter-3e1ea.web.app/home/' + newDoc.id
            emailjs.send('service_k54g3qn', 'template_577c4u6', params)
                .then(function() {
                    console.log('SUCCESS!');
                    window.location.href = '/home/' + newDoc.id
                }, function(error) {
                    console.log('FAILED...', error);
                });
        })
    }


    //

    return (
        <div className="container create-container">
            <div className='appname'>Create a new accumulator</div>
            <form id="contact-form">
                <input id='newTask' type="text" name='newTask' placeholder="Enter task name..."/>
                <input id='newEmail' type="text" name='newEmail' placeholder="Enter your email..."/>
                <button className='btn' onClick={createTask}>Create</button>
            </form>
        </div>
    )
}

export default CreateTask
