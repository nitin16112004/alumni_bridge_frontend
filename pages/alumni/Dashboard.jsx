import {
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MessageCircleMore,
  MessagesSquare,
  PlusCircle,
  UserCheck,
  UsersRound,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useApiResource from '../../hooks/useApiResource';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import StatCard from '../../components/ui/StatCard';

const actions = [
  { to: '/alumni/mentor', icon: GraduationCap, label: 'Mentor profile', description: 'Shape how students discover your experience.' },
  { to: '/alumni/requests', icon: UserCheck, label: 'Review requests', description: 'Respond to students looking for guidance.' },
  { to: '/jobs', icon: BriefcaseBusiness, label: 'Share an opportunity', description: 'Post a role for your alumni community.' },
  { to: '/events', icon: CalendarDays, label: 'Create an event', description: 'Bring your network together around a topic.' },
];

export default function AlumniDashboard() {
  const { user } = useSelector((state) => state.auth);
  const collegeId = typeof user?.collegeId === 'object' ? user.collegeId?._id : user?.collegeId;
  const { data, loading, error, retry } = useApiResource(async () => {
    const [requests, jobs, events, discussions, mentor] = await Promise.all([
      api.get('/mentorship/received'),
      api.get('/jobs', { params: collegeId ? { collegeId } : {} }),
      api.get('/events', { params: collegeId ? { collegeId } : {} }),
      api.get('/discussions', { params: collegeId ? { collegeId } : {} }),
      api.get('/mentors/me').catch((requestError) => {
        if (requestError.response?.status === 404) return { data: null };
        throw requestError;
      }),
    ]);
    return {
      requests: requests.data,
      jobs: jobs.data,
      events: events.data,
      discussions: discussions.data,
      mentor: mentor.data,
    };
  }, [collegeId]);

  const pending = data?.requests?.filter((request) => request.status === 'pending') || [];
  const accepted = data?.requests?.filter((request) => request.status === 'accepted') || [];
  const ownJobs = data?.jobs?.filter((job) => String(job.postedBy?._id || job.postedBy) === String(user?._id)) || [];
  const upcomingEvents = data?.events?.filter((event) => new Date(event.date) >= new Date()).slice(0, 3) || [];

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Alumni workspace"
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'alumni'}`}
        description="Your experience can unlock a student’s next step. Review requests, share opportunities, and stay close to your community."
      >
        <div className="mt-3">
          {user?.isApproved ? (
            <Badge tone="green"><CheckCircle2 className="h-3.5 w-3.5" /> Verified alumni</Badge>
          ) : (
            <Badge tone="amber"><Clock3 className="h-3.5 w-3.5" /> Verification pending</Badge>
          )}
        </div>
      </PageHeader>

      {!user?.isApproved && (
        <Card className="mb-6 border-amber-200 bg-amber-50/80 p-4">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-bold text-amber-900">Your alumni status is awaiting college verification</p>
              <p className="mt-1 text-sm leading-6 text-amber-700">You can complete your profile now. Posting and contribution actions are held until verification is complete.</p>
            </div>
          </div>
        </Card>
      )}

      {error ? (
        <Card><ErrorState message={error} onRetry={retry} /></Card>
      ) : (
        <>
          <section aria-label="Alumni overview" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <StatCard loading={loading} icon={BellRing} label="Pending requests" value={pending.length} tone="amber" />
            <StatCard loading={loading} icon={UsersRound} label="Active mentees" value={accepted.length} tone="green" />
            <StatCard loading={loading} icon={BriefcaseBusiness} label="Jobs posted" value={ownJobs.length} tone="blue" />
            <StatCard loading={loading} icon={CalendarDays} label="Upcoming events" value={upcomingEvents.length} tone="purple" />
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {actions.map(({ to, icon: Icon, label, description }) => (
              <Link key={to} to={to} className="group rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
                <Card className="h-full p-5 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-blue-200 group-hover:shadow-md">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Icon className="h-5 w-5" /></span>
                  <h2 className="mt-4 text-sm font-extrabold text-slate-950">{label}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-600">Open <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
                </Card>
              </Link>
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-950">Mentorship requests</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Students currently waiting for your response</p>
                </div>
                <Link to="/alumni/requests" className="text-xs font-bold text-blue-600">View all</Link>
              </div>
              {loading ? (
                <div className="space-y-3 p-5">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-16" />)}</div>
              ) : pending.length === 0 ? (
                <EmptyState compact icon={UserCheck} title="No requests waiting" description={data?.mentor ? 'New student requests will appear here.' : 'Create your mentor profile so students can discover you.'} action={!data?.mentor && <Button onClick={() => window.location.assign('/alumni/mentor')} size="sm"><PlusCircle className="h-4 w-4" /> Create mentor profile</Button>} />
              ) : (
                <div className="divide-y divide-slate-100">
                  {pending.slice(0, 4).map((request) => (
                    <Link to="/alumni/requests" key={request._id} className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50">
                      <Avatar name={request.studentId?.name} src={request.studentId?.profilePhoto} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-slate-800">{request.studentId?.name || 'Student'}</span>
                        <span className="mt-0.5 block truncate text-xs text-slate-500">{request.message || 'Requested mentorship'}</span>
                      </span>
                      <Badge tone="amber">Pending</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            <Card className={`overflow-hidden p-6 ${data?.mentor ? 'border-indigo-200 bg-gradient-to-br from-indigo-950 to-[#111b44] text-white' : ''}`}>
              {loading ? (
                <div className="space-y-4"><Skeleton className="h-12 w-12" /><Skeleton className="h-6 w-48" /><Skeleton className="h-16" /></div>
              ) : data?.mentor ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-200"><GraduationCap className="h-5 w-5" /></span>
                    <Badge tone={data.mentor.availability ? 'green' : 'slate'}>{data.mentor.availability ? 'Accepting requests' : 'Unavailable'}</Badge>
                  </div>
                  <h2 className="mt-5 text-lg font-extrabold">Your mentor profile is live</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{data.mentor.role || 'Alumni mentor'}{data.mentor.company ? ` at ${data.mentor.company}` : ''} · {data.mentor.expertise?.length || 0} expertise areas</p>
                  <Link to="/alumni/mentor" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-indigo-800 transition hover:bg-blue-50">Update profile <ArrowRight className="h-4 w-4" /></Link>
                </>
              ) : (
                <>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700"><GraduationCap className="h-5 w-5" /></span>
                  <h2 className="mt-5 text-lg font-extrabold text-slate-950">Become discoverable as a mentor</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Add your role, company, expertise, and availability so students can ask for relevant guidance.</p>
                  <Link to="/alumni/mentor" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700">Create mentor profile <ArrowRight className="h-4 w-4" /></Link>
                </>
              )}
            </Card>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-950"><CalendarDays className="h-4 w-4 text-indigo-600" /> Upcoming events</h2>
                <Link to="/events" className="text-xs font-bold text-blue-600">View calendar</Link>
              </div>
              {upcomingEvents.length === 0 && !loading ? (
                <EmptyState compact icon={CalendarDays} title="No upcoming events" description="Create or join the next community event." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {upcomingEvents.map((event) => (
                    <Link to="/events" key={event._id} className="block px-5 py-4 transition hover:bg-slate-50">
                      <p className="truncate text-sm font-bold text-slate-800">{event.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{new Date(event.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} · {event.location || 'Location TBA'}</p>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-950"><MessagesSquare className="h-4 w-4 text-indigo-600" /> Community conversations</h2>
                <Link to="/discussions" className="text-xs font-bold text-blue-600">Join in</Link>
              </div>
              {!loading && data?.discussions?.length === 0 ? (
                <EmptyState compact icon={MessageCircleMore} title="No discussions yet" description="Start a useful conversation with your network." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {data?.discussions?.slice(0, 3).map((discussion) => (
                    <Link to={`/discussions/${discussion._id}`} key={discussion._id} className="block px-5 py-4 transition hover:bg-slate-50">
                      <p className="truncate text-sm font-bold text-slate-800">{discussion.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{discussion.comments?.length || 0} comments · {discussion.upvotes?.length || 0} upvotes</p>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
