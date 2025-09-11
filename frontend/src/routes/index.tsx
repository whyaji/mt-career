import { createFileRoute } from '@tanstack/react-router';

import { NotFoundScreenComponent } from '@/components/NotFoundScreenComponent';

export const Route = createFileRoute('/')({
  component: Index,
  errorComponent: NotFoundScreenComponent,
});

function Index() {
  return <div>Index</div>;
}
