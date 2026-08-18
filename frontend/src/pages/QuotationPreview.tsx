import React from 'react';
import { useParams } from 'react-router-dom';
import { QuotationView } from '../components/quotation/QuotationView';

export function QuotationPreview() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <QuotationView endpoint={`/custom-tours/my-requests/${id}`} backHref={`/my-tours/requests/${id}`} />;
}
