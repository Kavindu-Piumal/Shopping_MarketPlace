import React, { useState } from 'react';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';

import Loading from './Loading';
import AxiosToastError from '../utils/AxiosToastError';

const ImageUpload = ({ onUpload, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setSelectedFile(file);
                const reader = new FileReader();
                reader.onload = (e) => setPreview(e.target.result);
                reader.readAsDataURL(file);
            } else {
                alert('Please select an image file');
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('image', selectedFile);

            const response = await Axios({
                url: summaryApi.uploadImage.url,
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-emerald-900">Share Image</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {preview ? (
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-emerald-200 rounded-lg p-4">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full max-h-64 object-contain rounded-lg"
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setSelectedFile(null);
                                    setPreview(null);
                                }}
                                className="flex-1 px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition"
                            >
                                Choose Different
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition"
                            >
                                {uploading ? <Loading /> : 'Send Image'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-emerald-200 rounded-lg p-8 text-center">
                            <svg className="w-12 h-12 mx-auto text-emerald-300 mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-emerald-600 mb-2">Click to select an image</p>
                            <p className="text-sm text-emerald-500">Supports JPG, PNG, GIF</p>
                        </div>
                        
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUpload;
