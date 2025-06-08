import React, { useState, useRef, useEffect } from 'react';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import Loading from './Loading';
import AxiosToastError from '../utils/AxiosToastError';

const VoiceRecorder = ({ onUpload, onClose }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [uploading, setUploading] = useState(false);
    
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const intervalRef = useRef(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            intervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Unable to access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleUpload = async () => {
        if (!audioBlob) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('audio', audioBlob, 'voice-message.wav');

            const response = await Axios({
                url: summaryApi.uploadImage.url, // Using same endpoint for file uploads
                method: summaryApi.uploadImage.method,
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                onUpload(response.data.data.url);
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setUploading(false);
        }
    };

    const resetRecording = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-emerald-900">Voice Message</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Recording Status */}
                    <div className="text-center">
                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-2 ${
                            isRecording ? 'bg-red-100 animate-pulse' : 'bg-emerald-100'
                        }`}>
                            <svg className={`w-10 h-10 ${
                                isRecording ? 'text-red-500' : 'text-emerald-500'
                            }`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                            </svg>
                        </div>
                        
                        <div className="text-2xl font-mono text-emerald-700 mb-2">
                            {formatTime(recordingTime)}
                        </div>
                        
                        <p className="text-sm text-emerald-600">
                            {isRecording ? 'Recording...' : audioBlob ? 'Recording complete' : 'Ready to record'}
                        </p>
                    </div>

                    {/* Audio Playback */}
                    {audioUrl && (
                        <div className="border-2 border-emerald-200 rounded-lg p-4">
                            <audio
                                controls
                                src={audioUrl}
                                className="w-full"
                            />
                        </div>
                    )}

                    {/* Control Buttons */}
                    <div className="flex gap-2">
                        {!isRecording && !audioBlob && (
                            <button
                                onClick={startRecording}
                                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                </svg>
                                Start Recording
                            </button>
                        )}

                        {isRecording && (
                            <button
                                onClick={stopRecording}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                </svg>
                                Stop Recording
                            </button>
                        )}

                        {audioBlob && (
                            <>
                                <button
                                    onClick={resetRecording}
                                    className="flex-1 px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition"
                                >
                                    Record Again
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition flex items-center justify-center"
                                >
                                    {uploading ? <Loading /> : 'Send Voice'}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="text-xs text-emerald-500 text-center">
                        {!isRecording && !audioBlob && 'Click to start recording your voice message'}
                        {isRecording && 'Speak clearly into your microphone'}
                        {audioBlob && 'Play to review, then send or record again'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceRecorder;
