import CreatePost from '@/components/forms/CreatePost';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFormPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <CreatePost postId={id} />
    </div>
  );
}
