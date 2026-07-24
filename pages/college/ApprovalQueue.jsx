import { Check, GraduationCap, ShieldCheck, UserRoundCheck, X } from 'lucide-react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import api from '../../services/api';
import { getApiErrorMessage } from '../../services/apiError';
import { addToast } from '../../store/slices/toastSlice';
import useApiResource from '../../hooks/useApiResource';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';

export default function ApprovalQueue() {
  const dispatch = useDispatch();
  const [processing, setProcessing] = useState('');
  const [actionError, setActionError] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const { data: pending = [], setData: setPending, loading, error, retry } = useApiResource(
    async () => (await api.get('/colleges/pending')).data,
    [],
  );

  const handle = async (applicant, action) => {
    setProcessing(`${applicant._id}:${action}`);
    setActionError('');
    try {
      await api.put(`/colleges/${action}/${applicant._id}`);
      setPending((current) => current.filter((item) => item._id !== applicant._id));
      dispatch(addToast({ type: 'approval', message: `${applicant.name} was ${action === 'approve' ? 'approved' : 'removed from the queue'}.` }));
      setRejectTarget(null);
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, `The registration could not be ${action}d.`));
    } finally {
      setProcessing('');
    }
  };

  return (
    <div className="page-container max-w-6xl">
      <PageHeader
        eyebrow="Institution administration"
        title="Pending approvals"
        description="Verify each applicant against your institutional records before granting community access."
      >
        <div className="mt-3"><Badge tone={pending.length ? 'amber' : 'green'}>{pending.length} pending</Badge></div>
      </PageHeader>

      {actionError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{actionError}</div>}

      {loading ? (
        <div className="space-y-4">{[0, 1, 2].map((item) => <Card key={item} className="p-5"><div className="flex gap-3"><Skeleton className="h-12 w-12" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-56" /></div></div></Card>)}</div>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={retry} /></Card>
      ) : pending.length === 0 ? (
        <Card><EmptyState icon={UserRoundCheck} title="All caught up" description="There are no student or alumni registrations waiting for review." /></Card>
      ) : (
        <div className="space-y-4">
          {pending.map((applicant) => (
            <Card key={applicant._id} className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <Avatar name={applicant.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-extrabold text-slate-950">{applicant.name}</h2>
                      <Badge tone={applicant.role === 'alumni' ? 'purple' : 'blue'}>
                        {applicant.role === 'alumni' && <GraduationCap className="h-3 w-3" />}
                        {applicant.role}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500">{applicant.email}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      {applicant.graduationYear && <span>Class of {applicant.graduationYear}</span>}
                      <span>Registered {new Date(applicant.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button variant="danger" onClick={() => setRejectTarget(applicant)} disabled={Boolean(processing)}>
                    <X className="h-4 w-4" /> Reject
                  </Button>
                  <Button variant="success" onClick={() => handle(applicant, 'approve')} loading={processing === `${applicant._id}:approve`} disabled={Boolean(processing) && processing !== `${applicant._id}:approve`}>
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-6 border-indigo-200 bg-indigo-50/60 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-indigo-600" />
          <p className="text-sm leading-6 text-indigo-800">Approval grants the applicant verified status and moves them into the matching approved student or alumni list. Rejection removes the queue item but does not delete the User account.</p>
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        onConfirm={() => handle(rejectTarget, 'reject')}
        title="Reject this registration?"
        description={`${rejectTarget?.name || 'This applicant'} will be notified that the college did not approve the registration. This does not delete their account.`}
        confirmLabel="Reject registration"
        loading={processing === `${rejectTarget?._id}:reject`}
      />
    </div>
  );
}
