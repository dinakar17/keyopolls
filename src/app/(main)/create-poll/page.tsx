'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useKeyopollsPollsApiOperationsCreatePoll } from '@/api/polls/polls';
import { toast } from '@/components/ui/toast';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { PollFormData, pollCreateSchema } from '@/types';

import CommunitySelectionOverlay from './CommunitySelectionOverlay';
import PollForm from './PollForm';

const STORAGE_KEY = 'createPollFormData';

export default function CreatePoll() {
  const router = useRouter();
  const { accessToken } = useProfileStore();
  const { communityDetails, clearCommunityDetails } = useCommunityStore();

  const { mutate: createPoll, isPending } = useKeyopollsPollsApiOperationsCreatePoll({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  // UI state
  const [showCommunityOverlay, setShowCommunityOverlay] = useState(false);
  const [hasImages, setHasImages] = useState(false);
  const [rulesDrawerOpen, setRulesDrawerOpen] = useState(false);
  const [durationDrawerOpen, setDurationDrawerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [durationDays, setDurationDays] = useState(1);
  const [optionImages, setOptionImages] = useState<{
    [key: number]: { file: File; preview: string };
  }>({});

  // Simple localStorage functions
  function saveFormData(data: Partial<PollFormData>) {
    if (typeof window === 'undefined') return;
    try {
      const { ...dataToSave } = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }

  function loadFormData() {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading form data:', error);
      return {};
    }
  }

  function clearFormData() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing form data:', error);
    }
  }

  // Get initial form values
  const getInitialValues = (): PollFormData => {
    const savedData = loadFormData();
    return {
      title: savedData.title || '',
      description: savedData.description || '',
      poll_type: savedData.poll_type || 'single',
      community_id: 0,
      allow_multiple_votes: savedData.allow_multiple_votes || false,
      max_choices: savedData.max_choices || 4,
      requires_aura: savedData.requires_aura || 0,
      expires_at: '', // No default value
      has_correct_answer: savedData.has_correct_answer || false,
      correct_text_answer: savedData.correct_text_answer || '',
      correct_ranking_order: savedData.correct_ranking_order || [],
      options: savedData.options || [
        { text: '', order: 0, is_correct: false },
        { text: '', order: 1, is_correct: false },
      ],
    };
  };

  // Form setup
  const form = useForm<PollFormData>({
    resolver: zodResolver(pollCreateSchema),
    defaultValues: getInitialValues(),
  });

  // Watch form values
  const watchedOptions = form.watch('options');
  const watchedPollType = form.watch('poll_type');
  const watchedTitle = form.watch('title');
  const watchedDescription = form.watch('description');
  const watchedHasCorrectAnswer = form.watch('has_correct_answer');
  const watchedCorrectTextAnswer = form.watch('correct_text_answer');

  // Save to localStorage when key fields change
  useEffect(() => {
    const currentValues = form.getValues();
    saveFormData(currentValues);
  }, [
    watchedTitle,
    watchedDescription,
    watchedPollType,
    watchedOptions,
    watchedHasCorrectAnswer,
    form,
  ]);

  // Update community_id when community is selected
  useEffect(() => {
    if (communityDetails) {
      form.setValue('community_id', communityDetails.id);
    }
  }, [communityDetails, form]);

  // Reset correct answer when poll type changes
  useEffect(() => {
    form.setValue('has_correct_answer', false);
    form.setValue('correct_text_answer', '');
    form.setValue('correct_ranking_order', []);
    // Reset is_correct for all options
    watchedOptions.forEach((_, index) => {
      form.setValue(`options.${index}.is_correct`, false);
    });
  }, [watchedPollType, form, watchedOptions]);

  // Clear options when switching to text input, but preserve image for text input
  useEffect(() => {
    if (watchedPollType === 'text_input') {
      // Clear all options for text input polls
      form.setValue('options', []);
      // Keep only the first image (index 0) for text input if it exists
      setOptionImages((prev) => {
        const textInputImage = prev[0];
        if (textInputImage && textInputImage.preview) {
          return { ...prev, 0: textInputImage };
        }
        return {};
      });
    } else if (watchedOptions.length === 0) {
      // Add default options for choice-based polls and clear text input image
      form.setValue('options', [
        { text: '', order: 0, is_correct: false },
        { text: '', order: 1, is_correct: false },
      ]);
      // Clear text input image when switching to choice-based polls
      setOptionImages({});
    }
  }, [watchedPollType, form, watchedOptions.length]);

  // Check if any option has an image (including text input polls)
  useEffect(() => {
    const hasAnyImage = Object.keys(optionImages).length > 0;
    setHasImages(hasAnyImage);
  }, [optionImages]);

  // Handle image upload
  const handleImageUpload = (optionIndex: number, file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOptionImages((prev) => ({
          ...prev,
          [optionIndex]: {
            file,
            preview: e.target?.result as string,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = (optionIndex: number) => {
    setOptionImages((prev) => {
      const newImages = { ...prev };
      delete newImages[optionIndex];
      return newImages;
    });
  };

  // Handle duration selection
  const handleDurationSelect = (days: number) => {
    setDurationDays(days);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    form.setValue('expires_at', expiresAt.toISOString());
    setDurationDrawerOpen(false);
  };

  // Handle poll type change
  const handlePollTypeChange = (pollType: 'single' | 'multiple' | 'ranking' | 'text_input') => {
    form.setValue('poll_type', pollType);
    // Clear any existing error when changing poll type
    setErrorMessage(null);
    // Reset max_choices to 4 when changing from multiple
    if (pollType !== 'multiple') {
      form.setValue('max_choices', 4);
    }
  };

  // Handle max choices selection
  const handleMaxChoicesSelect = (choices: number) => {
    form.setValue('max_choices', choices);
  };

  // Handle correct answer toggle
  const handleCorrectAnswerToggle = (enabled: boolean) => {
    form.setValue('has_correct_answer', enabled);
    if (!enabled) {
      // Clear all correct answer data
      form.setValue('correct_text_answer', '');
      form.setValue('correct_ranking_order', []);
      watchedOptions.forEach((_, index) => {
        form.setValue(`options.${index}.is_correct`, false);
      });
    }
  };

  // Handle option correct answer toggle
  const handleOptionCorrectToggle = (index: number, isCorrect: boolean) => {
    if (watchedPollType === 'single' && isCorrect) {
      // For single choice, uncheck all other options first
      watchedOptions.forEach((_, i) => {
        if (i !== index) {
          form.setValue(`options.${i}.is_correct`, false);
        }
      });
    }
    form.setValue(`options.${index}.is_correct`, isCorrect);
  };

  // Check if all options have images when any option has an image
  const validateImages = () => {
    if (!hasImages) return true; // No images, validation passes

    if (watchedPollType === 'text_input') {
      // For text input, we only need to check if there's an image at index 0
      return true; // Text input images are always valid if present
    }

    // For choice-based polls, validate that all options with text have images
    const validOptions = watchedOptions.filter((option) => option.text.trim());
    for (let i = 0; i < validOptions.length; i++) {
      if (!optionImages[i]) {
        return false; // Missing image for this option
      }
    }
    return true;
  };

  // Validate correct answers
  const validateCorrectAnswers = () => {
    if (!watchedHasCorrectAnswer) return true;

    if (watchedPollType === 'text_input') {
      return (
        watchedCorrectTextAnswer &&
        watchedCorrectTextAnswer.trim() &&
        !watchedCorrectTextAnswer.includes(' ')
      );
    } else if (watchedPollType === 'single') {
      return watchedOptions.some((option) => option.is_correct);
    } else if (watchedPollType === 'multiple') {
      return watchedOptions.some((option) => option.is_correct);
    } else if (watchedPollType === 'ranking') {
      // For ranking, we'll set the correct order based on the current option order
      return true;
    }
    return true;
  };

  // Handle form submission
  const onSubmit = async (data: PollFormData) => {
    try {
      // Clear any existing error
      setErrorMessage(null);

      // Check for community selection
      if (!communityDetails) {
        setErrorMessage('Please select a community for your poll.');
        return;
      }

      // Validate correct answers if enabled
      if (data.has_correct_answer && !validateCorrectAnswers()) {
        setErrorMessage('Please set valid correct answers for your poll.');
        return;
      }

      // For text input polls, validate different constraints
      if (data.poll_type === 'text_input') {
        if (
          data.has_correct_answer &&
          (!data.correct_text_answer || data.correct_text_answer.includes(' '))
        ) {
          setErrorMessage('Correct text answer must be a single word/number without spaces.');
          return;
        }
      } else {
        // Check for valid options with text for choice-based polls
        const validOptions = data.options.filter((option) => option.text.trim());
        if (validOptions.length < 2) {
          setErrorMessage('Please add at least 2 options with text.');
          return;
        }

        // Validate images if any are present
        if (!validateImages()) {
          if (watchedPollType === 'text_input') {
            setErrorMessage('Please add or remove the question image.');
          } else {
            setErrorMessage('Please add images to all options or remove all images.');
          }
          return;
        }
      }

      // Set correct ranking order for ranking polls
      const finalData = { ...data };
      if (data.has_correct_answer && data.poll_type === 'ranking') {
        finalData.correct_ranking_order = data.options.map((_, index) => index);
      }

      createPoll(
        {
          data: {
            data: finalData,
            option_images: hasImages ? Object.values(optionImages).map((img) => img.file) : [],
          },
        },
        {
          onSuccess: (response) => {
            toast.success('Poll created successfully!');
            clearFormData(); // Clear saved form data
            clearCommunityDetails();
            router.replace(`/polls/${response.data.id}`);
          },
          onError: (error) => {
            setErrorMessage(error.response?.data.message || 'An unexpected error occurred');
            console.error('Poll creation error:', error);
          },
        }
      );
    } catch (error) {
      setErrorMessage('An error occurred while creating the poll');
      console.error('Form submission error:', error);
    }
  };

  // Handle navigation back
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="bg-background min-h-screen pb-14">
      {/* Top Header */}
      <div className="border-border bg-background sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3">
        <button
          onClick={handleBack}
          className="hover:bg-surface-elevated text-text-muted hover:text-text rounded-full p-1.5 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h1 className="text-text text-lg font-semibold">Create Poll</h1>

        <button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isPending}
          className="bg-primary text-background rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Posting...' : 'Post'}
        </button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <PollForm
          form={form}
          communityDetails={communityDetails}
          optionImages={optionImages}
          hasImages={hasImages}
          durationDays={durationDays}
          rulesDrawerOpen={rulesDrawerOpen}
          durationDrawerOpen={durationDrawerOpen}
          setShowCommunityOverlay={setShowCommunityOverlay}
          setRulesDrawerOpen={setRulesDrawerOpen}
          setDurationDrawerOpen={setDurationDrawerOpen}
          setDurationDays={setDurationDays}
          handleImageUpload={handleImageUpload}
          removeImage={removeImage}
          handleDurationSelect={handleDurationSelect}
          handleMaxChoicesSelect={handleMaxChoicesSelect}
          handleCorrectAnswerToggle={handleCorrectAnswerToggle}
          handleOptionCorrectToggle={handleOptionCorrectToggle}
        />
      </form>

      {/* Error Message - Fixed above bottom selector */}
      {errorMessage && (
        <div className="fixed right-4 bottom-20 left-4 z-20 mx-auto max-w-2xl">
          <div className="rounded-lg border border-red-400 bg-red-500 p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg
                  className="h-5 w-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="ml-3 flex-shrink-0 rounded-full p-1 transition-colors hover:bg-red-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Poll Type Selector */}
      <div className="border-border bg-background fixed right-0 bottom-0 left-0 border-t p-2">
        <div className="mx-auto max-w-2xl">
          <div className="flex space-x-1">
            {[
              {
                value: 'single' as const,
                label: 'Single Choice',
                shortLabel: 'Single',
                icon: '○',
                description: 'One option only',
              },
              {
                value: 'multiple' as const,
                label: 'Multiple Choice',
                shortLabel: 'Multiple',
                icon: '☐',
                description: 'Multiple options',
              },
              {
                value: 'ranking' as const,
                label: 'Ranking',
                shortLabel: 'Ranking',
                icon: '↕',
                description: 'Rank by preference',
              },
              {
                value: 'text_input' as const,
                label: 'Text Input',
                shortLabel: 'Text',
                icon: '📝',
                description: 'Word/number input',
              },
            ].map((type) => {
              const isSelected = watchedPollType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handlePollTypeChange(type.value)}
                  className={`flex items-center rounded-lg border transition-all duration-200 ${
                    isSelected
                      ? 'border-primary/20 bg-primary/10 text-primary'
                      : 'border-border bg-surface text-text-secondary hover:bg-surface-elevated'
                  }`}
                  style={{
                    width: isSelected ? '55%' : '15%',
                    padding: '6px 8px',
                  }}
                >
                  <span className="mr-1.5 flex-shrink-0 text-sm">{type.icon}</span>
                  <div className="flex min-w-0 flex-1 flex-col items-start overflow-hidden">
                    <span className={`w-full text-xs font-medium ${isSelected ? '' : 'truncate'}`}>
                      {isSelected ? type.label : type.shortLabel}
                    </span>
                    {isSelected && (
                      <span className="text-primary w-full truncate text-xs leading-tight">
                        {type.description}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Community Selection Overlay */}
      <CommunitySelectionOverlay
        isOpen={showCommunityOverlay}
        onClose={() => setShowCommunityOverlay(false)}
      />
    </div>
  );
}
