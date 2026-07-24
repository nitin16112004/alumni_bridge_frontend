import {
  ArrowRight,
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  MessageCircleMore,
  MessagesSquare,
  Sparkles,
  UserCheck,
  UsersRound,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useApiResource from '../../hooks/useApiResource';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import StatCard from '../../components/ui/StatCard';

const quickActions = [
  { to: '/mentors', icon: UsersRound, label: 'Find a mentor', description: 'Discover alumni with the experience you need.' },
  { to: '/mentorship', icon: UserCheck, label: 'Track requests', description: 'See pending and accepted mentorships.' },
  { to: '/jobs', icon: BriefcaseBusiness, label: 'Explore opportunities', description: 'Browse jobs and internships from alumni.' },
  { to: '/ai-assistant', icon: Bot, label: 'Ask the career assistant', description: 'Turn a career question into a clear next step.' },
];

function profileCompletion(user) {
  const fields = ['name', 'email', 'bio', 'skills', 'graduationYear'];
  const complete = fields.filter((field) => Array.isArray(user?.[field]) ? user[field].length > 0 : Boolean(user?.[field])).length;
  return Math.round((complete / fields.length) * 100);
}

export default function StudentDashboard() {
  const { user } = useSelector((state) => state.auth);
  const notifications = useSelector((state) => state.notifications.items);
  const collegeId = typeof user?.collegeId === 'object' ? user.collegeId?._id : user?.collegeId;

  const { data, loading, error, retry } = useApiResource(async () => {
    const collegeParams = collegeId ? { collegeId } : {};
    const [mentors, requests, jobs, events, discussions] = await Promise.all([
      api.get('/mentors', { params: collegeParams }),
      api.get('/mentorship/sent'),
      api.get('/jobs', { params: collegeParams }),
      api.get('/events', { params: collegeParams }),
      api.get('/discussions', { params: collegeParams }),
    ]);
    return {
      mentors: mentors.data,
      requests: requests.data,
      jobs: jobs.data,
      events: events.data,
      discussions: discussions.data,
    };
  }, [collegeId]);

  const upcomingEvents = data?.events
    ?.filter((event) => new Date(event.date) >= new Date())
    .slice(0, 3) || [];
  const recentJobs = data?.jobs?.slice(0, 3) || [];
  const recentDiscussions = data?.discussions?.slice(0, 3) || [];
  const accepted = data?.requests?.filter((request) => request.status === 'accepted').length || 0;
  const completion = profileCompletion(user);

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Student workspace"
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
        description="Keep your momentum going with mentors, opportunities, and conversations from your community."
        actions={(
          <Button variant="secondary" onClick={() => retry()}>
            <Sparkles className="h-4 w-4" /> Refresh overview
          </Button>
        )}
      >
        <div className="mt-3">
          {user?.isApproved ? (
            <Badge tone="green"><CheckCircle2 className="h-3.5 w-3.5" /> College verified</Badge>
          ) : (
            <Badge tone="amber"><Clock3 className="h-3.5 w-3.5" /> Approval pending</Badge>
          )}
        </div>
      </PageHeader>

      {!user?.isApproved && (
        <Card className="mb-6 border-amber-200 bg-amber-50/80 p-4">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-bold text-amber-900">Your college is reviewing your registration</p>
              <p className="mt-1 text-sm leading-6 text-amber-700">You can explore Alumni Bridge now. Some contribution actions remain unavailable until your institution approves the account.</p>
            </div>
          </div>
        </Card>
      )}

      {error ? (
        <Card><ErrorState message={error} onRetry={retry} /></Card>
      ) : (
        <>
          <section aria-label="Student overview" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <StatCard loading={loading} icon={UsersRound} label="Available mentors" value={data?.mentors?.length || 0} tone="blue" />
            <StatCard loading={loading} icon={UserCheck} label="Accepted mentors" value={accepted} tone="green" />
            <StatCard loading={loading} icon={BriefcaseBusiness} label="Open opportunities" value={data?.jobs?.length || 0} tone="purple" />
            <StatCard loading={loading} icon={CalendarDays} label="Upcoming events" value={upcomingEvents.length} tone="amber" />
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map(({ to, icon: Icon, label, description }) => (
              <Link key={to} to={to} className="group rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
                <Card className="h-full p-5 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-blue-200 group-hover:shadow-md">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="mt-4 text-sm font-extrabold text-slate-950">{label}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-600">Open <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
                </Card>
              </Link>
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-950">Upcoming events</h2>
                    <p className="mt-0.5 text-xs text-slate-500">What’s happening in your community</p>
                  </div>
                  <Link to="/events" className="text-xs font-bold text-blue-600 hover:text-blue-700">View all</Link>
                </div>
                {loading ? (
                  <div className="space-y-3 p-5">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-16" />)}</div>
                ) : upcomingEvents.length === 0 ? (
                  <EmptyState compact icon={CalendarDays} title="No upcoming events" description="New community events will appear here." />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {upcomingEvents.map((event) => (
                      <Link to="/events" key={event._id} className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50">
                        <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                          <span className="text-[9px] font-bold uppercase">{new Date(event.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                          <span className="text-sm font-extrabold">{new Date(event.date).getDate()}</span>
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-slate-800">{event.title}</span>
                          <span className="mt-0.5 block truncate text-xs text-slate-500">{event.location || 'Location to be announced'}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-950">Recent opportunities</h2>
                    <p className="mt-0.5 text-xs text-slate-500">Jobs and internships from alumni</p>
                  </div>
                  <Link to="/jobs" className="text-xs font-bold text-blue-600 hover:text-blue-700">View all</Link>
                </div>
                {loading ? (
                  <div className="space-y-3 p-5">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-16" />)}</div>
                ) : recentJobs.length === 0 ? (
                  <EmptyState compact icon={BriefcaseBusiness} title="No opportunities yet" description="Alumni-posted roles will appear here." />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentJobs.map((job) => (
                      <Link to="/jobs" key={job._id} className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                          <BriefcaseBusiness className="h-[18px] w-[18px]" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-slate-800">{job.title}</span>
                          <span className="mt-0.5 block truncate text-xs text-slate-500">{job.company} · {job.type}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="overflow-hidden bg-[#111b44] p-5 text-white">
                <Bot className="h-6 w-6 text-blue-200" />
                <h2 className="mt-4 text-lg font-extrabold">Turn uncertainty into a plan</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">Ask the AI career assistant for a skill roadmap, interview practice, or a way to approach a mentor.</p>
                <Link to="/ai-assistant" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-indigo-800 transition hover:bg-blue-50">
                  Start a conversation <ArrowRight className="h-4 w-4" />
                </Link>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-950">Profile strength</h2>
                    <p className="mt-1 text-xs text-slate-500">Complete profiles make introductions easier.</p>
                  </div>
                  <CircleUserRound className="h-5 w-5 text-blue-600" />
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500" style={{ width: `${completion}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{completion}% complete</span>
                  <Link to="/profile" className="text-xs font-bold text-blue-600">Improve profile</Link>
                </div>
              </Card>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-950"><MessagesSquare className="h-4 w-4 text-indigo-600" /> Recent discussions</h2>
                <Link to="/discussions" className="text-xs font-bold text-blue-600">Join the community</Link>
              </div>
              {loading ? (
                <div className="space-y-3 p-5">{[0, 1].map((item) => <Skeleton key={item} className="h-16" />)}</div>
              ) : recentDiscussions.length === 0 ? (
                <EmptyState compact icon={MessagesSquare} title="No discussions yet" description="Be the first to start a useful conversation." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentDiscussions.map((discussion) => (
                    <Link to={`/discussions/${discussion._id}`} key={discussion._id} className="block px-5 py-4 transition hover:bg-slate-50">
                      <p className="truncate text-sm font-bold text-slate-800">{discussion.title}</p>
                      <p className="mt-1 text-xs text-slate-500">by {discussion.authorId?.name || 'Community member'} · {discussion.comments?.length || 0} comments</p>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-950"><Bell className="h-4 w-4 text-indigo-600" /> Recent notifications</h2>
                <span className="text-xs font-semibold text-slate-400">{notifications.filter((item) => !item.isRead).length} unread</span>
              </div>
              {notifications.length === 0 ? (
                <EmptyState compact icon={Bell} title="Nothing new yet" description="Mentorship, event, job, and message updates will appear here." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification._id || notification.eventKey} className="flex items-start gap-3 px-5 py-4">
                      <MessageCircleMore className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <p className="text-sm leading-5 text-slate-600">{notification.message}</p>
                    </div>
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
