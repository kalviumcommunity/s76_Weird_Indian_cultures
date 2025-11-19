import CultureForm from '@/components/forms/CultureForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFormPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#FF9933] via-white to-[#138808] py-10">
      <CultureForm itemId={id} />
    </div>
  );
}
