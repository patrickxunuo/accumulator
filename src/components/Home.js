import React, {useState, useEffect} from 'react'
import {motion, AnimatePresence} from "framer-motion";
import Popup from "./Popup";
import firebase from 'firebase'
import {BrowserRouter as Switch, Route, Link, useParams} from "react-router-dom"

const db = firebase.firestore()
db.settings({timestampsInSnapshot: true})

function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function convertTimeColon(time) {
    let hh = Math.floor(time / 3600)
    let mm = Math.floor((time - hh * 3600) / 60)
    let ss = (time - hh * 3600 - mm * 60)
    if (hh.toString().length === 1) {
        hh = '0' + hh
    }
    if (mm.toString().length === 1) {
        mm = '0' + mm
    }
    if (ss.toString().length === 1) {
        ss = '0' + ss
    }
    return hh + ':' + mm + ':' + ss
}

function convertTimeHour(time) {
    if (time === 0) {
        return `Nothing `
    }
    let hh = Math.floor(time / 3600)
    let mm = Math.floor((time - hh * 3600) / 60)
    // let ss = (time - hh * 3600 - mm * 60)
    // return hh + ' hr ' + mm + ' min ' + ss + ' sec'
    if (hh === 0) {
        return mm + ' min'
    }
    return hh + ' hr ' + mm + ' min'
}

const Home = () => {
    // const location = useLocation()
    const [time, setTime] = useState(0)
    const [title, setTitle] = useState(null)
    const [isRunning, setIsRunning] = useState(false)
    const [ending, setEnding] = useState(false)
    const [date, setDate] = useState(Date().slice(0, 15))
    const [ifHave, setIfHave] = useState(false)
    const [weekTime, setWeekTime] = useState(null)
    const [todayTime, setTodayTime] = useState(null)
    const [loading, setLoading] = useState(true)
    let {appid} = useParams()

    useEffect(() => {
        if (db.collection('apps').doc(appid)) {
            setTimeout(() => {
                setLoading(false)
                db.collection('apps').doc(appid).get().then((snapshot) =>
                    setTitle(snapshot.data().appname)
                )
            }, 2000)
        }
        let weekTime = 0
        db.collection('apps').doc(appid).collection('data').where('weekNo', '==', getWeekNumber(new Date())).get().then((snapshot) => {
            snapshot.docs.forEach(doc => {
                weekTime += doc.data().second
            })
            setWeekTime(convertTimeHour(weekTime))
        })
        db.collection('apps').doc(appid).collection('data').where('date', '==', Date().slice(4, 15)).get().then((snapshot) => {
            if (snapshot.docs.length !== 0) {
                setIfHave(true)
                setTodayTime(convertTimeHour(snapshot.docs[0].data().second))
            } else {
                setIfHave(false)
                setTodayTime(convertTimeHour(0))
            }
        })
        if (isRunning) {
            const timer = setInterval(() => {
                setTime(time => time + 1)
            }, 1000)
            return () => window.clearInterval(timer)
        }
    }, [isRunning, weekTime, ifHave, appid])

    const startRun = () => {
        setIsRunning(true)
    }

    const stopRun = () => {
        setIsRunning(false)
    }

    const startPop = () => {
        setEnding(true)
    }

    const endPop = () => {
        setEnding(false)
    }

    const submitTime = () => {
        setWeekTime(weekTime => weekTime + time)
        setTodayTime(todayTime => todayTime + time)
        if (ifHave) {
            db.collection('apps').doc(appid).collection('data').where('date', '==', Date().slice(4, 15)).get().then((snapshot) => {
                snapshot.docs.forEach(doc => {
                    db.collection('apps').doc(appid).collection('data').doc(doc.id).update({
                        second: time + doc.data().second
                    })
                })
            })
        } else {
            db.collection('apps').doc(appid).collection('data').add({
                date: Date().slice(4, 15),
                weekNo: getWeekNumber(new Date()),
                second: time,
            })
        }
        setTime(0)
    }

    const variants = {
        initial: {
            opacity: 0,
            display: 'none',
        },
        animate: {
            opacity: 1,
            display: 'block',
            transition: {duration: 1.5, delay: 1},
        }
    }


    const flexVariants = {
        initial: {
            opacity: 0,
            display: 'none',
        },
        animate: {
            opacity: 1,
            display: 'flex',
            transition: {duration: 1.5, delay: 1, ease: 'easeOut'},
        }
    }

    const loadingVariants = {
        initial: {
            scale: 0,
            opacity: 0,
        },
        animate: {
            scale: 1,
            opacity: 1,
            transition: {duration: 1, ease: 'easeOut'},
        },
        exit: {
            scale: 5,
            opacity: 0.5,
            transition: {duration: 1, ease: 'easeOut'},
        }
    }
    return (

        <div className="container home-container">
            <AnimatePresence exitBeforeEnter={true}>
                {loading === true &&
                <motion.div className='timer' variants={loadingVariants} initial='initial' animate={'animate'}
                            exit='exit'>
                    Loading...
                </motion.div>
                }
            </AnimatePresence>
            <AnimatePresence exitBeforeEnter={true}>
                {loading === false &&
                <>
                    <motion.div className="appname" variants={variants} initial='initial'
                                animate='animate'>{title}</motion.div>
                    <motion.div className="date" variants={variants} initial='initial'
                                animate='animate'>{date}</motion.div>
                    <motion.div className="timer" variants={flexVariants} initial='initial'
                                animate='animate'>{convertTimeColon(time)}</motion.div>
                    {(!isRunning && !ending) &&
                    <motion.button className="btn" id='btn-start'
                                   variants={variants}
                                   initial='initial'
                                   animate='animate'
                                   onClick={startRun}
                                   whileHover={{
                                       scale: 1.02,
                                   }}
                                   whileTap={{
                                       backgroundColor: 'var(--button-text)',
                                       color: 'var(--button)',
                                   }}
                    >
                        Start
                    </motion.button>
                    }
                    {(isRunning || ending) &&
                    <button className="btn" id='btn-stop' onClick={() => {
                        stopRun()
                        startPop()
                    }}>
                        End
                    </button>
                    }
                    <motion.div className="week-timer" variants={variants} initial='initial' animate='animate'>
                        Contributed
                        <div>
                            {weekTime} this week
                        </div>
                        <div>
                            {todayTime} today
                        </div>
                    </motion.div>
                </>
                }
            </AnimatePresence>
            {
                ending &&
                <Popup startrun={startRun} stoprun={stopRun} startpop={startPop} endpop={endPop}
                       submittime={submitTime}/>
            }
            {
                ending &&
                <div className="canvas">

                </div>
            }
        </div>
    )
}

export default Home
