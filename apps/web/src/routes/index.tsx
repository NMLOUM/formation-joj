import { createFileRoute } from '@tanstack/react-router';
import { FreeTimePage } from '@/features/places/components/free-time-page';

export const Route = createFileRoute('/')({ component: FreeTimePage });
