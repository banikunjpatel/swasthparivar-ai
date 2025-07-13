import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-r from-green-600 to-teal-600 rounded-xl text-white p-4 sm:p-6 md:p-8 mt-2">
                <p className="text-sm sm:text-base font-medium">
                    🤖 This is an <strong>AI-generated wellness app</strong>. If you have any health concerns, please consult your doctor.
                </p>
                <p className="text-xs sm:text-sm text-green-100">
                    The guidance provided here is based on Ayurvedic principles and personalized algorithms. It should not replace professional medical advice.
                </p>
                <p className="text-xs sm:text-sm text-green-100">
                    {/* For feedback or support, contact us at <a href="mailto:hello@swasthparivar.ai" className="underline hover:text-white">hello@swasthparivar.ai</a> */}
                </p>
            </div>
        </footer>
    );
};

export default Footer;
