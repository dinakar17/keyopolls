'use client';

import { useRef } from 'react';

import Image from 'next/image';

import { UseFormReturn, useFieldArray } from 'react-hook-form';

import { CommunityDetails } from '@/api/schemas';
import MarkdownEditor from '@/components/common/MarkdownEditor';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { PollFormData } from '@/types';

import PollFormSettings from './PollFormSettings';

interface PollFormProps {
  form: UseFormReturn<PollFormData>;
  communityDetails: CommunityDetails | null;
  optionImages: { [key: number]: { file: File; preview: string } };
  hasImages: boolean;
  rulesDrawerOpen: boolean;
  setRulesDrawerOpen: (open: boolean) => void;
  handleImageUpload: (optionIndex: number, file: File | null) => void;
  removeImage: (optionIndex: number) => void;
  handleMaxChoicesSelect: (choices: number) => void;
  handleCorrectAnswerToggle: (enabled: boolean) => void;
  handleOptionCorrectToggle: (index: number, isCorrect: boolean) => void;
  handleRankingOrderUpdate: (newRankingOrder: number[]) => void;
}

export default function PollForm({
  form,
  communityDetails,
  optionImages,
  hasImages,
  rulesDrawerOpen,
  setRulesDrawerOpen,
  handleImageUpload,
  removeImage,
  handleMaxChoicesSelect,
  handleOptionCorrectToggle,
  handleRankingOrderUpdate,
}: PollFormProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const {
    fields: todoFields,
    append: appendTodo,
    remove: removeTodo,
  } = useFieldArray({
    control: form.control,
    name: 'todos',
  });

  // Watch form values
  const watchedOptions = form.watch('options');
  const watchedPollType = form.watch('poll_type');
  const watchedTitle = form.watch('title');
  const watchedDescription = form.watch('description');
  const watchedTodos = form.watch('todos') || [];

  // Auto-resize text areas
  const autoResize = (textareaRef: React.RefObject<HTMLTextAreaElement | null>) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  // Handle title change with auto-resize
  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    form.setValue('title', e.target.value);
    autoResize(titleRef);
  };

  // Add new option
  const addOption = () => {
    if (fields.length < 10) {
      append({ text: '', order: fields.length, is_correct: false });
    }
  };

  // Remove option
  const removeOption = (index: number) => {
    if (fields.length > 2) {
      remove(index);
      removeImage(index);
    }
  };

  // Add new todo
  const addTodo = () => {
    if (todoFields.length < 20) {
      appendTodo({ text: '' });
    }
  };

  // Remove todo
  const removeTodoItem = (index: number) => {
    removeTodo(index);
  };

  const formErrors = form.formState.errors;

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
      {/* Community Display with Rules Button */}
      {communityDetails && (
        <div className="space-y-2">
          <div className="flex space-x-2">
            <div className="border-border bg-surface flex-1 rounded-lg border p-2.5">
              <div className="flex items-center space-x-2">
                {communityDetails.avatar && (
                  <Image
                    src={communityDetails.avatar}
                    alt={communityDetails.name}
                    className="h-6 w-6 rounded-full object-cover"
                    width={24}
                    height={24}
                  />
                )}
                <span className="text-text">{communityDetails.name}</span>
              </div>
            </div>

            <Drawer open={rulesDrawerOpen} onOpenChange={setRulesDrawerOpen}>
              <DrawerTrigger asChild>
                <button
                  type="button"
                  className="border-border text-text hover:bg-surface-elevated rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors"
                >
                  Rules
                </button>
              </DrawerTrigger>
              <DrawerContent className="bg-surface border-border">
                <DrawerHeader>
                  <DrawerTitle className="text-text">Community Rules</DrawerTitle>
                  <DrawerDescription className="text-text-secondary">
                    {communityDetails.name} • {communityDetails.member_count.toLocaleString()}{' '}
                    members
                  </DrawerDescription>
                </DrawerHeader>
                <div className="max-h-[60vh] overflow-y-auto px-4 pb-4">
                  <div className="space-y-3">
                    {communityDetails.rules?.map((rule, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <span className="bg-primary/10 text-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                          {index + 1}
                        </span>
                        <p className="text-text-secondary text-sm">{rule}</p>
                      </div>
                    )) || (
                      <p className="text-text-muted text-sm">
                        No specific rules defined for this community.
                      </p>
                    )}
                  </div>
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <button className="bg-primary text-background w-full rounded-lg py-2 font-medium transition-colors hover:opacity-90">
                      Got it
                    </button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      )}

      {/* Title Input */}
      <div>
        <textarea
          {...form.register('title')}
          ref={titleRef}
          value={watchedTitle}
          onChange={handleTitleChange}
          placeholder={
            watchedPollType === 'text_input'
              ? 'What question would you like to ask?'
              : watchedPollType === 'ranking'
                ? 'What would you like people to rank?'
                : 'What would you like to ask?'
          }
          className="placeholder-text-muted text-text w-full resize-none overflow-hidden border-none bg-transparent text-xl font-medium outline-none"
          style={{ minHeight: '50px' }}
          rows={1}
        />
        {formErrors.title && <p className="text-error mt-1 text-sm">{formErrors.title.message}</p>}
      </div>

      {/* Description with MarkdownEditor */}
      <div className="space-y-2">
        <MarkdownEditor
          value={watchedDescription || ''}
          onChange={(value) => {
            form.setValue('description', value);
            form.trigger('description');
          }}
          label=""
          placeholder={
            watchedPollType === 'ranking'
              ? 'Provide context about what should be ranked and criteria to consider...'
              : 'Provide additional context or instructions for your poll...'
          }
          minCharacters={0}
          showCharacterCount={false}
          error={formErrors.description?.message}
          height="120px"
          required={false}
          showModeToggle={true}
          className="w-full"
        />
      </div>

      {/* Todos Section */}
      <div className="border-border bg-surface hidden space-y-3 rounded-lg border p-3">
        <div>
          <h3 className="text-text text-sm font-medium">Add Todos (Optional)</h3>
          <p className="text-text-muted text-xs">
            Add todos to help others further improve their skills based on this poll (max 3).
          </p>
        </div>

        <div className="space-y-2">
          {todoFields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2">
              <input
                {...form.register(`todos.${index}.text`)}
                type="text"
                placeholder={`Todo ${index + 1}: What do you want to improve?`}
                className="border-border bg-surface-elevated text-text placeholder-text-muted focus:border-primary flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
                maxLength={200}
              />
              <button
                type="button"
                onClick={() => removeTodoItem(index)}
                className="text-text-muted hover:text-error flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}

          {todoFields.length < 3 && (
            <button
              type="button"
              onClick={addTodo}
              className="border-border text-text-muted hover:border-border-subtle hover:text-text flex w-full items-center justify-center space-x-2 rounded-lg border-2 border-dashed p-2 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-sm">Add todo</span>
            </button>
          )}

          <div className="text-text-muted text-xs">{watchedTodos.length}/3 todos</div>
        </div>
      </div>

      {/* Text Input Poll Instructions and Image Upload */}
      {watchedPollType === 'text_input' && (
        <div className="border-border bg-surface space-y-3 rounded-lg border p-3">
          <p className="text-text-secondary text-sm">
            Users will submit single words or numbers as responses. Responses with spaces will be
            rejected.
          </p>

          {/* Image Upload for Text Input */}
          <div>
            <label className="text-text-secondary mb-2 block text-sm">
              Add an image to your question (optional)
            </label>
            {!optionImages[0] ? (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(0, e.target.files?.[0] || null)}
                  className="hidden"
                  id="text-input-image"
                />
                <label
                  htmlFor="text-input-image"
                  className="border-border text-text-muted hover:border-border-subtle hover:text-text flex w-full cursor-pointer items-center justify-center space-x-2 rounded-lg border-2 border-dashed p-4 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm">Add image to question</span>
                </label>
              </div>
            ) : (
              <div className="relative">
                <Image
                  src={optionImages[0].preview}
                  alt="Question image"
                  className="w-full max-w-md rounded-lg object-cover"
                  width={400}
                  height={300}
                />
                <button
                  type="button"
                  onClick={() => removeImage(0)}
                  className="bg-error text-background absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-sm hover:opacity-80"
                >
                  ×
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(0, e.target.files?.[0] || null)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  title="Click to change image"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ranking Instructions */}
      {watchedPollType === 'ranking' && (
        <div className="border-border bg-surface space-y-3 rounded-lg border p-3">
          <div className="flex items-start space-x-2">
            <svg
              className="text-primary mt-0.5 h-5 w-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-text mb-1 text-sm font-medium">Ranking Poll Instructions</h4>
              <p className="text-text-secondary text-sm">
                Users will drag and drop options to rank them from 1st to last. Set the correct
                ranking order in the settings below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Poll Options (only for non-text-input polls) */}
      {watchedPollType !== 'text_input' && (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="group">
              <div className="border-border hover:border-border-subtle bg-surface hover:bg-surface-elevated flex items-center space-x-2 rounded-lg border p-3 transition-colors">
                {/* Ranking indicator for ranking polls */}
                {watchedPollType === 'ranking' && (
                  <div className="bg-primary/10 text-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                    {index + 1}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <textarea
                      {...form.register(`options.${index}.text`)}
                      placeholder={
                        watchedPollType === 'ranking'
                          ? `Item ${index + 1} to rank`
                          : `Option ${String.fromCharCode(65 + index)}`
                      }
                      className="text-text placeholder-text-muted w-full resize-none overflow-hidden border-none bg-transparent text-sm outline-none"
                      style={{ minHeight: '20px' }}
                      rows={1}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />

                    {/* Correct Answer Checkbox - Hide for ranking */}
                    {watchedPollType !== 'ranking' && (
                      <label className="flex cursor-pointer items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={watchedOptions[index]?.is_correct || false}
                          onChange={(e) => handleOptionCorrectToggle(index, e.target.checked)}
                          className="text-primary focus:ring-primary border-border h-4 w-4 rounded"
                        />
                        <span className="text-text-muted text-xs">Correct</span>
                      </label>
                    )}
                  </div>

                  {(!hasImages || !optionImages[index]) && (
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e.target.files?.[0] || null)}
                        className="hidden"
                        id={`image-${index}`}
                      />
                      <label
                        htmlFor={`image-${index}`}
                        className="text-text-muted hover:text-text flex cursor-pointer items-center space-x-1 text-xs"
                      >
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002 2z"
                          />
                        </svg>
                        <span>Add image</span>
                      </label>
                    </div>
                  )}
                </div>

                {fields.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-text-muted hover:text-error flex h-6 w-6 flex-shrink-0 items-center justify-center opacity-100 transition-all hover:scale-110"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
              {formErrors.options?.[index]?.text && (
                <p className="text-error mt-1 text-sm">
                  {formErrors.options[index]?.text?.message}
                </p>
              )}
            </div>
          ))}

          {/* Image Previews */}
          {hasImages && (
            <div className="overflow-x-auto">
              <div className="flex space-x-2 pb-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex-shrink-0">
                    {optionImages[index] ? (
                      <div className="group relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e.target.files?.[0] || null)}
                          className="absolute inset-0 z-10 cursor-pointer opacity-0"
                          id={`update-image-${index}`}
                        />
                        <Image
                          src={optionImages[index].preview}
                          alt={`Option ${String.fromCharCode(65 + index)}`}
                          className="h-20 w-20 rounded-lg object-cover transition-opacity group-hover:opacity-75"
                          width={80}
                          height={80}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                          <svg
                            className="text-background h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div className="bg-primary text-background absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium">
                          {watchedPollType === 'ranking'
                            ? index + 1
                            : String.fromCharCode(65 + index)}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="bg-error text-background absolute -top-1 -right-1 z-20 flex h-5 w-5 items-center justify-center rounded-full text-xs hover:opacity-80"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="border-border text-text-muted relative flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e.target.files?.[0] || null)}
                          className="absolute inset-0 cursor-pointer opacity-0"
                          id={`preview-image-${index}`}
                        />
                        <svg
                          className="mb-1 h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-xs">
                          {watchedPollType === 'ranking'
                            ? index + 1
                            : String.fromCharCode(65 + index)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {fields.length < 10 && (
            <button
              type="button"
              onClick={addOption}
              className="border-border text-text-muted hover:border-border-subtle hover:text-text flex w-full items-center justify-center space-x-2 rounded-lg border-2 border-dashed p-3 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-sm">
                {watchedPollType === 'ranking' ? 'Add another item to rank' : 'Add another option'}
              </span>
            </button>
          )}

          {formErrors.options && <p className="text-error text-sm">{formErrors.options.message}</p>}
        </div>
      )}

      {/* Pass remaining settings to separate component */}
      <PollFormSettings
        form={form}
        handleMaxChoicesSelect={handleMaxChoicesSelect}
        handleRankingOrderUpdate={handleRankingOrderUpdate}
      />
    </div>
  );
}
