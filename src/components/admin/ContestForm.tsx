'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { Timestamp } from 'firebase/firestore';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ImageUpload from '@/components/ui/ImageUpload';
import { Contest, ContestInput } from '@/types';
import { createContest, updateContest } from '@/lib/db/contests';
import {
  uploadContestHeaderImage,
  deleteEntryImage,
  resizeImage,
} from '@/lib/storage';
import {
  TIME_ZONE_OPTIONS,
  getBrowserTimeZone,
  zonedInputToDate,
  dateToZonedInput,
} from '@/lib/timezone';
import { useToast } from '@/context/ToastContext';

interface ContestFormProps {
  contest?: Contest;
  onSuccess: () => void;
  onCancel: () => void;
}

type FormErrors = Partial<
  Record<
    'submissionStart' | 'submissionEnd' | 'votingStart' | 'votingEnd',
    string
  >
>;

export default function ContestForm({
  contest,
  onSuccess,
  onCancel,
}: ContestFormProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const initialTimeZone = contest?.timeZone || getBrowserTimeZone();
  const toInput = (ts?: Timestamp) =>
    ts ? dateToZonedInput(ts.toDate(), initialTimeZone) : '';

  const [year, setYear] = useState(contest?.year || new Date().getFullYear());
  const [name, setName] = useState(contest?.name || '');
  const [timeZone, setTimeZone] = useState(initialTimeZone);
  const [submissionStart, setSubmissionStart] = useState(
    toInput(contest?.submissionStart)
  );
  const [submissionEnd, setSubmissionEnd] = useState(
    toInput(contest?.submissionEnd)
  );
  const [votingStart, setVotingStart] = useState(toInput(contest?.votingStart));
  const [votingEnd, setVotingEnd] = useState(toInput(contest?.votingEnd));
  const [introMessage, setIntroMessage] = useState(contest?.introMessage || '');
  const [instructionsAndRules, setInstructionsAndRules] = useState(
    contest?.instructionsAndRules || ''
  );
  const [contactInfo, setContactInfo] = useState(contest?.contactInfo || '');
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [removeHeader, setRemoveHeader] = useState(false);
  const [isActive, setIsActive] = useState(contest?.isActive || false);

  // Make sure a time zone saved on the contest is selectable even if it isn't in the preset list
  const timeZoneOptions = TIME_ZONE_OPTIONS.some((o) => o.value === timeZone)
    ? TIME_ZONE_OPTIONS
    : [{ value: timeZone, label: timeZone }, ...TIME_ZONE_OPTIONS];

  const existingHeaderUrl =
    contest?.headerImageUrl && !removeHeader ? contest.headerImageUrl : null;

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!submissionStart) newErrors.submissionStart = 'Submission start is required';
    if (!submissionEnd) newErrors.submissionEnd = 'Submission end is required';
    if (!votingStart) newErrors.votingStart = 'Voting start is required';
    if (!votingEnd) newErrors.votingEnd = 'Voting end is required';

    // datetime-local values in the same zone compare correctly as strings
    if (submissionStart && submissionEnd && submissionEnd <= submissionStart) {
      newErrors.submissionEnd = 'Submission end must be after submission start';
    }
    if (votingStart && votingEnd && votingEnd <= votingStart) {
      newErrors.votingEnd = 'Voting end must be after voting start';
    }

    return newErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const toTimestamp = (value: string) =>
        Timestamp.fromDate(zonedInputToDate(value, timeZone));

      const contestData: ContestInput = {
        year,
        name,
        timeZone,
        submissionStart: toTimestamp(submissionStart),
        submissionEnd: toTimestamp(submissionEnd),
        votingStart: toTimestamp(votingStart),
        votingEnd: toTimestamp(votingEnd),
        introMessage: introMessage.trim(),
        instructionsAndRules: instructionsAndRules.trim(),
        contactInfo: contactInfo.trim(),
        headerImageUrl: removeHeader ? null : contest?.headerImageUrl ?? null,
        headerImagePath: removeHeader ? null : contest?.headerImagePath ?? null,
        isActive,
      };

      // A new contest needs an ID before its header image can be uploaded
      const contestId = contest
        ? contest.id
        : await createContest(contestData);

      if (headerFile) {
        const resized = await resizeImage(headerFile, 2400);
        const { url, path } = await uploadContestHeaderImage(contestId, resized);
        contestData.headerImageUrl = url;
        contestData.headerImagePath = path;
      }

      if (contest) {
        await updateContest(contestId, contestData);
      } else if (headerFile) {
        await updateContest(contestId, {
          headerImageUrl: contestData.headerImageUrl,
          headerImagePath: contestData.headerImagePath,
        });
      }

      // Clean up the old header image once it has been replaced or removed
      if (
        contest?.headerImagePath &&
        contest.headerImagePath !== contestData.headerImagePath
      ) {
        try {
          await deleteEntryImage(contest.headerImagePath);
        } catch (error) {
          console.warn('Failed to delete old header image:', error);
        }
      }

      showToast(
        contest ? 'Contest updated successfully' : 'Contest created successfully',
        'success'
      );
      onSuccess();
    } catch (error) {
      console.error('Error saving contest:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to save contest',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Year"
        type="number"
        value={year}
        onChange={(e) => setYear(parseInt(e.target.value))}
        required
        min={2020}
        max={2100}
        disabled={loading}
      />

      <Input
        label="Contest Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="2024 Pumpkin Carving Contest"
        required
        maxLength={100}
        disabled={loading}
      />

      <Select
        label="Time Zone"
        value={timeZone}
        onChange={(e) => setTimeZone(e.target.value)}
        options={timeZoneOptions}
        required
        disabled={loading}
      />
      <p className="-mt-4 text-xs text-gray-500">
        All dates and times below are in this time zone and are shown to visitors with it.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Submission Start Date"
          type="datetime-local"
          value={submissionStart}
          onChange={(e) => setSubmissionStart(e.target.value)}
          error={errors.submissionStart}
          required
          disabled={loading}
        />
        <Input
          label="Submission End Date"
          type="datetime-local"
          value={submissionEnd}
          onChange={(e) => setSubmissionEnd(e.target.value)}
          error={errors.submissionEnd}
          required
          disabled={loading}
        />
        <Input
          label="Voting Start Date"
          type="datetime-local"
          value={votingStart}
          onChange={(e) => setVotingStart(e.target.value)}
          error={errors.votingStart}
          required
          disabled={loading}
        />
        <Input
          label="Voting End Date"
          type="datetime-local"
          value={votingEnd}
          onChange={(e) => setVotingEnd(e.target.value)}
          error={errors.votingEnd}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-3">
        {existingHeaderUrl && !headerFile ? (
          <>
            <label className="block text-sm font-medium text-gray-700">
              Home Page Header
            </label>
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={existingHeaderUrl}
                alt="Current Home page header"
                fill
                className="object-contain"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRemoveHeader(true)}
              disabled={loading}
            >
              Remove / Replace Header
            </Button>
          </>
        ) : (
          <ImageUpload
            label="Home Page Header"
            required={false}
            onImageSelect={setHeaderFile}
          />
        )}
      </div>

      <Textarea
        label="Introductory Message"
        value={introMessage}
        onChange={(e) => setIntroMessage(e.target.value)}
        rows={4}
        maxLength={5000}
        placeholder="Welcome to our annual pumpkin carving contest!"
        disabled={loading}
      />

      <Textarea
        label="Instructions and Rules"
        value={instructionsAndRules}
        onChange={(e) => setInstructionsAndRules(e.target.value)}
        rows={6}
        maxLength={10000}
        placeholder="How to enter, what's allowed, how voting works..."
        disabled={loading}
      />

      <Textarea
        label="Contact Information"
        value={contactInfo}
        onChange={(e) => setContactInfo(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="Questions? Email pumpkins@example.com"
        disabled={loading}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
          disabled={loading}
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Set as active contest (only one contest can be active at a time)
        </label>
      </div>

      <div className="flex gap-4">
        <Button type="submit" loading={loading} disabled={loading} className="flex-1">
          {contest ? 'Update Contest' : 'Create Contest'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
