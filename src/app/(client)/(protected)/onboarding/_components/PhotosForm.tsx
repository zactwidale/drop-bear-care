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
import { styled } from '@mui/material/styles';
import { useAuth } from '@/contexts/AuthProvider';
import { getNextOnboardingStage } from '@/types/onboarding';
import InfoModal from '@/components/InfoModal';
import Image from 'next/image';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
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
  photos: File[];
}

const MAX_PHOTOS = 2;
const MAX_FILE_SIZE = 5000000; // 5MB

const validationSchema = Yup.object().shape({
  photos: Yup.array()
    .of(
      Yup.mixed<File>()
        .test(
          'fileSize',
          'The file is too large',
          (value: File | undefined) => {
            if (!value) return true;
            return value.size <= MAX_FILE_SIZE;
          }
        )
        .test(
          'fileType',
          'Unsupported file format',
          (value: File | undefined) => {
            if (!value) return true;
            return ['image/jpeg', 'image/png', 'image/webp'].includes(
              value.type
            );
          }
        )
    )
    .min(1, 'Please upload at least one photo')
    .max(MAX_PHOTOS, `You can upload a maximum of ${MAX_PHOTOS} photos`),
});

interface PhotosFormProps {
  onSubmit: () => void;
  disabled?: boolean;
}

export interface PhotosFormRef {
  submitForm: () => Promise<void>;
}

const StyledSnackbarContent = styled(SnackbarContent)(({ theme }) => ({}));

const PhotosForm = forwardRef<PhotosFormRef, PhotosFormProps>(
  ({ onSubmit, disabled = false }, ref) => {
    const { userData, updateUserData } = useAuth();
    const formikRef = useRef<FormikProps<PhotosFormValues>>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isModerating, setIsModerating] = useState(false);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [exceedsMaxPhotos, setExceedsMaxPhotos] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [moderationStatus, setModerationStatus] = useState<string>('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorModalContent, setErrorModalContent] = useState('');

    useEffect(() => {
      if (exceedsMaxPhotos) {
        setShowSnackbar(true);
      }
    }, [exceedsMaxPhotos]);

    const handleCloseSnackbar = (
      event: React.SyntheticEvent | Event,
      reason?: string
    ) => {
      if (reason === 'clickaway') {
        return;
      }
      setShowSnackbar(false);
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

    const handleSubmit = async (values: PhotosFormValues) => {
      try {
        setIsUploading(true);
        setModerationStatus('Uploading approved images...');

        if (values.photos.length === 0) {
          throw new Error('No photos selected');
        }

        const uploadedUrls = await Promise.all(
          values.photos.map(uploadToFirebase)
        );

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
        console.error('Error uploading photos:', error);
        setErrorModalContent(
          'An error occurred while uploading your photos. Please [contact support](/contact) for assistance.'
        );
        setShowErrorModal(true);
      } finally {
        setIsUploading(false);
        setModerationStatus('');
      }
    };

    const handleFileChange = async (
      event: React.ChangeEvent<HTMLInputElement>,
      setFieldValue: (field: string, value: any) => void
    ) => {
      const files = Array.from(event.currentTarget.files ?? []);
      const currentPhotos = formikRef.current?.values.photos || [];

      setIsModerating(true);
      const moderatedPhotos = [];
      const newPreviewUrls = [...previewUrls];
      let failedModerationCount = 0;
      let exceedMaxCount = 0;

      for (let i = 0; i < files.length; i++) {
        if (currentPhotos.length + moderatedPhotos.length >= MAX_PHOTOS) {
          exceedMaxCount++;
          continue;
        }

        const file = files[i];
        setModerationStatus(`Moderating image ${i + 1} of ${files.length}...`);
        const moderationResult: ModerationResult = await moderateImage(file);

        if (moderationResult.isApproved) {
          moderatedPhotos.push(file);
          newPreviewUrls.push(URL.createObjectURL(file));
        } else {
          failedModerationCount++;
        }
      }

      const newPhotos = [...currentPhotos, ...moderatedPhotos];

      setFieldValue('photos', newPhotos);
      setPreviewUrls(newPreviewUrls);

      setModerationStatus('');
      setIsModerating(false);

      if (exceedMaxCount > 0) {
        setExceedsMaxPhotos(true);
        setShowSnackbar(true);
      }

      if (failedModerationCount > 0) {
        setErrorModalContent(
          `Google's AI content moderation service considered ${failedModerationCount} image(s)
to be potentially inappropriate and have been rejected. Please try again with less controversial
images. 

Fine tuning the automated content moderation is challenging. If you believe that we have got the
balance wrong, please [let us know.](/contact)`
        );
        setShowErrorModal(true);
      }
      // Clear the file input
      event.target.value = '';
    };

    const removePhoto = (
      index: number,
      setFieldValue: (field: string, value: any) => void
    ) => {
      const currentPhotos = formikRef.current?.values.photos || [];
      const newPhotos = currentPhotos.filter((_, i) => i !== index);
      setFieldValue('photos', newPhotos);

      const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
      setPreviewUrls(newPreviewUrls);
    };

    const renderErrors = (errors: string | string[] | FormikErrors<File>[]) => {
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
                        ? 'Choose Photos'
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
                {previewUrls.length > 0 && (
                  <Box
                    sx={{
                      mt: 2,
                      mb: 2,
                      height: 300,
                      maxWidth: 300,
                      borderWidth: 1,
                      borderColor: 'blue',
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
                      {previewUrls.map((url, index) => (
                        <SwiperSlide key={index}>
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
                              src={url}
                              alt={`Preview ${index + 1}`}
                              layout='fill'
                              objectFit='contain'
                            />
                            <IconButton
                              onClick={() => removePhoto(index, setFieldValue)}
                              sx={{
                                position: 'absolute',
                                top: 8,
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
