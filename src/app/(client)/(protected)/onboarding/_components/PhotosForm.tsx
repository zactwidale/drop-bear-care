import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Formik, Form, FormikProps, type FormikErrors } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Snackbar,
  SnackbarContent,
  Avatar,
  ButtonBase,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthProvider';
import { getNextOnboardingStage } from '@/types/onboarding';
import InfoModal from '@/components/InfoModal';
import Image from 'next/image';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow, A11y } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import { moderateImage, ModerationResult } from '@/services/moderationService';
import DBCMarkdown from '@/components/DBCMarkdown';
import { compressAndUploadImage } from '@/utils/imageCompression';
import { styled } from '@mui/material/styles';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import ResponsiveAvatar from '@/components/ResponsiveAvatar';

const StyledSwiperWrapper = styled(Box)(({ theme }) => ({
  '& .mySwiper': {
    paddingBottom: 20,
  },
  '& .mySwiper .swiper-pagination': {
    bottom: '0 !important',
  },
  '& .mySwiper .swiper-pagination-bullet': {
    width: 8,
    height: 8,
    margin: '0 4px',
  },
}));

interface PhotosFormValues {
  photos: string[];
}

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const validationSchema = Yup.object().shape({
  photos: Yup.array()
    .of(Yup.string())
    .max(MAX_PHOTOS, `You can upload a maximum of ${MAX_PHOTOS} photos`),
});

interface PhotosFormProps {
  onSubmit: () => void;
  disabled?: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

export interface PhotosFormRef {
  submitForm: () => Promise<void>;
}

const PhotosForm = forwardRef<PhotosFormRef, PhotosFormProps>(
  ({ onSubmit, disabled = false, setIsProcessing }, ref) => {
    const { userData, updateUserData } = useAuth();
    const formikRef = useRef<FormikProps<PhotosFormValues>>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isModerating, setIsModerating] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [errorModalContent, setErrorModalContent] = useState('');
    const [localPhotos, setLocalPhotos] = useState<(File | string)[]>([]);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [localAvatarURL, setLocalAvatarURL] = useState<string | undefined>(
      undefined
    );

    useEffect(() => {
      if (userData) {
        setLocalPhotos(userData.photoURLs || []);
        setLocalAvatarURL(userData.photoURL || undefined);
        formikRef.current?.setFieldValue('photos', userData.photoURLs || []);
      }
    }, [userData]);

    useEffect(() => {
      setIsProcessing(isModerating || isUploading);
    }, [isModerating, isUploading, setIsProcessing]);

    const handleSetAvatar = () => {
      const currentPhoto = localPhotos[currentPhotoIndex];
      if (currentPhoto && typeof currentPhoto === 'string') {
        setLocalAvatarURL(currentPhoto);
      }
    };

    useImperativeHandle(ref, () => ({
      submitForm: async () => {
        if (formikRef.current) {
          setHasSubmitted(true);
          await formikRef.current.submitForm();
        }
      },
    }));

    const uploadToFirebase = async (file: File): Promise<string> => {
      const storage = getStorage();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const fileRef = storageRef(
        storage,
        `user-photos/${userData!.uid}/${fileName}`
      );

      await uploadBytes(fileRef, file);
      return getDownloadURL(fileRef);
    };

    const deleteUnusedPhotos = async (
      currentPhotoURLs: string[],
      avatarURL: string | undefined
    ): Promise<{ validPhotoURLs: string[]; avatarURL: string | undefined }> => {
      const storage = getStorage();
      const userPhotosRef = storageRef(storage, `user-photos/${userData!.uid}`);

      const allPhotos = await listAll(userPhotosRef);
      const storageURLs = await Promise.all(
        allPhotos.items.map(getDownloadURL)
      );

      // Filter out any URLs that are not in Firebase Storage
      let validPhotoURLs = currentPhotoURLs.filter((url) =>
        storageURLs.includes(url)
      );

      // Check if avatarURL is still valid (exists in Storage)
      const isAvatarValid = avatarURL && storageURLs.includes(avatarURL);

      // If avatarURL is valid but not in validPhotoURLs, we keep it in Storage but don't add it back to photoURLs
      let updatedAvatarURL = isAvatarValid ? avatarURL : undefined;

      // Delete photos from Storage that are not in validPhotoURLs and not the valid avatarURL
      for (const photoRef of allPhotos.items) {
        const photoURL = await getDownloadURL(photoRef);
        if (
          !validPhotoURLs.includes(photoURL) &&
          (!isAvatarValid || photoURL !== avatarURL)
        ) {
          await deleteObject(photoRef);
        }
      }

      return { validPhotoURLs, avatarURL: updatedAvatarURL };
    };

    const handleFileChange = async (
      event: React.ChangeEvent<HTMLInputElement>,
      setFieldValue: (field: string, value: any) => void
    ) => {
      const files = Array.from(event.currentTarget.files ?? []);

      if (localPhotos.length + files.length > MAX_PHOTOS) {
        setErrorModalContent(
          `You can only upload a maximum of ${MAX_PHOTOS} photos.`
        );
        setShowErrorModal(true);
        return;
      }

      setIsModerating(true);
      const newLocalPhotos = [...localPhotos];

      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          setErrorModalContent(
            `File ${file.name} exceeds the maximum size of ${
              MAX_FILE_SIZE / (1024 * 1024)
            }MB.`
          );
          setShowErrorModal(true);
          continue;
        }

        const moderationResult: ModerationResult = await moderateImage(file);

        if (moderationResult.isApproved) {
          try {
            const compressedImageURL = await compressAndUploadImage(
              file,
              userData!.uid
            );
            newLocalPhotos.push(compressedImageURL);
          } catch (error) {
            console.error('Failed to compress and upload image:', error);
            setErrorModalContent(
              `Failed to process image ${file.name}. Please try again.`
            );
            setShowErrorModal(true);
          }
        } else {
          setErrorModalContent(
            `Image ${file.name} failed moderation and was not added.`
          );
          setShowErrorModal(true);
        }
      }

      setLocalPhotos(newLocalPhotos);
      setFieldValue('photos', newLocalPhotos);

      setIsModerating(false);
      event.target.value = '';
    };

    const removePhoto = (index: number) => {
      const newLocalPhotos = localPhotos.filter((_, i) => i !== index);
      setLocalPhotos(newLocalPhotos);
      formikRef.current?.setFieldValue('photos', newLocalPhotos);
    };

    const handleSubmit = async (values: PhotosFormValues) => {
      try {
        setIsUploading(true);

        const uploadedURLs = await Promise.all(
          localPhotos.map(async (photo) => {
            if (typeof photo === 'string') {
              return photo; // Already a URL, no need to upload
            } else {
              return await uploadToFirebase(photo);
            }
          })
        );
        const { validPhotoURLs, avatarURL: updatedAvatarURL } =
          await deleteUnusedPhotos(uploadedURLs, localAvatarURL);

        const nextStage = getNextOnboardingStage(userData!.onboardingStage);
        if (nextStage !== null) {
          await updateUserData({
            photoURLs: validPhotoURLs,
            photoURL: updatedAvatarURL,
            onboardingStage: nextStage,
          });
          onSubmit();
        } else {
          throw new Error('Unable to determine next onboarding stage');
        }
      } catch (error) {
        console.error('Error processing photos:', error);
        setErrorModalContent(
          'An error occurred while processing your photos. Please [contact support](/contact) for assistance.'
        );
        setShowErrorModal(true);
      } finally {
        setIsUploading(false);
      }
    };

    const handleCloseSnackbar = (
      event: React.SyntheticEvent | Event,
      reason?: string
    ) => {
      if (reason === 'clickaway') {
        return;
      }
      setShowSnackbar(false);
    };

    const renderErrors = (
      errors: string | string[] | FormikErrors<string>[]
    ) => {
      if (typeof errors === 'string') {
        return <Typography color='error'>{errors}</Typography>;
      }
      if (Array.isArray(errors)) {
        return errors.map((error, index) => (
          <Typography key={index} color='error'>
            {typeof error === 'string' ? error : 'Invalid file'}
          </Typography>
        ));
      }
      return null;
    };

    const snackbarContent = `Some images were not loaded.
                
There is a maximum of ${MAX_PHOTOS} photos.`;

    const headerMessage = `Please upload up to ${MAX_PHOTOS} photos that you'd like to share
with the community to help illustrate who you are.  Then select one of them to be your 
[avatar](function=setShowAvatarModal).\n
**Note:** For best results, select a square image for your avatar.  More comprehensive image
manipulation is certainly on the 'To Do' list.`;

    return (
      <StyledSwiperWrapper>
        <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto' }}>
          <DBCMarkdown
            text={headerMessage}
            functionLinks={{
              setShowAvatarModal: () => setShowAvatarModal(true),
            }}
          />
          <Formik
            innerRef={formikRef}
            initialValues={{ photos: [] }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, setFieldValue, errors, values }) => (
              <Form noValidate>
                <fieldset
                  disabled={
                    disabled || isSubmitting || isUploading || isModerating
                  }
                  style={{ border: 'none', padding: 0, margin: 0 }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      minHeight:
                        localPhotos.length > 0 ? 'calc(110px + 300px)' : 46,
                    }}
                  >
                    <input
                      accept='image/jpeg,image/png,image/webp'
                      style={{ display: 'none' }}
                      id='photo-upload'
                      type='file'
                      multiple
                      onChange={(event) =>
                        handleFileChange(event, setFieldValue)
                      }
                    />
                    {localAvatarURL && localPhotos.length > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          zIndex: 10,
                        }}
                      >
                        <ButtonBase onClick={() => setShowAvatarModal(true)}>
                          <Avatar
                            src={localAvatarURL}
                            alt='User avatar'
                            sx={{
                              width: 100,
                              height: 100,
                              border: '3px solid white',
                            }}
                          />
                        </ButtonBase>
                      </Box>
                    )}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: localPhotos.length === 0 ? 0 : 'auto',
                        left: localPhotos.length > 0 ? 0 : 'auto',
                        zIndex: 1,
                      }}
                    >
                      <label htmlFor='photo-upload'>
                        <Button
                          variant='contained'
                          component='span'
                          disabled={
                            values.photos.length >= MAX_PHOTOS ||
                            isModerating ||
                            isUploading ||
                            isSubmitting
                          }
                          startIcon={
                            isModerating ? (
                              <CircularProgress size={20} color='inherit' />
                            ) : null
                          }
                        >
                          {isModerating
                            ? 'Moderating...'
                            : values.photos.length === 0
                            ? 'Choose Photos'
                            : 'Add More Photos'}
                        </Button>
                      </label>
                    </Box>
                    {hasSubmitted &&
                      errors.photos &&
                      renderErrors(errors.photos)}
                    {localPhotos.length > 0 && (
                      <Box
                        sx={{
                          pt: 8,
                          height: 300,
                          maxWidth: 300,
                          margin: 'auto',
                        }}
                      >
                        <Swiper
                          modules={[
                            Navigation,
                            Pagination,
                            EffectCoverflow,
                            A11y,
                          ]}
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
                          {localPhotos.map((photo, index) => (
                            <SwiperSlide
                              key={typeof photo === 'string' ? photo : index}
                            >
                              <Box
                                sx={{
                                  position: 'relative',
                                  width: '100%',
                                  height: '280px',
                                }}
                              >
                                <Image
                                  src={
                                    typeof photo === 'string'
                                      ? photo
                                      : URL.createObjectURL(photo)
                                  }
                                  alt={`User photo ${index + 1}`}
                                  fill
                                  priority={index === 0}
                                  style={{
                                    maxWidth: '100%',
                                    objectFit: 'contain',
                                  }}
                                />
                                <IconButton
                                  onClick={() => removePhoto(index)}
                                  sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    color: 'white',
                                    '&:hover': {
                                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    },
                                  }}
                                  aria-label={`Remove photo ${index + 1}`}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                        <Button
                          variant='contained'
                          onClick={handleSetAvatar}
                          disabled={
                            localAvatarURL === localPhotos[currentPhotoIndex] ||
                            isModerating ||
                            isUploading ||
                            isSubmitting
                          }
                          sx={{ display: 'block', margin: '0 auto 0' }}
                        >
                          Set as Avatar
                        </Button>
                      </Box>
                    )}
                  </Box>
                </fieldset>
              </Form>
            )}
          </Formik>
          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={showSnackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
          >
            <SnackbarContent
              message={<DBCMarkdown text={snackbarContent} />}
              action={
                <IconButton
                  size='small'
                  aria-label='close'
                  color='inherit'
                  onClick={handleCloseSnackbar}
                >
                  <CloseIcon fontSize='small' />
                </IconButton>
              }
            />
          </Snackbar>
          <InfoModal
            isOpen={showErrorModal}
            onClose={() => setShowErrorModal(false)}
            title='Whoops!'
            content={errorModalContent}
            closeButtonText='Close'
          />
          <InfoModal
            isOpen={showAvatarModal}
            onClose={() => setShowAvatarModal(false)}
            title=''
            content={
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <ResponsiveAvatar src={localAvatarURL!} />
              </Box>
            }
            closeButtonText='Close'
          />
        </Box>
      </StyledSwiperWrapper>
    );
  }
);

PhotosForm.displayName = 'PhotosForm';

export default PhotosForm;
