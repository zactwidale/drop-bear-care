import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow, A11y } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import Image from 'next/image';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

interface PhotosDisplayProps {
  photos: string[];
}

const PhotosDisplay: React.FC<PhotosDisplayProps> = ({ photos }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  return (
    <Box sx={{ height: 300, maxWidth: 300, margin: 'auto' }}>
      <Swiper
        modules={[Navigation, Pagination, EffectCoverflow, A11y]}
        spaceBetween={30}
        slidesPerView={1}
        centeredSlides
        loop
        navigation
        pagination={{ clickable: true }}
        effect={'coverflow'}
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        onSlideChange={(swiper: SwiperType) =>
          setCurrentPhotoIndex(swiper.realIndex)
        }
        a11y={{
          prevSlideMessage: 'Previous photo',
          nextSlideMessage: 'Next photo',
          firstSlideMessage: 'This is the first photo',
          lastSlideMessage: 'This is the last photo',
        }}
        className='mySwiper'
      >
        {photos.map((photo, index) => (
          <SwiperSlide key={photo}>
            <Box sx={{ position: 'relative', width: '100%', height: '280px' }}>
              <Image
                src={photo}
                alt={`User photo ${index + 1}`}
                fill
                priority={index === 0}
                style={{ maxWidth: '100%', objectFit: 'contain' }}
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default PhotosDisplay;
