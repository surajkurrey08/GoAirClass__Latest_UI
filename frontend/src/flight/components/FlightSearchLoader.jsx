import React, { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function FlightSearchLoader() {
    const [lottieError, setLottieError] = useState(false);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-md select-none pointer-events-auto">
            <div className="w-[320px] sm:w-[450px] md:w-[550px] aspect-square flex items-center justify-center">
                {!lottieError ? (
                    <DotLottieReact
                        src="https://lottie.host/0f8f7e54-af91-4dd1-8b67-6d024ee2cbc6/Z7at8KFAlS.lottie"
                        loop
                        autoplay
                        onError={() => setLottieError(true)}
                        style={{ width: '100%', height: '100%' }}
                    />
                ) : (
                    <iframe
                        src="https://lottie.host/embed/0f8f7e54-af91-4dd1-8b67-6d024ee2cbc6/Z7at8KFAlS.lottie"
                        className="w-full h-full border-0 pointer-events-none"
                        title="Flight Search Animation"
                    />
                )}
            </div>
        </div>
    );
}
