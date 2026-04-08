// src/hooks/useAutoSave.ts
// Debounces Zustand draft state changes to Firestore via React Query mutations.
import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useBuilderStore } from '@/store/builderStore';
import * as profileService from '@/services/profileService';

const DEBOUNCE_MS = 800;

export const useAutoSave = () => {
  const store = useBuilderStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const mutation = useMutation({
    mutationFn: () => profileService.updateProfile(store.profile!.id, store.profile!),
    onMutate: () => store.setSaveStatus('saving'),
    onSuccess: () => {
      store.setSaveStatus('saved');
      store.setLastSavedAt(new Date());
    },
    onError: () => store.setSaveStatus('unsaved'),
  });

  useEffect(() => {
    if (!store.isDirty || !store.profile?.id) return;

    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      mutation.mutate();
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.profile, store.skills, store.projects, store.experiences, store.isDirty]);

  return { saveStatus: store.saveStatus };
};
