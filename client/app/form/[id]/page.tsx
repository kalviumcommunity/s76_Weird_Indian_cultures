import CultureForm from '@/components/forms/CultureForm';

interface PageProps {
  params: { id: string };
}

export default function EditFormPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#FF9933] via-white to-[#138808] py-10">
      <CultureForm itemId={params.id} />
    </div>
  );
}
