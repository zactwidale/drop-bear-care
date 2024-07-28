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
  Alert,
  Snackbar,
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

interface PhotosFormValues {
  photos: File[];
}

const MAX_PHOTOS = 5;
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

const PhotosForm = forwardRef<PhotosFormRef, PhotosFormProps>(
  ({ onSubmit, disabled = false }, ref) => {
    const { userData, updateUserData } = useAuth();
    const formikRef = useRef<FormikProps<PhotosFormValues>>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [exceedsMaxPhotos, setExceedsMaxPhotos] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [moderationError, setModerationError] = useState<string | null>(null);
    const [moderationStatus, setModerationStatus] = useState<string>('');
    const [moderationDetails, setModerationDetails] =
      useState<ModerationResult | null>(null);

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
        setUploadError(null);
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
          setModerationStatus('Upload complete. Proceeding to next stage.');
          onSubmit();
        } else {
          throw new Error('Unable to determine next onboarding stage');
        }
      } catch (error) {
        console.error('Error uploading photos:', error);
        setUploadError('An error occurred while uploading your photos');
        setModerationStatus('An error occurred during the upload process.');
      } finally {
        setIsUploading(false);
      }
    };
    const handleFileChange = async (
      event: React.ChangeEvent<HTMLInputElement>,
      setFieldValue: (field: string, value: any) => void
    ) => {
      const files = Array.from(event.currentTarget.files ?? []);
      const currentPhotos = formikRef.current?.values.photos || [];

      setModerationStatus('Starting moderation process...');

      const moderatedPhotos = [];
      const newPreviewUrls = [...previewUrls];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setModerationStatus(`Moderating image ${i + 1} of ${files.length}...`);
        const moderationResult: ModerationResult = await moderateImage(file);
        setModerationDetails(moderationResult);

        if (moderationResult.isApproved) {
          moderatedPhotos.push(file);
          newPreviewUrls.push(URL.createObjectURL(file));
        } else {
          setModerationStatus(
            `Image ${i + 1} failed moderation. Reason: ${
              moderationResult.reason
            }`
          );
        }
      }

      const newPhotos = [...currentPhotos, ...moderatedPhotos].slice(
        0,
        MAX_PHOTOS
      );
      setFieldValue('photos', newPhotos);
      setPreviewUrls(newPreviewUrls.slice(0, MAX_PHOTOS));

      setModerationStatus(
        moderatedPhotos.length === files.length
          ? 'All images passed moderation.'
          : 'Some images failed moderation and were not added.'
      );
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

    return (
      <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto' }}>
        <Typography variant='h6' gutterBottom>
          Upload Your Photos
        </Typography>
        <Typography variant='body1' paragraph>
          Please upload up to {MAX_PHOTOS} clear, recent photos of yourself.
          This helps create a more personalized experience for everyone.
        </Typography>
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
                disabled={disabled || isSubmitting || isUploading}
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
                  <Button
                    variant='contained'
                    component='span'
                    disabled={values.photos.length >= MAX_PHOTOS}
                  >
                    {values.photos.length === 0
                      ? 'Choose Photos'
                      : 'Add More Photos'}
                  </Button>
                </label>
                {hasSubmitted && errors.photos && renderErrors(errors.photos)}
                {moderationStatus && (
                  <Alert severity='info' sx={{ mt: 2 }}>
                    {moderationStatus}
                  </Alert>
                )}
                {moderationDetails && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      border: '1px solid #ccc',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant='h6'>
                      Last Moderation Result:
                    </Typography>
                    <Typography>
                      Approved: {moderationDetails.isApproved ? 'Yes' : 'No'}
                    </Typography>
                    {moderationDetails.reason && (
                      <Typography>
                        Reason: {moderationDetails.reason}
                      </Typography>
                    )}
                    {moderationDetails.details && (
                      <Box>
                        <Typography variant='subtitle1'>Details:</Typography>
                        {Object.entries(moderationDetails.details).map(
                          ([key, value]) => (
                            <Typography key={key}>
                              {key}: {value}
                            </Typography>
                          )
                        )}
                      </Box>
                    )}
                  </Box>
                )}
                {previewUrls.length > 0 && (
                  <Box
                    sx={{
                      mt: 2,
                      mb: 2,
                      height: 300,
                      maxWidth: 600,
                      borderWidth: 1,
                      borderColor: 'blue',
                    }}
                  >
                    <Swiper
                      modules={[Navigation, Pagination, EffectCoverflow, A11y]}
                      spaceBetween={30}
                      slidesPerView={2}
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
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                              }}
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
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={showSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={`Some images were not loaded (max: ${MAX_PHOTOS} photos)`}
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
        <InfoModal
          isOpen={uploadError !== null}
          onClose={() => setUploadError(null)}
          title='Upload Error'
          content={uploadError || 'An error occurred during photo upload.'}
          closeButtonText='Try Again'
        />
        <InfoModal
          isOpen={moderationError !== null}
          onClose={() => setModerationError(null)}
          title='Content Moderation Error'
          content={
            moderationError || 'An error occurred during content moderation.'
          }
          closeButtonText='Try Again'
        />
      </Box>
    );
  }
);

PhotosForm.displayName = 'PhotosForm';

export default PhotosForm;
