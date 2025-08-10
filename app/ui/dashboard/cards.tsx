import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '../fonts';
import { fetchCardData } from '@/app/lib/data';
import { Suspense } from 'react';
import { CardSkeleton } from '../skeletons';

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export default async function CardWrapper() {
  return (
    <>
      <Suspense fallback={<CardSkeleton />}>
        <TotalPaidInvoices />
      </Suspense>
      <Suspense fallback={<CardSkeleton />}>
        <TotalPendingInvoices />
      </Suspense>
      <Suspense fallback={<CardSkeleton />}>
        <NumberOfInvoices />
      </Suspense>
      <Suspense fallback={<CardSkeleton />}>
        <NumberOfCustomers />
      </Suspense>
    </>
  );
}

export async function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'invoices' | 'customers' | 'pending' | 'collected';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}

export async function TotalPaidInvoices() {
  const { totalPaidInvoices } = await fetchCardData();
  await new Promise((resolve) => setTimeout(resolve, 50));
  return <Card title="Collected" value={totalPaidInvoices} type="collected" />;
}
export async function TotalPendingInvoices() {
  const { totalPendingInvoices } = await fetchCardData();
  await new Promise((resolve) => setTimeout(resolve, 80));
  return (
    <Card title="Collected" value={totalPendingInvoices} type="collected" />
  );
}
export async function NumberOfInvoices() {
  const { numberOfInvoices } = await fetchCardData();
  await new Promise((resolve) => setTimeout(resolve, 100));
  return <Card title="Collected" value={numberOfInvoices} type="collected" />;
}
export async function NumberOfCustomers() {
  const { numberOfCustomers } = await fetchCardData();
  await new Promise((resolve) => setTimeout(resolve, 120));
  return <Card title="Collected" value={numberOfCustomers} type="collected" />;
}
