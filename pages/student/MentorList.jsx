import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { Search, Building2, Star } from 'lucide-react';

export default function MentorList() {
  const { user } = useSelector((s) => s.auth);
  const collegeId = user?.collegeId;
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ expertise: '', company: '' });

  const fetchMentors = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.expertise) params.append('expertise', filters.expertise);
      if (filters.company) params.append('company', filters.company);
      if (collegeId) params.append('collegeId', collegeId);
      const { data } = await api.get(`/mentors?${params}`);
      setMentors(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filters, collegeId]);

  useEffect(() => {
    const task = setTimeout(fetchMentors, 0);
    return () => clearTimeout(task);
  }, [fetchMentors]);

  const updateFilter = (key, value) => {
    setLoading(true);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Find a Mentor</h1>
        <p className="text-gray-500 text-sm mt-1">Connect with verified alumni from your college</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Filter by expertise (e.g. Machine Learning)"
            value={filters.expertise}
            onChange={(e) => updateFilter('expertise', e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="relative flex-1">
          <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Filter by company"
            value={filters.company}
            onChange={(e) => updateFilter('company', e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : mentors.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Star size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="font-medium">No mentors found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <Link
              key={mentor._id}
              to={`/mentors/${mentor._id}`}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md border border-gray-100 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-lg">
                  {mentor.userId?.name?.[0] || 'M'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{mentor.userId?.name}</h3>
                  <p className="text-xs text-gray-500">{mentor.role} @ {mentor.company}</p>
                </div>
              </div>
              {mentor.expertise?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {mentor.expertise.slice(0, 3).map((tag) => (
                    <span key={tag} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-gray-600 text-sm line-clamp-2">{mentor.bio}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">{mentor.yearsOfExperience}y experience</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${mentor.availability ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {mentor.availability ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
