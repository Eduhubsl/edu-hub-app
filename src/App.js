import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, setLogLevel } from 'firebase/firestore';

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

const BookOpen = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);
const Zap = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2z"/></svg>
);
const CalendarDays = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
const HeartHandshake = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.82 2.94 0l.06-.06L12 11l2.96-2.96a2.17 2.17 0 0 1 2.94 0v0c.82.82.82 2.13 0 3.08L12 14Z"/></svg>
);
const GraduationCap = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.084a1 1 0 0 0 0 1.838l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12v5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-5"/></svg>
);
const Trophy = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);
const UploadCloud = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
);
const Mic = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);
const StopCircle = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><rect width="6" height="6" x="9" y="9"/></svg>
);
const Trash2 = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);
const AlertTriangle = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
);

// --- Reusable UI Components ---

const Modal = ({ message, onClose }) => {
    if (!message) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 font-sans">
            <div className="bg-white rounded-lg shadow-xl p-8 w-11/12 max-w-md text-center">
                <p className="text-lg text-dark-gray mb-6">{message}</p>
                <button
                    onClick={onClose}
                    className="bg-primary text-white font-bold py-2 px-8 rounded-lg hover:bg-primary-hover transition-all duration-300 shadow-md hover:shadow-lg"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

// --- Main Application Components ---

const Header = ({ setPage, userId }) => (
    <header className="bg-white shadow-sm sticky top-0 z-40">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
            <div 
                className="cursor-pointer"
                onClick={() => setPage('home')}
            >
                <img 
                    src="https://i.imgur.com/xQ9gJg3.png" 
                    alt="Edu-Hub Logo" 
                    className="h-12 md:h-14"
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/200x50/1a237e/FFFFFF?text=Edu-Hub'; }}
                />
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
                {userId && (
                    <button onClick={() => setPage('dashboard')} className="hidden sm:block bg-gray-200 text-dark-gray font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Dashboard</button>
                )}
                <button onClick={() => setPage('profile')} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors shadow-sm hover:shadow-md">Profile</button>
            </div>
        </nav>
    </header>
);

const HomePage = ({ setPage }) => {
    // This is the only part that has changed.
    // We are now using inline styles to set the color, which is guaranteed to work.
    const services = [
        { title: "Standard Assignment Help", icon: <BookOpen className="w-12 h-12" style={{ color: '#1a237e' }}/>, page: 'assignmentForm', props: { isEmergency: false, title: "Standard Assignment Help" }, description: "Expert help with your assignments. Standard delivery with a minimum 5-day deadline." },
        { title: "Emergency Assignment Help", icon: <Zap className="w-12 h-12" style={{ color: '#ef4444' }}/>, page: 'assignmentForm', props: { isEmergency: true, title: "Emergency Assignment Help" }, description: "Urgent deadline? Our emergency service delivers within 48 hours. Subject to review." },
        { title: "Research & Dissertation Help", icon: <GraduationCap className="w-12 h-12" style={{ color: '#f9a825' }}/>, page: 'assignmentForm', props: { isEmergency: false, title: "Research & Dissertation Help" }, description: "Comprehensive support for your research papers and dissertations, from proposal to final submission." },
        { title: "Education Consultation", icon: <CalendarDays className="w-12 h-12" style={{ color: '#1a237e' }}/>, page: 'consultation', description: "Schedule a session with our expert consultants to plan your academic future." },
        { title: "Life Coaching", icon: <HeartHandshake className="w-12 h-12" style={{ color: '#ef4444' }}/>, page: 'coaching', description: "Guidance for university life and career paths. Free for students." },
        { title: "PhD Scholarship Guidance", icon: <Trophy className="w-12 h-12" style={{ color: '#f9a825' }}/>, page: 'phdGuidance', description: "Get expert advice and assistance in securing your PhD scholarship." },
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

const AssignmentForm = ({ db, userId, setPage, isEmergency = false, title = "Submit Your Assignment" }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', whatsapp: '', subject: '', academicLevel: 'Diploma', deadline: '',
    });
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
        setAudioURL('');
        setAudioBlob(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const audioChunks = [];
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };
            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                const url = URL.createObjectURL(blob);
                setAudioURL(url);
            };
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setModalInfo({ message: 'Could not access microphone. Please check your browser permissions.' });
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const resetRecording = () => {
        setAudioURL('');
        setAudioBlob(null);
    };

    const getMinDeadline = () => {
        const today = new Date();
        if (isEmergency) {
            today.setDate(today.getDate() + 2);
        } else {
            today.setDate(today.getDate() + 5);
        }
        return today.toISOString().split('T')[0];
    };

    const handleDateChange = (e) => {
        const selectedDate = new Date(e.target.value);
        const minDeadlineDate = new Date(getMinDeadline());
        selectedDate.setHours(0, 0, 0, 0);
        minDeadlineDate.setHours(0, 0, 0, 0);
        if (!isEmergency && selectedDate < minDeadlineDate) {
            setDeadlineError('Deadline must be at least 5 days from now.');
        } else if (isEmergency && selectedDate < minDeadlineDate) {
            setDeadlineError('Emergency deadline must be at least 48 hours from now.');
        } else {
            setDeadlineError('');
        }
        setFormData({ ...formData, deadline: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (deadlineError) { setModalInfo({ message: deadlineError }); return; }
        if (!file) { setModalInfo({ message: 'Please upload your assignment brief.' }); return; }
        if (descriptionMode === 'text' && !textDescription.trim()) { setModalInfo({ message: 'Please provide a written description.' }); return; }
        if (descriptionMode === 'audio' && !audioBlob) { setModalInfo({ message: 'Please record a voice note.' }); return; }
        
        setIsLoading(true);

        try {
            const collectionPath = `submissions`;
            
            const submissionData = {
                ...formData,
                serviceTitle: title,
                userId,
                isEmergency,
                fileName: file.name,
                fileSize: file.size,
                descriptionType: descriptionMode,
                description: descriptionMode === 'text' ? textDescription : 'Audio Note Recorded',
                hasAudioNote: descriptionMode === 'audio' && !!audioBlob,
                status: 'submitted',
                submittedAt: new Date(),
            };

            await addDoc(collection(db, collectionPath), submissionData);

            setModalInfo({ message: 'Your request has been submitted successfully! We will contact you shortly.' });
            setFormData({ name: '', email: '', whatsapp: '', subject: '', academicLevel: 'Diploma', deadline: '' });
            setFile(null);
            setTextDescription('');
            resetRecording();

        } catch (error) {
            console.error("Error submitting assignment: ", error);
            setModalInfo({ message: 'There was an error submitting your form. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => { e.target.files[0] && setFile(e.target.files[0]); };

    return (
        <div className="bg-light-gray py-12 px-4">
            <Modal message={modalInfo.message} onClose={() => setModalInfo({ message: '' })} />
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-8 md:p-12">
                <button onClick={() => setPage('home')} className="text-primary hover:underline mb-6 font-semibold">&larr; Back to services</button>
                <h2 className="text-3xl font-bold text-center text-dark-gray mb-2">{title}</h2>
                <p className="text-center text-gray-600 mb-8">Please provide the details for your request below.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"/>
                        <input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input type="tel" placeholder="WhatsApp Number" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} required className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"/>
                        <input type="text" placeholder="Subject / Module" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Academic Level</label>
                        <select value={formData.academicLevel} onChange={(e) => setFormData({...formData, academicLevel: e.target.value})} required className="p-3 border border-gray-300 rounded-lg w-full bg-white focus:ring-2 focus:ring-primary focus:outline-none">
                            <option>Diploma</option><option>HND</option><option>BSc</option><option>MSc</option><option>PhD</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                        <input type="date" value={formData.deadline} onChange={handleDateChange} required min={getMinDeadline()} className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"/>
                        {deadlineError && <p className="text-red-500 text-sm mt-1">{deadlineError}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Describe Your Requirements</label>
                        <div className="flex border border-gray-300 rounded-lg p-1 bg-gray-100">
                            <button type="button" onClick={() => setDescriptionMode('text')} className={`w-1/2 py-2 rounded-md transition-colors font-medium ${descriptionMode === 'text' ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>Written</button>
                            <button type="button" onClick={() => setDescriptionMode('audio')} className={`w-1/2 py-2 rounded-md transition-colors font-medium ${descriptionMode === 'audio' ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>Voice Note</button>
                        </div>
                        <div className="mt-4">
                            {descriptionMode === 'text' ? (
                                <textarea
                                    value={textDescription}
                                    onChange={(e) => setTextDescription(e.target.value)}
                                    rows="4"
                                    placeholder="Please describe what you need help with..."
                                    className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"
                                ></textarea>
                            ) : (
                                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
                                    {!isRecording && !audioURL && (
                                        <button type="button" onClick={handleStartRecording} className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
                                            <Mic className="w-5 h-5 mr-2"/> Start Recording
                                        </button>
                                    )}
                                    {isRecording && (
                                        <button type="button" onClick={handleStopRecording} className="inline-flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 animate-pulse font-semibold">
                                            <StopCircle className="w-5 h-5 mr-2"/> Stop Recording
                                        </button>
                                    )}
                                    {audioURL && !isRecording && (
                                        <div className="space-y-3">
                                            <p className="text-sm text-gray-600">Recording complete. You can play it back before submitting.</p>
                                            <audio src={audioURL} controls className="w-full"></audio>
                                            <button type="button" onClick={resetRecording} className="inline-flex items-center text-red-600 hover:text-red-800 font-semibold">
                                                <Trash2 className="w-4 h-4 mr-1"/> Record Again
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Assignment Brief/Guidelines</label>
                        <label htmlFor="file-upload" className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <UploadCloud className="w-10 h-10 text-gray-400"/>
                            <p className="mt-2 text-sm text-gray-600">{file ? file.name : 'Click to upload a file'}</p>
                            <p className="text-xs text-gray-500">PDF, DOCX, PPTX, TXT (MAX. 10MB)</p>
                        </label>
                        <input id="file-upload" type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.pptx,.txt"/>
                    </div>
                    <button type="submit" disabled={isLoading || !!deadlineError} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-hover transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1">
                        {isLoading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const AdminDashboard = ({ db }) => {
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!db) return;
        
        const collectionPath = `submissions`;
        const q = query(collection(db, collectionPath));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const assignmentsData = [];
            querySnapshot.forEach((doc) => {
                assignmentsData.push({ id: doc.id, ...doc.data() });
            });
            assignmentsData.sort((a, b) => b.submittedAt.toDate() - a.submittedAt.toDate());
            setAssignments(assignmentsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching assignments: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [db]);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-dark-gray">Admin Dashboard</h1>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                {isLoading ? ( <p className="p-4 text-center">Loading submissions...</p> ) : 
                 assignments.length === 0 ? ( <p className="p-4 text-center">No assignments submitted yet.</p> ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {assignments.map(job => (
                                <tr key={job.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-dark-gray">{job.serviceTitle}</div>
                                        {job.isEmergency && <span className='text-xs text-red-600 font-bold'>EMERGENCY</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-dark-gray">{job.name}</div>
                                        <div className="text-sm text-gray-500">{job.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">{job.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {job.descriptionType === 'audio' ? 'Voice Note' : 'Written'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.deadline}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const PlaceholderPage = ({ title, message, setPage }) => (
    <div className="flex-grow flex flex-col items-center justify-center text-center bg-light-gray p-6">
        <h2 className="text-3xl font-bold text-dark-gray">{title}</h2>
        <p className="mt-4 text-gray-600 max-w-md">{message}</p>
        <button onClick={() => setPage('home')} className="mt-8 bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-hover transition-colors shadow-md hover:shadow-lg">
            Back to Home
        </button>
    </div>
);

const ConfigWarningPage = () => (
    <div className="flex-grow flex items-center justify-center bg-light-gray p-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-lg shadow-md max-w-2xl w-full">
            <div className="flex">
                <div className="py-1"><AlertTriangle className="h-6 w-6 text-yellow-500 mr-4"/></div>
                <div>
                    <p className="font-bold text-lg">Action Required: Add Firebase Configuration</p>
                    <p className="text-sm mt-2">This application cannot connect to the database because the Firebase configuration is missing.</p>
                    <ol className="list-decimal list-inside mt-4 text-left text-sm space-y-2">
                        <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-yellow-800">Firebase Console</a> and create a new project.</li>
                        <li>In your project, add a new Web App (click the <strong>&lt;/&gt;</strong> icon).</li>
                        <li>Firebase will give you a `firebaseConfig` object. Copy this entire object.</li>
                        <li>Open the `src/App.js` file in your code editor.</li>
                        <li>Paste your copied `firebaseConfig` object at the top of the file, replacing the placeholder.</li>
                        <li>Save the file. The app will automatically reload.</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>
);


// --- Main App Component ---

export default function App() {
    const [page, setPageState] = useState('home');
    const [pageProps, setPageProps] = useState({});
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isConfigValid, setIsConfigValid] = useState(false);

    useEffect(() => {
        try {
            if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
                console.error("Firebase config is missing or incomplete. Please paste your config object at the top of App.js");
                setIsConfigValid(false);
                return;
            }
            setIsConfigValid(true);
            const app = initializeApp(firebaseConfig);
            const firestoreDb = getFirestore(app);
            const firebaseAuth = getAuth(app);
            setDb(firestoreDb);
            setAuth(firebaseAuth);
            setLogLevel('debug');
        } catch (error) { 
            console.error("Firebase initialization error:", error);
            setIsConfigValid(false);
        }
    }, []);
    
    useEffect(() => {
        if (!isConfigValid || !auth) return;
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                signInAnonymously(auth).catch((error) => {
                    console.error("Failed to sign in anonymously:", error);
                });
            }
            setIsAuthReady(true);
        });

        return () => unsubscribe();
    }, [auth, isConfigValid]);

    const setPage = useCallback((newPage, props = {}) => {
        setPageState(newPage);
        setPageProps(props);
    }, []);

    const renderPage = () => {
        if (!isConfigValid) {
            return <ConfigWarningPage />;
        }
        if (!isAuthReady) {
            return <div className="flex-grow flex items-center justify-center"><p>Initializing...</p></div>;
        }
        switch (page) {
            case 'home':
                return <HomePage setPage={setPage} />;
            case 'assignmentForm':
                return <AssignmentForm db={db} userId={userId} setPage={setPage} {...pageProps} />;
            case 'dashboard':
                 return <AdminDashboard db={db} />;
            case 'consultation':
                return <PlaceholderPage title="Education Consultation" message="Our booking system is coming soon! Check back later to schedule an appointment." setPage={setPage} />;
            case 'coaching':
                return <PlaceholderPage title="Life Coaching" message="Our booking system is coming soon! Check back later to schedule an appointment." setPage={setPage} />;
            case 'phdGuidance':
                return <PlaceholderPage title="PhD Scholarship Guidance" message="Our specialists are ready to help. The booking system will be available here shortly." setPage={setPage} />;
            case 'profile':
                return <PlaceholderPage title="Your Profile" message={`Your user ID is: ${userId}. Full profile features, including your submission history, will be available here soon.`} setPage={setPage} />;
            default:
                return <HomePage setPage={setPage} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-light-gray font-sans">
            <Header setPage={setPage} userId={userId} />
            <main className="flex-grow flex flex-col">
                {renderPage()}
            </main>
            <footer className="bg-dark-gray text-white text-center p-6">
                <p>&copy; {new Date().getFullYear()} Edu-Hub. All Rights Reserved.</p>
            </footer>
        </div>
    )