// src/components/Builder/PersonalInfoForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBuilderStore } from '@/store/builderStore';
import {
    personalInfoSchema,
    type PersonalInfoInput,
} from '@/forms/personalInfoSchema';
import { Input } from '@/components/Shared';

export const PersonalInfoForm: React.FC = () => {
    const { profile, updateProfile } = useBuilderStore();

    const {
        register,
        formState: { errors },
    } = useForm<PersonalInfoInput>({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: {
            full_name: profile?.full_name ?? '',
            headline: profile?.headline ?? '',
            email: profile?.email ?? '',
            phone: profile?.phone ?? '',
            city: profile?.city ?? '',
            bio: profile?.bio ?? '',
            github_url: profile?.github_url ?? '',
            linkedin_url: profile?.linkedin_url ?? '',
            twitter_url: profile?.twitter_url ?? '',
            website_url: profile?.website_url ?? '',
        },
        mode: 'onBlur',
    });

    const handleFieldChange = (field: string, value: string) => {
        updateProfile({ [field]: value });
    };

    return (
        <div className="space-y-4">
            <Input
                {...register('full_name')}
                label="Full Name"
                error={errors.full_name?.message}
                onChange={(e) => handleFieldChange('full_name', e.target.value)}
            />
            <Input
                {...register('headline')}
                label="Headline"
                error={errors.headline?.message}
                onChange={(e) => handleFieldChange('headline', e.target.value)}
            />
            <Input
                {...register('email')}
                label="Email"
                type="email"
                error={errors.email?.message}
                onChange={(e) => handleFieldChange('email', e.target.value)}
            />
            <Input
                {...register('bio')}
                label="Bio"
                error={errors.bio?.message}
                onChange={(e) => handleFieldChange('bio', e.target.value)}
            />
        </div>
    );
};
