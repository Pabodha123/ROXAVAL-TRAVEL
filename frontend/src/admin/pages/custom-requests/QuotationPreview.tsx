import React from 'react';
import { useParams } from 'react-router-dom';
import { QuotationView } from '../../../components/quotation/QuotationView';

export function AdminQuotationPreview() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <QuotationView endpoint={`/custom-tours/${id}`} backHref={`/admin/custom-requests/${id}`} />;
}
