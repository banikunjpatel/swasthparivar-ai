import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-r from-green-600 to-teal-600 rounded-xl text-white p-4 sm:p-6 md:p-8 mt-2">
                <p className="text-sm sm:text-base font-medium">
                    🌿 <strong>Prakriti Parivar</strong> — Natural Family Living
                </p>
                <p className="text-xs sm:text-sm text-green-100 mt-1">
                    Return to your Prakriti. Rooted in ancient wisdom, guided by nature.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
