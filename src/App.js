import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup
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
    getDoc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    listAll
} from 'firebase/storage';


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
const Download=(props)=>(<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>);
const GoogleIcon = (props) => (<svg viewBox="0 0 48 48" width="24px" height="24px" {...props}><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.596,44,31.023,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>);
const StarIcon = ({ className }) => (<svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>);

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
            setPage('home');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                <div className="cursor-pointer text-3xl font-extrabold text-dark-gray" onClick={() => setPage('home')}>Edu-<span className="text-primary">Hub</span></div>
                <div className="flex items-center space-x-2 md:space-x-4">
                    {user ? (
                        <>
                            <button onClick={() => setPage('userDashboard')} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors shadow-sm hover:shadow-md">My Dashboard</button>
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
        { title: "Research & Dissertation Help", icon: <GraduationCap className="w-12 h-12" style={{ color: '#f9a825' }}/>, page: 'assignmentForm', props: { isEmergency: false, title: "Research & Dissertation Help" }, description: "Comprehensive support for your research papers and dissertations." },
        { title: "Education Consultation", icon: <CalendarDays className="w-12 h-12" style={{ color: '#1a237e' }}/>, page: 'consultation', props: { title: "Book an Education Consultation"}, description: "Schedule a session with our expert consultants to plan your academic future." },
        { title: "Life Coaching", icon: <HeartHandshake className="w-12 h-12" style={{ color: '#ef4444' }}/>, page: 'consultation', props: { title: "Book a Life Coaching Session"}, description: "Guidance for university life and career paths. Free for students." },
        { title: "PhD Scholarship Guidance", icon: <Trophy className="w-12 h-12" style={{ color: '#f9a825' }}/>, page: 'consultation', props: { title: "Book PhD Scholarship Guidance"}, description: "Get expert advice and assistance in securing your PhD scholarship." },
    ];
    
    const reviews = [
        { name: "Sarah L.", text: "Edu-Hub was a lifesaver for my final year project. The guidance was clear, professional, and helped me get a grade I'm proud of!", rating: 5, image: "https://placehold.co/100x100/EFEFEF/333333?text=SL" },
        { name: "David M.", text: "The emergency help service is incredible. I got my assignment back in less than 24 hours and it was top-notch quality. Highly recommended.", rating: 5, image: "https://placehold.co/100x100/EFEFEF/333333?text=DM" },
        { name: "Jessica P.", text: "The consultation for my PhD application was invaluable. They helped me structure my proposal and gave me the confidence to apply.", rating: 5, image: "https://placehold.co/100x100/EFEFEF/333333?text=JP" },
    ];

    return (
        <div className="flex-grow bg-light-gray">
            <div className="text-center py-20 md:py-28 px-4 bg-white"><h1 className="text-4xl md:text-6xl font-extrabold text-dark-gray leading-tight">Your Academic Success Partner</h1><p className="text-lg text-gray-600 mt-6 max-w-3xl mx-auto">From complex assignments to life-changing decisions, we're here to guide you every step of the way.</p><button onClick={() => setPage('assignmentForm', { isEmergency: false, title: "Get Started" })} className="mt-10 bg-primary text-white font-bold text-lg py-3 px-10 rounded-full hover:bg-primary-hover transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">Get Help Now</button></div>
            <div className="container mx-auto px-6 py-20"><h2 className="text-3xl font-bold text-center text-dark-gray mb-12">Our Services</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{services.map(service => (<div key={service.title} onClick={() => setPage(service.page, service.props)} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col text-center items-center"><div className="bg-light-gray p-4 rounded-full mb-6">{service.icon}</div><h3 className="text-xl font-bold text-dark-gray mb-3">{service.title}</h3><p className="text-gray-600 flex-grow">{service.description}</p></div>))}</div></div>
            
            <div className="bg-white py-20">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-dark-gray mb-12">What Our Students Say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {reviews.map((review, index) => (
                            <div key={index} className="bg-light-gray p-8 rounded-xl shadow-md flex flex-col">
                                <div className="flex mb-4">
                                    {[...Array(review.rating)].map((_, i) => <StarIcon key={i} className="w-5 h-5 text-secondary" />)}
                                </div>
                                <p className="text-gray-600 italic mb-6 flex-grow">"{review.text}"</p>
                                <div className="flex items-center">
                                    <img src={review.image} alt={review.name} className="w-12 h-12 rounded-full mr-4" />
                                    <p className="font-bold text-dark-gray">{review.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AssignmentForm = ({ db, userId, setPage, isEmergency = false, title = "Submit Your Assignment" }) => {
    const [formData, setFormData] = useState({ subject: '', academicLevel: 'Diploma', deadline: '', message: '' });
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [modalInfo, setModalInfo] = useState({ children: null });
    const [deadlineError, setDeadlineError] = useState('');
    
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
        if (!file) { setModalInfo({ children: <p>Please upload your assignment file.</p> }); return; }
        setIsLoading(true);
        try {
            // NOTE: File upload to Firebase Storage would happen here in a real app.
            // We are only saving the metadata for this demonstration.
            const submissionData = { ...formData, serviceTitle: title, userId, isEmergency, fileName: file.name, fileSize: file.size, status: 'submitted', submittedAt: new Date() };
            await addDoc(collection(db, "submissions"), submissionData);
            setModalInfo({ children: <div><h3 className="text-xl font-bold mb-4 text-green-600">Submission Successful!</h3><p>Your assignment has been submitted. You can track its status in your dashboard.</p></div> });
            setFormData({ subject: '', academicLevel: 'Diploma', deadline: '', message: '' });
            setFile(null);
        } catch (error) {
            setModalInfo({ children: <p>There was an error submitting your form. Please try again.</p> });
        } finally { setIsLoading(false); }
    };

    return (
        <div className="bg-light-gray py-12 px-4">
            <Modal onClose={() => setModalInfo({ children: null })}>{modalInfo.children}</Modal>
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-8 md:p-12">
                <button onClick={() => setPage('userDashboard')} className="text-primary hover:underline mb-6 font-semibold">&larr; Back to Dashboard</button>
                <h2 className="text-3xl font-bold text-center text-dark-gray mb-2">{title}</h2>
                <p className="text-center text-gray-600 mb-8">Please provide the details for your request below.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input type="text" placeholder="Subject / Module" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"/>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Academic Level</label><select value={formData.academicLevel} onChange={(e) => setFormData({...formData, academicLevel: e.target.value})} required className="p-3 border border-gray-300 rounded-lg w-full bg-white focus:ring-2 focus:ring-primary focus:outline-none"><option>Diploma</option><option>HND</option><option>BSc</option><option>MSc</option><option>PhD</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label><input type="date" value={formData.deadline} onChange={handleDateChange} required min={getMinDeadline()} className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"/>{deadlineError && <p className="text-red-500 text-sm mt-1">{deadlineError}</p>}</div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label><textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} rows="4" placeholder="Any specific instructions or comments?" className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"></textarea></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Upload Assignment File (PDF/DOC)</label><label htmlFor="file-upload" className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"><UploadCloud className="w-10 h-10 text-gray-400"/><p className="mt-2 text-sm text-gray-600">{file ? file.name : 'Click to upload your file'}</p><p className="text-xs text-gray-500">PDF, DOC, DOCX</p></label><input id="file-upload" type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" accept=".pdf,.doc,.docx"/></div>
                    <button type="submit" disabled={isLoading || !!deadlineError} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-hover transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1">{isLoading ? 'Submitting...' : 'Submit Assignment'}</button>
                </form>
            </div>
        </div>
    );
};

const ConsultationBooking = ({ db, userId, setPage, title }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [modalContent, setModalContent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [bookingDetails, setBookingDetails] = useState({ name: '', email: '', phone: '', message: '' });

    const availableTimes = ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "07:00 PM"];

    useEffect(() => {
        if (!db || !selectedDate) return;
        const fetchBookedSlots = async () => {
            const q = query(collection(db, "bookings"), where("date", "==", selectedDate.toISOString().split('T')[0]));
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
            const docId = `${selectedDate.toISOString().split('T')[0]}_${selectedTime}`;
            await setDoc(doc(db, "bookings", docId), { title, date: selectedDate.toISOString().split('T')[0], time: selectedTime, ...bookingDetails, userId, bookedAt: new Date() });
            setBookedSlots([...bookedSlots, selectedTime]);
            setModalContent("success");
            setBookingDetails({ name: '', email: '', phone: '', message: '' });
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
            <div className="mt-8"><h3 className="font-semibold text-center mb-4">Available slots for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{availableTimes.map(time => { const isBooked = bookedSlots.includes(time); return (<button key={time} disabled={isBooked} onClick={() => handleTimeSelect(time)} className={`p-3 rounded-lg font-semibold transition-colors ${isBooked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-hover'}`}>{time}</button>); })}</div></div>
        );
    };

    const renderModalContent = () => {
        if (modalContent === "form") { return (<div><h3 className="text-xl font-bold mb-4">Confirm Your Booking</h3><p className="mb-4 text-gray-600">You are booking <span className="font-semibold text-dark-gray">{title}</span> on <span className="font-semibold text-dark-gray">{selectedDate.toLocaleDateString()}</span> at <span className="font-semibold text-dark-gray">{selectedTime}</span>.</p><form onSubmit={handleBookingSubmit} className="text-left space-y-4"><input type="text" placeholder="Full Name" required value={bookingDetails.name} onChange={e => setBookingDetails({...bookingDetails, name: e.target.value})} className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"/><input type="email" placeholder="Email Address" required value={bookingDetails.email} onChange={e => setBookingDetails({...bookingDetails, email: e.target.value})} className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"/><input type="tel" placeholder="Phone Number" required value={bookingDetails.phone} onChange={e => setBookingDetails({...bookingDetails, phone: e.target.value})} className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"/><textarea placeholder="Message (optional)" value={bookingDetails.message} onChange={e => setBookingDetails({...bookingDetails, message: e.target.value})} rows="3" className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"></textarea><button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-hover transition-colors disabled:bg-gray-400">{isLoading ? "Booking..." : "Confirm Booking"}</button></form></div>); }
        if (modalContent === "success") { return (<div><h3 className="text-xl font-bold mb-4 text-green-600">Booking Confirmed!</h3><p>Your consultation is booked. You will receive a confirmation email shortly.</p></div>); }
        if (modalContent === "error") { return (<div><h3 className="text-xl font-bold mb-4 text-red-600">Booking Failed</h3><p>Something went wrong. Please try again.</p></div>); }
        return null;
    };

    return (
        <div className="bg-light-gray py-12 px-4"><Modal onClose={() => setModalContent(null)}>{renderModalContent()}</Modal><div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8 md:p-12"><button onClick={() => setPage('home')} className="text-primary hover:underline mb-6 font-semibold">&larr; Back to services</button><h2 className="text-3xl font-bold text-center text-dark-gray mb-8">{title}</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-8">{renderCalendar()}{renderTimeSlots()}</div></div></div>
    );
};


const AdminDashboard = ({ db, storage }) => {
    const [view, setView] = useState('users');
    const [assignments, setAssignments] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('');
    const [uploadTargetUser, setUploadTargetUser] = useState(null);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (!db) return;
        setIsLoading(true);
        const collections = ['users', 'assignments', 'bookings'];
        const unsubscribes = collections.map(col => {
            const q = query(collection(db, col));
            return onSnapshot(q, (querySnapshot) => {
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (col === 'users') setUsers(data.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0)));
                if (col === 'assignments') setAssignments(data.sort((a, b) => (b.submittedAt?.toDate() || 0) - (a.submittedAt?.toDate() || 0)));
                if (col === 'bookings') setBookings(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
            });
        });
        setIsLoading(false);
        return () => unsubscribes.forEach(unsub => unsub());
    }, [db]);

    const handleFileUpload = () => {
        if (!fileToUpload || !uploadTargetUser) return;
        const storageRef = ref(storage, `user-documents/${uploadTargetUser.id}/${fileToUpload.name}`);
        const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            }, 
            (error) => {
                console.error("Upload failed:", error);
                setUploadTargetUser(null);
                setUploadProgress(0);
            }, 
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    setUploadTargetUser(null);
                    setFileToUpload(null);
                    setUploadProgress(0);
                });
            }
        );
    };

    const downloadCSV = (data, filename) => {
        if (data.length === 0) return;
        const headers = Object.keys(data[0]).filter(h => h !== 'userId' && h !== 'bookedAt' && h !== 'submittedAt');
        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredBookings = filterDate ? bookings.filter(b => b.date === filterDate) : bookings;

    return (
        <div className="container mx-auto p-6">
            <Modal onClose={() => setUploadTargetUser(null)}>
                {uploadTargetUser && (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Upload Document for {uploadTargetUser.email}</h3>
                        <input type="file" onChange={(e) => setFileToUpload(e.target.files[0])} className="mb-4 w-full border p-2 rounded-lg" />
                        {uploadProgress > 0 && <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4"><div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div></div>}
                        <button onClick={handleFileUpload} disabled={!fileToUpload} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover disabled:bg-gray-400">Upload</button>
                    </div>
                )}
            </Modal>
            <h1 className="text-3xl font-bold mb-6 text-dark-gray">Admin Dashboard</h1>
            <div className="flex border-b mb-6">
                <button onClick={() => setView('users')} className={`py-2 px-4 font-semibold ${view === 'users' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Users ({users.length})</button>
                <button onClick={() => setView('assignments')} className={`py-2 px-4 font-semibold ${view === 'assignments' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Submissions ({assignments.length})</button>
                <button onClick={() => setView('bookings')} className={`py-2 px-4 font-semibold ${view === 'bookings' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Bookings ({bookings.length})</button>
            </div>
            {view === 'bookings' && (
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <label htmlFor="filterDate" className="mr-2 font-semibold">Filter by date:</label>
                        <input type="date" id="filterDate" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="p-2 border rounded-lg"/>
                    </div>
                    <button onClick={() => downloadCSV(filteredBookings, 'bookings')} className="bg-secondary hover:bg-secondary-hover text-white font-semibold py-2 px-4 rounded-lg flex items-center"><Download className="mr-2 h-5 w-5"/>Download CSV</button>
                </div>
            )}
             {view === 'assignments' && (
                <div className="flex justify-end items-center mb-4">
                    <button onClick={() => downloadCSV(assignments, 'assignments')} className="bg-secondary hover:bg-secondary-hover text-white font-semibold py-2 px-4 rounded-lg flex items-center"><Download className="mr-2 h-5 w-5"/>Download CSV</button>
                </div>
            )}
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                {isLoading ? ( <p className="p-4 text-center">Loading...</p> ) : 
                 view === 'users' ? (
                    users.length === 0 ? <p className="p-4 text-center">No users registered yet.</p> :
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered On</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200">{users.map(user => (<tr key={user.id}><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-gray">{user.email}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.createdAt?.toDate().toLocaleString() || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><button onClick={() => setUploadTargetUser(user)} className="text-primary hover:underline">Upload Doc</button></td></tr>))}</tbody>
                    </table>
                 ) : view === 'assignments' ? (
                    assignments.length === 0 ? <p className="p-4 text-center">No assignments submitted yet.</p> :
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th></tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200">{assignments.map(job => (<tr key={job.id}><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-dark-gray">{job.serviceTitle}</div>{job.isEmergency && <span className='text-xs text-red-600 font-bold'>EMERGENCY</span>}</td><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-dark-gray">{job.name || 'N/A'}</div><div className="text-sm text-gray-500">{job.email}</div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">{job.subject}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.deadline}</td></tr>))}</tbody>
                    </table>
                 ) : ( // view === 'bookings'
                    filteredBookings.length === 0 ? <p className="p-4 text-center">No bookings for the selected date.</p> :
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th></tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200">{filteredBookings.map(book => (<tr key={book.id}><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-dark-gray">{book.date}</div><div className="text-sm text-gray-500">{book.time}</div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">{book.title}</td><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-dark-gray">{book.name}</div><div className="text-sm text-gray-500">{book.email}</div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.phone}</td></tr>))}</tbody>
                    </table>
                 )
                }
            </div>
        </div>
    );
};

const AuthPage = ({ title, handleSubmit, handleGoogleSignIn, isLogin, setPage }) => {
    const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [isLoading, setIsLoading] = useState(false);
    
    const handleFormSubmit = async (e) => {
        e.preventDefault(); setError(''); setIsLoading(true);
        try { await handleSubmit(email, password); } 
        catch (err) { setError(err.message.replace('Firebase: ', '')); } 
        finally { setIsLoading(false); }
    };

    return (
        <div className="flex-grow flex items-center justify-center bg-light-gray p-4">
            <div className="w-full max-w-md"><form onSubmit={handleFormSubmit} className="bg-white shadow-2xl rounded-2xl px-8 pt-10 pb-10 mb-4"><h2 className="text-3xl font-bold text-center text-dark-gray mb-8">{title}</h2>{error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">{error}</p>}<div className="mb-6"><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label><input className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary" id="email" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div><div className="mb-8"><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label><input className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-primary" id="password" type="password" placeholder="******************" value={password} onChange={(e) => setPassword(e.target.value)} /></div><div className="flex flex-col items-center justify-between space-y-4"><button className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors" type="submit" disabled={isLoading}>{isLoading ? 'Processing...' : title}</button><div className="relative w-full text-center my-4"><span className="absolute top-1/2 left-0 w-full h-px bg-gray-300"></span><span className="relative bg-white px-2 text-sm text-gray-500">OR</span></div><button onClick={handleGoogleSignIn} type="button" className="w-full bg-white hover:bg-gray-100 text-dark-gray font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm flex items-center justify-center"><GoogleIcon className="mr-2"/> Sign in with Google</button></div><p className="text-center text-gray-500 text-sm mt-8">{isLogin ? "Don't have an account? " : "Already have an account? "}<button type="button" onClick={() => setPage(isLogin ? 'signup' : 'login')} className="font-bold text-primary hover:text-primary-hover">{isLogin ? "Sign Up" : "Login"}</button></p></form></div>
        </div>
    );
};

const UserDashboard = ({ user, db, storage, setPage }) => {
    const [profile, setProfile] = useState({ name: '', phone: '' });
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            // Fetch profile
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                setProfile(docSnap.data());
            }

            // Fetch documents
            const docsListRef = ref(storage, `user-documents/${user.uid}`);
            const res = await listAll(docsListRef);
            const userDocs = await Promise.all(res.items.map(async (itemRef) => {
                const url = await getDownloadURL(itemRef);
                return { name: itemRef.name, url };
            }));
            setDocuments(userDocs);

            setIsLoading(false);
        };
        fetchUserData();
    }, [db, user.uid, storage]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        const userDocRef = doc(db, "users", user.uid);
        try {
            await updateDoc(userDocRef, profile);
            setMessage('Profile updated successfully!');
        } catch (error) {
            setMessage('Error updating profile.');
            console.error(error);
        }
    };

    if (isLoading) return <div className="flex-grow flex items-center justify-center"><p>Loading Dashboard...</p></div>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-dark-gray">Welcome, {profile.name || user.email}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
                        <h2 className="text-2xl font-bold mb-4">My Dashboard</h2>
                        <p>This is your personal space. Here you can submit new assignments, view your booking history, and download completed work.</p>
                        <button onClick={() => setPage('assignmentForm')} className="mt-4 bg-secondary text-white font-bold py-2 px-6 rounded-lg hover:bg-secondary-hover">Submit New Assignment</button>
                    </div>
                     <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">My Documents</h2>
                        {documents.length > 0 ? (
                            <ul className="space-y-3">
                                {documents.map((doc, index) => (
                                    <li key={index} className="flex justify-between items-center p-3 bg-light-gray rounded-lg">
                                        <span className="text-dark-gray">{doc.name}</span>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="bg-primary text-white font-semibold py-1 px-3 rounded-lg hover:bg-primary-hover">Download</a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">Documents uploaded by the admin will appear here.</p>
                        )}
                    </div>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} className="mt-1 p-2 border border-gray-300 rounded-md w-full"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input type="tel" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className="mt-1 p-2 border border-gray-300 rounded-md w-full"/>
                        </div>
                        <button type="submit" className="w-full bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-hover">Save Changes</button>
                        {message && <p className="text-green-600 mt-2">{message}</p>}
                    </form>
                </div>
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
    const [storage, setStorage] = useState(null);
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isConfigValid, setIsConfigValid] = useState(false);

    useEffect(() => {
        try {
            if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") { setIsConfigValid(false); return; }
            setIsConfigValid(true);
            const app = initializeApp(firebaseConfig);
            const firestoreDb = getFirestore(app);
            const firebaseAuth = getAuth(app);
            const firebaseStorage = getStorage(app);
            setDb(firestoreDb);
            setAuth(firebaseAuth);
            setStorage(firebaseStorage);
        } catch (error) { setIsConfigValid(false); }
    }, []);
    
    useEffect(() => {
        if (!isConfigValid || !auth) return;
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await createUserProfile(user); // Ensure profile exists on every auth change
                const userDocRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                }
            } else {
                setUserData(null);
            }
            setUser(user);
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, [auth, isConfigValid, db]);

    const setPage = useCallback((newPage, props = {}) => {
        setPageState(newPage);
        setPageProps(props);
    }, []);

    const createUserProfile = async (user) => {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) {
            await setDoc(userDocRef, {
                email: user.email,
                name: user.displayName || '',
                createdAt: new Date(),
                isAdmin: false // Default role
            });
        }
    };

    const handleSignup = async (email, password) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(userCredential.user);
        setPage('userDashboard');
    };

    const handleLogin = async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
        setPage('userDashboard');
    };
    
    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await createUserProfile(result.user);
            setPage('userDashboard');
        } catch (error) {
            console.error("Google sign-in error", error);
        }
    };

    const renderPage = () => {
        if (!isConfigValid) return <ConfigWarningPage />;
        if (!isAuthReady) return <div className="flex-grow flex items-center justify-center"><p>Initializing...</p></div>;

        switch (page) {
            case 'home': return <HomePage setPage={setPage} />;
            case 'assignmentForm': return user ? <AssignmentForm db={db} userId={user?.uid} setPage={setPage} {...pageProps} /> : <AuthPage title="Login to Submit" handleSubmit={handleLogin} handleGoogleSignIn={handleGoogleSignIn} isLogin={true} setPage={setPage} />;
            case 'consultation': return user ? <ConsultationBooking db={db} userId={user?.uid} setPage={setPage} {...pageProps} /> : <AuthPage title="Login to Book" handleSubmit={handleLogin} handleGoogleSignIn={handleGoogleSignIn} isLogin={true} setPage={setPage} />;
            case 'dashboard': return userData?.isAdmin ? <AdminDashboard db={db} storage={storage} /> : <UserDashboard user={user} db={db} storage={storage} setPage={setPage} />;
            case 'userDashboard': return user ? <UserDashboard user={user} db={db} storage={storage} setPage={setPage} /> : <AuthPage title="Login" handleSubmit={handleLogin} handleGoogleSignIn={handleGoogleSignIn} isLogin={true} setPage={setPage} />;
            case 'profile': return user ? <UserDashboard user={user} db={db} storage={storage} setPage={setPage} /> : <AuthPage title="Login" handleSubmit={handleLogin} handleGoogleSignIn={handleGoogleSignIn} isLogin={true} setPage={setPage} />;
            case 'login': return <AuthPage title="Login" handleSubmit={handleLogin} handleGoogleSignIn={handleGoogleSignIn} isLogin={true} setPage={setPage} />;
            case 'signup': return <AuthPage title="Sign Up" handleSubmit={handleSignup} handleGoogleSignIn={handleGoogleSignIn} isLogin={false} setPage={setPage} />;
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
