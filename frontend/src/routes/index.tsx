import { createFileRoute } from '@tanstack/react-router';

import FormScreen from '../feature/form/screen/FormScreen';

export const Route = createFileRoute('/')({
  component: FormScreen,
});
