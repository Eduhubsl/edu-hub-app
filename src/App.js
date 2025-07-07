import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut 
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    where, 
    getDocs, 
    setDoc, 
    doc, 
    setLogLevel 
} from 'firebase/firestore';

// --- PASTE YOUR FIREBASE CONFIG OBJECT HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyCek7i7cjQaAgERLgfhgTDPRgwCikEra-4",
  authDomain: "edu-hub-app.firebaseapp.com",
  projectId: "edu-hub-app",
  storageBucket: "edu-hub-app.firebasestorage.app",
  messagingSenderId: "593499285654",
  appId: "1:593499285654:web:694c7cf80dbe47aa403ab7"
};
// ---------------------------------------------

// --- Helper Components & Icons ---
const BookOpen=(props)=>(<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>);
const Zap=(props)=>(<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2z"/></svg>);
const CalendarDays=(props)=>(<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>);
const HeartHandshake=(props)=>(<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.82 2.94 0l.06-.06L12 11l2.96-2.96a2.17 2.17 0 0 1 2.94 0v0c.82.82.82 2.13 0 3.08L12 14Z"/></svg>);
const GraduationCap=(props)=>(<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.084a1 1 0 0 0 0 1.838l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12v5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-5"/></svg>);
const Trophy=(props)=>(<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>);
const UploadCloud=(props)=>(<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>);
const Mic=(props)=>(<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>);
const StopCircle=(props)=>(<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><rect width="6" height="6" x="9" y="9"/></svg>);
const Trash2=(props)=>(<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>);
const AlertTriangle=(props)=>(<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>);
const ChevronLeft=(props)=>(<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>);
const ChevronRight=(props)=>(<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>);


// --- Reusable UI Components ---

const Modal = ({ children, onClose }) => {
    if (!children) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 font-sans">
            <div className="bg-white rounded-lg shadow-xl p-8 w-11/12 max-w-md text-center relative">
                 <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                {children}
            </div>
        </div>
    );
};

// --- Main Application Components ---

const Header = ({ setPage, user, auth }) => {
    const handleLogout = async () => {
        try {
            await signOut(auth);
            setPage('home'); // Redirect to home after logout
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                <div 
                    className="cursor-pointer text-3xl font-extrabold text-dark-gray"
                    onClick={() => setPage('home')}
                >
                    Edu-<span className="text-primary">Hub</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-4">
                    {user ? (
                        <>
                            <button onClick={() => setPage('dashboard')} className="hidden sm:block bg-gray-200 text-dark-gray font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Dashboard</button>
                            <button onClick={() => setPage('profile')} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors shadow-sm hover:shadow-md">Profile</button>
                            <button onClick={handleLogout} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">Logout</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setPage('login')} className="bg-gray-200 text-dark-gray font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Login</button>
                            <button onClick={() => setPage('signup')} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors shadow-sm hover:shadow-md">Sign Up</button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

const HomePage = ({ setPage }) => {
    const services = [
        { title: "Standard Assignment Help", icon: <BookOpen className="w-12 h-12" style={{ color: '#1a237e' }}/>, page: 'assignmentForm', props: { isEmergency: false, title: "Standard Assignment Help" }, description: "Expert help with your assignments. Standard delivery with a minimum 5-day deadline." },
        { title: "Emergency Assignment Help", icon: <Zap className="w-12 h-12" style={{ color: '#ef4444' }}/>, page: 'assignmentForm', props: { isEmergency: true, title: "Emergency Assignment Help" }, description: "Urgent deadline? Our emergency service delivers within 48 hours. Subject to review." },
        { title: "Research & Dissertation Help", icon: <GraduationCap className="w-12 h-12" style={{ color: '#f9a825' }}/>, page: 'assignmentForm', props: { isEmergency: false, title: "Research & Dissertation Help" }, description: "Comprehensive support for your research papers and dissertations, from proposal to final submission." },
        { title: "Education Consultation", icon: <CalendarDays className="w-12 h-12" style={{ color: '#1a237e' }}/>, page: 'consultation', props: { title: "Book an Education Consultation"}, description: "Schedule a session with our expert consultants to plan your academic future." },
        { title: "Life Coaching", icon: <HeartHandshake className="w-12 h-12" style={{ color: '#ef4444' }}/>, page: 'consultation', props: { title: "Book a Life Coaching Session"}, description: "Guidance for university life and career paths. Free for students." },
        { title: "PhD Scholarship Guidance", icon: <Trophy className="w-12 h-12" style={{ color: '#f9a825' }}/>, page: 'consultation', props: { title: "Book PhD Scholarship Guidance"}, description: "Get expert advice and assistance in securing your PhD scholarship." },
    ];

    return (
        <div className="flex-grow bg-light-gray">
            <div className="text-center py-20 md:py-28 px-4 bg-white">
                <h1 className="text-4xl md:text-6xl font-extrabold text-dark-gray leading-tight">Your Academic Success Partner</h1>
                <p className="text-lg text-gray-600 mt-6 max-w-3xl mx-auto">From complex assignments to life-changing decisions, we're here to guide you every step of the way.</p>
                 <button 
                    onClick={() => setPage('assignmentForm', { isEmergency: false, title: "Get Started" })}
                    className="mt-10 bg-primary text-white font-bold text-lg py-3 px-10 rounded-full hover:bg-primary-hover transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                    Get Help Now
                </button>
            </div>
            <div className="container mx-auto px-6 py-20">
                <h2 className="text-3xl font-bold text-center text-dark-gray mb-12">Our Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map(service => (
                        <div key={service.title}
                            onClick={() => setPage(service.page, service.props)}
                            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col text-center items-center"
                        >
                            <div className="bg-light-gray p-4 rounded-full mb-6">
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-bold text-dark-gray mb-3">{service.title}</h3>
                            <p className="text-gray-600 flex-grow">{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ... AssignmentForm component remains the same ...
const AssignmentForm = ({ db, userId, setPage, isEmergency = false, title = "Submit Your Assignment" }) => {
    const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '', subject: '', academicLevel: 'Diploma', deadline: '' });
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [modalInfo, setModalInfo] = useState({ message: '' });
    const [deadlineError, setDeadlineError] = useState('');
    const [descriptionMode, setDescriptionMode] = useState('text');
    const [textDescription, setTextDescription] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState('');
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);

    const handleStartRecording = async () => {
        setAudioURL(''); setAudioBlob(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const audioChunks = [];
            mediaRecorder.ondataavailable = event => { audioChunks.push(event.data); };
            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                const url = URL.createObjectURL(blob);
                setAudioURL(url);
            };
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            setModalInfo({ children: <p>Could not access microphone. Please check your browser permissions.</p> });
        }
    };
    const handleStopRecording = () => { if (mediaRecorderRef.current) { mediaRecorderRef.current.stop(); setIsRecording(false); } };
    const resetRecording = () => { setAudioURL(''); setAudioBlob(null); };
    const getMinDeadline = () => {
        const today = new Date();
        if (isEmergency) { today.setDate(today.getDate() + 2); } else { today.setDate(today.getDate() + 5); }
        return today.toISOString().split('T')[0];
    };
    const handleDateChange = (e) => {
        const selectedDate = new Date(e.target.value);
        const minDeadlineDate = new Date(getMinDeadline());
        selectedDate.setHours(0, 0, 0, 0); minDeadlineDate.setHours(0, 0, 0, 0);
        if (!isEmergency && selectedDate < minDeadlineDate) { setDeadlineError('Deadline must be at least 5 days from now.'); }
        else if (isEmergency && selectedDate < minDeadlineDate) { setDeadlineError('Emergency deadline must be at least 48 hours from now.'); }
        else { setDeadlineError(''); }
        setFormData({ ...formData, deadline: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (deadlineError) { setModalInfo({ children: <p>{deadlineError}</p> }); return; }
        if (!file) { setModalInfo({ children: <p>Please upload your assignment brief.</p> }); return; }
        if (descriptionMode === 'text' && !textDescription.trim()) { setModalInfo({ children: <p>Please provide a written description.</p> }); return; }
        if (descriptionMode === 'audio' && !audioBlob) { setModalInfo({ children: <p>Please record a voice note.</p> }); return; }
        setIsLoading(true);
        try {
            const collectionPath = `submissions`;
            const submissionData = { ...formData, serviceTitle: title, userId, isEmergency, fileName: file.name, fileSize: file.size, descriptionType: descriptionMode, description: descriptionMode === 'text' ? textDescription : 'Audio Note Recorded', hasAudioNote: descriptionMode === 'audio' && !!audioBlob, status: 'submitted', submittedAt: new Date() };
            await addDoc(collection(db, collectionPath), submissionData);
            setModalInfo({ children: <p>Your request has been submitted successfully! We will contact you shortly.</p> });
            setFormData({ name: '', email: '', whatsapp: '', subject: '', academicLevel: 'Diploma', deadline: '' });
            setFile(null); setTextDescription(''); resetRecording();
        } catch (error) {
            setModalInfo({ children: <p>There was an error submitting your form. Please try again.</p> });
        } finally { setIsLoading(false); }
    };
    const handleFileChange = (e) => { e.target.files[0] && setFile(e.target.files[0]); };

    return (
        <div className="bg-light-gray py-12 px-4">
            <Modal onClose={() => setModalInfo({ children: null })}>{modalInfo.children}</Modal>
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-8 md:p-12">
                <button onClick={() => setPage('home')} className="text-primary hover:underline mb-6 font-semibold">&larr; Back to services</button>
                <h2 className="text-3xl font-bold text-center text-dark-gray mb-2">{title}</h2>
                <p className="text-center text-gray-600 mb-8">Please provide the details for your request below.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"/><input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"/></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><input type="tel" placeholder="WhatsApp Number" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} required className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"/><input type="text" placeholder="Subject / Module" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Academic Level</label><select value={formData.academicLevel} onChange={(e) => setFormData({...formData, academicLevel: e.target.value})} required className="p-3 border border-gray-300 rounded-lg w-full bg-white focus:ring-2 focus:ring-primary focus:outline-none"><option>Diploma</option><option>HND</option><option>BSc</option><option>MSc</option><option>PhD</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label><input type="date" value={formData.deadline} onChange={handleDateChange} required min={getMinDeadline()} className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"/>{deadlineError && <p className="text-red-500 text-sm mt-1">{deadlineError}</p>}</div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Describe Your Requirements</label><div className="flex border border-gray-300 rounded-lg p-1 bg-gray-100"><button type="button" onClick={() => setDescriptionMode('text')} className={`w-1/2 py-2 rounded-md transition-colors font-medium ${descriptionMode === 'text' ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>Written</button><button type="button" onClick={() => setDescriptionMode('audio')} className={`w-1/2 py-2 rounded-md transition-colors font-medium ${descriptionMode === 'audio' ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>Voice Note</button></div><div className="mt-4">{descriptionMode === 'text' ? (<textarea value={textDescription} onChange={(e) => setTextDescription(e.target.value)} rows="4" placeholder="Please describe what you need help with..." className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"></textarea>) : (<div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">{!isRecording && !audioURL && (<button type="button" onClick={handleStartRecording} className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"><Mic className="w-5 h-5 mr-2"/> Start Recording</button>)}{isRecording && (<button type="button" onClick={handleStopRecording} className="inline-flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 animate-pulse font-semibold"><StopCircle className="w-5 h-5 mr-2"/> Stop Recording</button>)}{audioURL && !isRecording && (<div className="space-y-3"><p className="text-sm text-gray-600">Recording complete. You can play it back before submitting.</p><audio src={audioURL} controls className="w-full"></audio><button type="button" onClick={resetRecording} className="inline-flex items-center text-red-600 hover:text-red-800 font-semibold"><Trash2 className="w-4 h-4 mr-1"/> Record Again</button></div>)}</div>)}</div></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Upload Assignment Brief/Guidelines</label><label htmlFor="file-upload" className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"><UploadCloud className="w-10 h-10 text-gray-400"/><p className="mt-2 text-sm text-gray-600">{file ? file.name : 'Click to upload a file'}</p><p className="text-xs text-gray-500">PDF, DOCX, PPTX, TXT (MAX. 10MB)</p></label><input id="file-upload" type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.pptx,.txt"/></div>
                    <button type="submit" disabled={isLoading || !!deadlineError} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-hover transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1">{isLoading ? 'Submitting...' : 'Submit Request'}</button>
                </form>
            </div>
        </div>
    );
};

// --- NEW CALENDAR BOOKING COMPONENT ---
const ConsultationBooking = ({ db, userId, setPage, title }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [modalContent, setModalContent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [bookingDetails, setBookingDetails] = useState({ name: '', email: '' });

    const availableTimes = ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"];

    useEffect(() => {
        if (!db || !selectedDate) return;
        const fetchBookedSlots = async () => {
            const appId = firebaseConfig.appId || 'default-app-id';
            const collectionPath = `/artifacts/${appId}/public/data/bookings`;
            const q = query(collection(db, collectionPath), where("date", "==", selectedDate.toISOString().split('T')[0]));
            const querySnapshot = await getDocs(q);
            const slots = querySnapshot.docs.map(doc => doc.data().time);
            setBookedSlots(slots);
        };
        fetchBookedSlots();
    }, [db, selectedDate]);

    const changeMonth = (amount) => { setCurrentDate(prev => { const newDate = new Date(prev); newDate.setMonth(prev.getMonth() + amount); return newDate; }); };
    const handleDateClick = (day) => { if (day < new Date().getDate() && currentDate.getMonth() === new Date().getMonth()) return; const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day); setSelectedDate(newSelectedDate); setSelectedTime(null); };
    const handleTimeSelect = (time) => { setSelectedTime(time); setModalContent("form"); };
    const handleBookingSubmit = async (e) => {
        e.preventDefault(); setIsLoading(true);
        try {
            const appId = firebaseConfig.appId || 'default-app-id';
            const collectionPath = `/artifacts/${appId}/public/data/bookings`;
            const docId = `${selectedDate.toISOString().split('T')[0]}_${selectedTime}`;
            await setDoc(doc(db, collectionPath, docId), { title, date: selectedDate.toISOString().split('T')[0], time: selectedTime, name: bookingDetails.name, email: bookingDetails.email, userId, bookedAt: new Date() });
            setBookedSlots([...bookedSlots, selectedTime]);
            setModalContent("success");
        } catch (error) {
            setModalContent("error");
        } finally { setIsLoading(false); }
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear(); const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date(); const blanks = Array(firstDay).fill(null); const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        return (
            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4"><button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft /></button><h3 className="text-lg font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3><button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight /></button></div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-semibold text-gray-500">{day}</div>)}{blanks.map((_, i) => <div key={`blank-${i}`}></div>)}{days.map(day => { const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear(); const isPast = new Date(year, month, day) < new Date(today.toDateString()); const isSelected = selectedDate && day === selectedDate.getDate() && month === selectedDate.getMonth(); let dayClass = "p-2 rounded-full cursor-pointer hover:bg-primary-hover hover:text-white"; if (isPast) dayClass += " text-gray-400 cursor-not-allowed"; else if (isSelected) dayClass += " bg-primary text-white"; else if (isToday) dayClass += " bg-secondary text-white"; return <div key={day} onClick={() => !isPast && handleDateClick(day)} className={dayClass}>{day}</div>; })}</div>
            </div>
        );
    };

    const renderTimeSlots = () => {
        if (!selectedDate) return <p className="mt-8 text-center text-gray-500">Please select a date to see available times.</p>;
        return (
            <div className="mt-8"><h3 className="font-semibold text-center mb-4">Available slots for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{availableTimes.map(time => { const isBooked = bookedSlots.includes(time); return (<button key={time} disabled={isBooked} onClick={() => handleTimeSelect(time)} className={`p-3 rounded-lg font-semibold transition-colors ${isBooked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-hover'}`}>{time}</button>); })}</div></div>
        );
    };

    const renderModalContent = () => {
        if (modalContent === "form") { return (<div><h3 className="text-xl font-bold mb-4">Confirm Your Booking</h3><p className="mb-4">You are booking for <span className="font-semibold">{title}</span> on <span className="font-semibold">{selectedDate.toLocaleDateString()}</span> at <span className="font-semibold">{selectedTime}</span>.</p><form onSubmit={handleBookingSubmit} className="text-left space-y-4"><input type="text" placeholder="Full Name" required value={bookingDetails.name} onChange={e => setBookingDetails({...bookingDetails, name: e.target.value})} className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"/><input type="email" placeholder="Email Address" required value={bookingDetails.email} onChange={e => setBookingDetails({...bookingDetails, email: e.target.value})} className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"/><button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-hover transition-colors disabled:bg-gray-400">{isLoading ? "Booking..." : "Confirm Booking"}</button></form></div>); }
        if (modalContent === "success") { return (<div><h3 className="text-xl font-bold mb-4 text-green-600">Booking Confirmed!</h3><p>Your consultation is booked. You will receive a confirmation email shortly.</p></div>); }
        if (modalContent === "error") { return (<div><h3 className="text-xl font-bold mb-4 text-red-600">Booking Failed</h3><p>Something went wrong. Please try again.</p></div>); }
        return null;
    };

    return (
        <div className="bg-light-gray py-12 px-4"><Modal onClose={() => setModalContent(null)}>{renderModalContent()}</Modal><div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8 md:p-12"><button onClick={() => setPage('home')} className="text-primary hover:underline mb-6 font-semibold">&larr; Back to services</button><h2 className="text-3xl font-bold text-center text-dark-gray mb-8">{title}</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-8">{renderCalendar()}{renderTimeSlots()}</div></div></div>
    );
};


const AdminDashboard = ({ db }) => {
    const [view, setView] = useState('assignments');
    const [assignments, setAssignments] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!db) return;
        setIsLoading(true);
        let unsubscribe;
        const appId = firebaseConfig.appId || 'default-app-id';

        if (view === 'assignments') {
            const collectionPath = `/artifacts/${appId}/public/data/submissions`;
            const q = query(collection(db, collectionPath));
            unsubscribe = onSnapshot(q, (querySnapshot) => {
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                data.sort((a, b) => b.submittedAt.toDate() - a.submittedAt.toDate());
                setAssignments(data);
                setIsLoading(false);
            });
        } else if (view === 'bookings') {
            const collectionPath = `/artifacts/${appId}/public/data/bookings`;
            const q = query(collection(db, collectionPath));
            unsubscribe = onSnapshot(q, (querySnapshot) => {
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                data.sort((a, b) => new Date(a.date) - new Date(b.date));
                setBookings(data);
                setIsLoading(false);
            });
        } else { // view === 'users'
            const collectionPath = `/artifacts/${appId}/public/data/users`;
            const q = query(collection(db, collectionPath));
            unsubscribe = onSnapshot(q, (querySnapshot) => {
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                data.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
                setUsers(data);
                setIsLoading(false);
            });
        }
        
        return () => unsubscribe();
    }, [db, view]);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-dark-gray">Admin Dashboard</h1>
            <div className="flex border-b mb-6">
                <button onClick={() => setView('assignments')} className={`py-2 px-4 font-semibold ${view === 'assignments' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Submissions</button>
                <button onClick={() => setView('bookings')} className={`py-2 px-4 font-semibold ${view === 'bookings' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Bookings</button>
                <button onClick={() => setView('users')} className={`py-2 px-4 font-semibold ${view === 'users' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Users</button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                {isLoading ? ( <p className="p-4 text-center">Loading...</p> ) : 
                 view === 'assignments' ? (
                    assignments.length === 0 ? <p className="p-4 text-center">No assignments submitted yet.</p> :
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th></tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200">{assignments.map(job => (<tr key={job.id}><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-dark-gray">{job.serviceTitle}</div>{job.isEmergency && <span className='text-xs text-red-600 font-bold'>EMERGENCY</span>}</td><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-dark-gray">{job.name}</div><div className="text-sm text-gray-500">{job.email}</div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">{job.subject}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.deadline}</td></tr>))}</tbody>
                    </table>
                 ) : view === 'bookings' ? (
                    bookings.length === 0 ? <p className="p-4 text-center">No bookings yet.</p> :
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th></tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200">{bookings.map(book => (<tr key={book.id}><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-dark-gray">{book.date}</div><div className="text-sm text-gray-500">{book.time}</div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">{book.title}</td><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-dark-gray">{book.name}</div><div className="text-sm text-gray-500">{book.email}</div></td></tr>))}</tbody>
                    </table>
                 ) : ( // view === 'users'
                    users.length === 0 ? <p className="p-4 text-center">No users registered yet.</p> :
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered On</th></tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200">{users.map(user => (<tr key={user.id}><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-gray">{user.email}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.createdAt.toDate().toLocaleString()}</td></tr>))}</tbody>
                    </table>
                 )
                }
            </div>
        </div>
    );
};

const AuthPage = ({ title, handleSubmit, isLogin, setPage }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await handleSubmit(email, password);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center bg-light-gray p-4">
            <div className="w-full max-w-md">
                <form onSubmit={handleFormSubmit} className="bg-white shadow-2xl rounded-2xl px-8 pt-10 pb-10 mb-4">
                    <h2 className="text-3xl font-bold text-center text-dark-gray mb-8">{title}</h2>
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">{error}</p>}
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                        <input className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary" id="email" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="mb-8">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                        <input className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-primary" id="password" type="password" placeholder="******************" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="flex items-center justify-between">
                        <button className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors" type="submit" disabled={isLoading}>
                            {isLoading ? 'Processing...' : title}
                        </button>
                    </div>
                    <p className="text-center text-gray-500 text-sm mt-8">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button type="button" onClick={() => setPage(isLogin ? 'signup' : 'login')} className="font-bold text-primary hover:text-primary-hover">
                            {isLogin ? "Sign Up" : "Login"}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

const ProfilePage = ({ user, auth, setPage }) => {
    const handleLogout = async () => {
        try {
            await signOut(auth);
            setPage('home');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-dark-gray">Your Profile</h1>
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <p className="text-lg mb-4"><strong>Email:</strong> {user.email}</p>
                <button onClick={handleLogout} className="bg-red-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors">Logout</button>
            </div>
        </div>
    );
};

const ConfigWarningPage = () => (
    <div className="flex-grow flex items-center justify-center bg-light-gray p-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-lg shadow-md max-w-2xl w-full">
            <div className="flex"><div className="py-1"><AlertTriangle className="h-6 w-6 text-yellow-500 mr-4"/></div><div><p className="font-bold text-lg">Action Required: Add Firebase Configuration</p><p className="text-sm mt-2">This application cannot connect to the database because the Firebase configuration is missing.</p><ol className="list-decimal list-inside mt-4 text-left text-sm space-y-2"><li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-yellow-800">Firebase Console</a> and create a new project.</li><li>In your project, add a new Web App (click the <strong>&lt;/&gt;</strong> icon).</li><li>Firebase will give you a `firebaseConfig` object. Copy this entire object.</li><li>Open the `src/App.js` file in your code editor.</li><li>Paste your copied `firebaseConfig` object at the top of the file, replacing the placeholder.</li><li>Save the file. The app will automatically reload.</li></ol></div></div>
        </div>
    </div>
);


// --- Main App Component ---

function App() {
    const [page, setPageState] = useState('home');
    const [pageProps, setPageProps] = useState({});
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isConfigValid, setIsConfigValid] = useState(false);

    useEffect(() => {
        try {
            if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") { setIsConfigValid(false); return; }
            setIsConfigValid(true);
            const app = initializeApp(firebaseConfig);
            const firestoreDb = getFirestore(app);
            const firebaseAuth = getAuth(app);
            setDb(firestoreDb);
            setAuth(firebaseAuth);
            setLogLevel('debug');
        } catch (error) { setIsConfigValid(false); }
    }, []);
    
    useEffect(() => {
        if (!isConfigValid || !auth) return;
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, [auth, isConfigValid]);

    const setPage = useCallback((newPage, props = {}) => {
        setPageState(newPage);
        setPageProps(props);
    }, []);

    const handleSignup = async (email, password) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const appId = firebaseConfig.appId || 'default-app-id';
        const collectionPath = `/artifacts/${appId}/public/data/users`;
        await setDoc(doc(db, collectionPath, userCredential.user.uid), {
            email: userCredential.user.email,
            createdAt: new Date(),
        });
        setPage('home');
    };

    const handleLogin = async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
        setPage('home');
    };

    const renderPage = () => {
        if (!isConfigValid) return <ConfigWarningPage />;
        if (!isAuthReady) return <div className="flex-grow flex items-center justify-center"><p>Initializing...</p></div>;

        switch (page) {
            case 'home': return <HomePage setPage={setPage} />;
            case 'assignmentForm': return <AssignmentForm db={db} userId={user?.uid} setPage={setPage} {...pageProps} />;
            case 'dashboard': return user ? <AdminDashboard db={db} /> : <AuthPage title="Admin Login" handleSubmit={handleLogin} isLogin={true} setPage={setPage} />;
            case 'consultation': return <ConsultationBooking db={db} userId={user?.uid} setPage={setPage} {...pageProps} />;
            case 'profile': return user ? <ProfilePage user={user} auth={auth} setPage={setPage} /> : <AuthPage title="Login" handleSubmit={handleLogin} isLogin={true} setPage={setPage} />;
            case 'login': return <AuthPage title="Login" handleSubmit={handleLogin} isLogin={true} setPage={setPage} />;
            case 'signup': return <AuthPage title="Sign Up" handleSubmit={handleSignup} isLogin={false} setPage={setPage} />;
            default: return <HomePage setPage={setPage} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-light-gray font-sans">
            <Header setPage={setPage} user={user} auth={auth} />
            <main className="flex-grow flex flex-col">
                {renderPage()}
            </main>
            <footer className="bg-dark-gray text-white text-center p-6">
                <p>&copy; {new Date().getFullYear()} Edu-Hub. All Rights Reserved.</p>
            </footer>
        </div>
    );
}

export default App;
