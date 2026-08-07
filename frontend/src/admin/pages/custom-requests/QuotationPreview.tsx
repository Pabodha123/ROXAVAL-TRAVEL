import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { apiGetOne } from '../../../lib/api';
import { QuotationView, type QuotationRequest } from '../../../components/quotation/QuotationView';

export function AdminQuotationPreview() {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<QuotationRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiGetOne<QuotationRequest>(`/custom-tours/${id}`).then(setRequest).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="grid min-h-screen place-items-center bg-cream"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;
  if (!request?.itinerary) return <div className="grid min-h-screen place-items-center bg-cream text-sm text-forest/50">No itinerary has been built for this request yet.</div>;

  return <QuotationView request={request} backHref={`/admin/custom-requests/${id}`} />;
}
