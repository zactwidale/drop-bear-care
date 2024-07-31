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
import { Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import { moderateImage, ModerationResult } from '@/services/moderationService';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import DBCMarkdown from '@/components/DBCMarkdown';

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
}

export interface PhotosFormRef {
  submitForm: () => Promise<void>;
}

const PhotosForm = forwardRef<PhotosFormRef, PhotosFormProps>(
  ({ onSubmit, disabled = false }, ref) => {
    const { userData, updateUserData } = useAuth();
    const formikRef = useRef<FormikProps<PhotosFormValues>>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isModerating, setIsModerating] = useState(false);
    const [moderationStatus, setModerationStatus] = useState<string>('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorModalContent, setErrorModalContent] = useState('');
    const [localPhotos, setLocalPhotos] = useState<(File | string)[]>([]);
    const [showSnackbar, setShowSnackbar] = useState(false);

    useEffect(() => {
      if (userData && userData.photoUrls) {
        setLocalPhotos(userData.photoUrls);
        formikRef.current?.setFieldValue('photos', userData.photoUrls);
      }
    }, [userData]);

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

    const deleteUnusedPhotos = async (currentPhotoUrls: string[]) => {
      const storage = getStorage();
      const userPhotosRef = storageRef(storage, `user-photos/${userData!.uid}`);

      const allPhotos = await listAll(userPhotosRef);

      for (const photoRef of allPhotos.items) {
        const photoUrl = await getDownloadURL(photoRef);
        if (!currentPhotoUrls.includes(photoUrl)) {
          await deleteObject(photoRef);
        }
      }
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

        setModerationStatus(
          `Moderating image ${newLocalPhotos.length + 1} of ${files.length}...`
        );
        const moderationResult: ModerationResult = await moderateImage(file);

        if (moderationResult.isApproved) {
          newLocalPhotos.push(file);
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
      setModerationStatus('');
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
        setModerationStatus('Processing photos...');

        const uploadedUrls = await Promise.all(
          localPhotos.map(async (photo) => {
            if (typeof photo === 'string') {
              return photo; // Already a URL, no need to upload
            } else {
              return await uploadToFirebase(photo);
            }
          })
        );

        await deleteUnusedPhotos(uploadedUrls);

        const nextStage = getNextOnboardingStage(userData!.onboardingStage);
        if (nextStage !== null) {
          await updateUserData({
            photoUrls: uploadedUrls,
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
        setModerationStatus('');
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
with the community to help illustrate who you are.  Then select one of them to be your avatar.`;

    return (
      <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto' }}>
        <DBCMarkdown text={headerMessage} />
        <Typography variant='body1' paragraph></Typography>
        <Formik
          innerRef={formikRef}
          initialValues={{
            photos: [],
          }}
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
                <input
                  accept='image/jpeg,image/png,image/webp'
                  style={{ display: 'none' }}
                  id='photo-upload'
                  type='file'
                  multiple
                  onChange={(event) => handleFileChange(event, setFieldValue)}
                />
                <label htmlFor='photo-upload'>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant='contained'
                      component='span'
                      disabled={
                        values.photos.length >= MAX_PHOTOS || isModerating
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
                        ? 'Choose Photos (Optional)'
                        : 'Add More Photos'}
                    </Button>
                  </Box>
                </label>
                {hasSubmitted && errors.photos && renderErrors(errors.photos)}
                {moderationStatus && (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <DBCMarkdown text={moderationStatus} />
                  </Box>
                )}
                {localPhotos.length > 0 && (
                  <Box
                    sx={{
                      pt: 2,
                      height: 300,
                      maxWidth: 300,
                      margin: 'auto',
                    }}
                  >
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
                      a11y={{
                        prevSlideMessage: 'Previous photo',
                        nextSlideMessage: 'Next photo',
                        firstSlideMessage: 'This is the first photo',
                        lastSlideMessage: 'This is the last photo',
                      }}
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
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Image
                              src={
                                typeof photo === 'string'
                                  ? photo
                                  : URL.createObjectURL(photo)
                              }
                              alt={`Preview ${index + 1}`}
                              fill
                              objectFit='contain'
                              priority={true}
                            />
                            <IconButton
                              onClick={() => removePhoto(index)}
                              sx={{
                                position: 'absolute',
                                bottom: 8,
                                right: 8,
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
                  </Box>
                )}
              </fieldset>
              {isUploading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <CircularProgress />
                </Box>
              )}
            </Form>
          )}
        </Formik>
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
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
      </Box>
    );
  }
);

PhotosForm.displayName = 'PhotosForm';

export default PhotosForm;
