import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  HeartPulse,
  School,
  ShieldCheck,
  UserCheck,
  UsersRound,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useApiResource from '../../hooks/useApiResource';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import StatCard from '../../components/ui/StatCard';

export default function CollegeDashboard() {
  const { currentEntity } = useSelector((state) => state.auth);
  const { data, loading, error, retry } = useApiResource(async () => {
    const [college, pending, events, health] = await Promise.all([
      api.get('/colleges/me'),
      api.get('/colleges/pending'),
      api.get('/events', { params: { collegeId: currentEntity?._id } }),
      api.get('/health'),
    ]);
    return {
      college: college.data,
      pending: pending.data,
      events: events.data,
      health: health.data,
    };
  }, [currentEntity?._id]);

  const college = data?.college || currentEntity;
  const upcomingEvents = data?.events?.filter((event) => new Date(event.date) >= new Date()).slice(0, 4) || [];

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Institution workspace"
        title={college?.name || 'College dashboard'}
        description="Review community membership and keep your institution’s alumni network moving."
      >
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone="indigo"><School className="h-3.5 w-3.5" /> College account</Badge>
          {college?.domain && <Badge tone="slate">{college.domain}</Badge>}
        </div>
      </PageHeader>

      {error ? (
        <Card><ErrorState message={error} onRetry={retry} /></Card>
      ) : (
        <>
          <section aria-label="Institution overview" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <StatCard loading={loading} icon={ShieldCheck} label="Pending approvals" value={data?.pending?.length || 0} tone="amber" />
            <StatCard loading={loading} icon={UsersRound} label="Approved students" value={college?.approvedStudents?.length || 0} tone="blue" />
            <StatCard loading={loading} icon={GraduationCap} label="Approved alumni" value={college?.approvedAlumni?.length || 0} tone="purple" />
            <StatCard loading={loading} icon={CalendarDays} label="Upcoming events" value={upcomingEvents.length} tone="green" />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-950">Registration approvals</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Verify students and alumni joining your community.</p>
                </div>
                <Link to="/college/approvals" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700">
                  Open approval queue <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3 p-5">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-16" />)}</div>
              ) : data?.pending?.length === 0 ? (
                <EmptyState compact icon={CheckCircle2} title="All registrations reviewed" description="New student and alumni registrations will appear here." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.pending.slice(0, 5).map((applicant) => (
                    <Link to="/college/approvals" key={applicant._id} className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-extrabold text-indigo-700">{applicant.name?.[0] || '?'}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-slate-800">{applicant.name}</span>
                        <span className="mt-0.5 block truncate text-xs text-slate-500">{applicant.email}</span>
                      </span>
                      <Badge tone={applicant.role === 'alumni' ? 'purple' : 'blue'}>{applicant.role}</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            <div className="space-y-6">
              <Card className="overflow-hidden bg-[#111b44] p-6 text-white">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-200"><UserCheck className="h-5 w-5" /></span>
                <h2 className="mt-5 text-lg font-extrabold">A trusted network starts with verification</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">Review registrations against your institutional records before approving access to the college community.</p>
                <Link to="/college/approvals" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-indigo-800 transition hover:bg-blue-50">
                  Review {data?.pending?.length || 0} pending <ArrowRight className="h-4 w-4" />
                </Link>
              </Card>

              <Card className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${data?.health?.status === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    <HeartPulse className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-slate-950">Platform status</p>
                    <p className="mt-0.5 text-xs text-slate-500">{data?.health?.status === 'ok' ? 'Backend services are responding' : 'Status unavailable'}</p>
                  </div>
                </div>
                <Badge tone={data?.health?.status === 'ok' ? 'green' : 'amber'}>{data?.health?.status === 'ok' ? 'Operational' : 'Checking'}</Badge>
              </Card>
            </div>
          </section>

          <Card className="mt-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-extrabold text-slate-950">Institution events</h2>
                <p className="mt-0.5 text-xs text-slate-500">Events currently associated with your college.</p>
              </div>
              <Link to="/events" className="text-xs font-bold text-blue-600">Browse events</Link>
            </div>
            {upcomingEvents.length === 0 && !loading ? (
              <EmptyState compact icon={CalendarDays} title="No upcoming institution events" description="College event creation requires a backend contract update; existing events will remain visible here." />
            ) : (
              <div className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                {upcomingEvents.map((event) => (
                  <Link to="/events" key={event._id} className="p-5 transition hover:bg-slate-50">
                    <p className="text-sm font-extrabold text-slate-800">{event.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(event.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    <p className="mt-2 text-sm text-slate-500">{event.location || 'Location to be announced'}</p>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
