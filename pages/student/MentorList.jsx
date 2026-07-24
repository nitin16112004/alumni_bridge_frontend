import {
  Building2,
  Search,
  SlidersHorizontal,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useApiResource from '../../hooks/useApiResource';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';

export default function MentorList() {
  const { user } = useSelector((state) => state.auth);
  const collegeId = typeof user?.collegeId === 'object' ? user.collegeId?._id : user?.collegeId;
  const [expertise, setExpertise] = useState('');
  const [company, setCompany] = useState('');
  const [availability, setAvailability] = useState('available');
  const debouncedExpertise = useDebouncedValue(expertise);
  const debouncedCompany = useDebouncedValue(company);

  const { data: mentors = [], loading, error, retry } = useApiResource(async () => {
    const { data } = await api.get('/mentors', {
      params: {
        ...(collegeId ? { collegeId } : {}),
        ...(debouncedExpertise.trim() ? { expertise: debouncedExpertise.trim() } : {}),
        ...(debouncedCompany.trim() ? { company: debouncedCompany.trim() } : {}),
      },
    });
    if (availability === 'available') return data.filter((mentor) => mentor.availability);
    if (availability === 'unavailable') return data.filter((mentor) => !mentor.availability);
    return data;
  }, [collegeId, debouncedExpertise, debouncedCompany, availability]);

  const hasFilters = expertise || company || availability !== 'available';
  const clearFilters = () => {
    setExpertise('');
    setCompany('');
    setAvailability('available');
  };

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Mentor discovery"
        title="Find the right alumni mentor"
        description="Search verified alumni from your college by expertise, company, and current availability."
        actions={hasFilters && <Button variant="ghost" onClick={clearFilters}><X className="h-4 w-4" /> Clear filters</Button>}
      />

      <Card className="mb-6 p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_220px]">
          <label className="relative block">
            <span className="sr-only">Search expertise</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <input
              value={expertise}
              onChange={(event) => setExpertise(event.target.value)}
              placeholder="Expertise, skill, or topic"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <label className="relative block">
            <span className="sr-only">Search company</span>
            <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Company"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <label className="relative block">
            <span className="sr-only">Availability</span>
            <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="available">Available now</option>
              <option value="all">All mentors</option>
              <option value="unavailable">Currently unavailable</option>
            </select>
          </label>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400"><Sparkles className="h-3.5 w-3.5" /> Searches wait briefly while you type, so the service is not called on every keystroke.</p>
      </Card>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <Card key={item} className="p-5">
              <div className="flex items-center gap-3"><Skeleton className="h-12 w-12 rounded-2xl" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/2" /></div></div>
              <Skeleton className="mt-5 h-16" />
              <Skeleton className="mt-4 h-7 w-4/5" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={retry} /></Card>
      ) : mentors.length === 0 ? (
        <Card>
          <EmptyState
            icon={UsersRound}
            title="No mentors match these filters"
            description="Try a broader expertise, remove the company filter, or include mentors who are currently unavailable."
            action={<Button variant="secondary" onClick={clearFilters}>Reset filters</Button>}
          />
        </Card>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600">{mentors.length} mentor{mentors.length === 1 ? '' : 's'} found</p>
            <p className="hidden text-xs text-slate-400 sm:block">Showing backend-supported results; pagination is not available yet.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mentors.map((mentor) => (
              <Link key={mentor._id} to={`/mentors/${mentor._id}`} className="group rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
                <Card className="flex h-full flex-col p-5 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-blue-200 group-hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <Avatar name={mentor.userId?.name} src={mentor.userId?.profilePhoto} size="lg" />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-base font-extrabold text-slate-950 group-hover:text-blue-700">{mentor.userId?.name || 'Alumni mentor'}</h2>
                      <p className="mt-1 truncate text-sm text-slate-500">{mentor.role || 'Mentor'}{mentor.company ? ` at ${mentor.company}` : ''}</p>
                      {mentor.collegeId?.name && <p className="mt-1 truncate text-xs text-slate-400">{mentor.collegeId.name}</p>}
                    </div>
                    <Badge tone={mentor.availability ? 'green' : 'slate'}>{mentor.availability ? 'Available' : 'Unavailable'}</Badge>
                  </div>
                  <p className="mt-5 line-clamp-3 min-h-[3.75rem] text-sm leading-5 text-slate-600">{mentor.bio || 'Open the profile to learn more about this mentor’s background and focus areas.'}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {mentor.expertise?.slice(0, 4).map((tag) => <Badge key={tag} tone="blue">{tag}</Badge>)}
                    {mentor.expertise?.length > 4 && <Badge>+{mentor.expertise.length - 4}</Badge>}
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-semibold text-slate-500">{mentor.yearsOfExperience || 0} years experience</span>
                    <span className="text-xs font-bold text-blue-600">View profile →</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
