'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useArgumentsStore } from '@/store/argumentsStore';
import { perspectivesAPI } from '@/lib/api';
import { CrisisResources } from '@/components/CrisisResources';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface AIInsight {
  id: string;
  summary: string;
  common_ground: string[];
  disagreements: string[];
  root_causes: string[];
  suggestions: Array<{
    title: string;
    description: string;
    actionable_steps: string[];
  }>;
  communication_tips: string[];
  generated_at: string;
  model_used: string;
}

interface Perspective {
  id: string;
  argument_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export default function ArgumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const argumentId = params?.id as string;
  
  const { user } = useAuthStore();
  const { currentArgument, fetchArgumentById } = useArgumentsStore();
  const [perspectives, setPerspectives] = useState<Perspective[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPerspectiveForm, setShowPerspectiveForm] = useState(false);
  const [perspectiveContent, setPerspectiveContent] = useState('');
  const [safetyConcern, setSafetyConcern] = useState<any>(null);

  useEffect(() => {
    if (argumentId) {
      fetchArgumentById(argumentId);
      loadPerspectives();
      loadAIInsights();
    }
  }, [argumentId, fetchArgumentById]);

  const loadPerspectives = async () => {
    try {
      setIsLoading(true);
      const data = await perspectivesAPI.getByArgument(argumentId);
      setPerspectives(data);
    } catch (err: any) {
      setError('Failed to load perspectives');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAIInsights = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${API_URL}/api/ai/arguments/${argumentId}/insights`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAIInsights(response.data);
    } catch (err: any) {
      // Insights not found is OK (not analyzed yet)
      if (err.response?.status !== 404) {
        console.error('Failed to load AI insights:', err);
      }
    }
  };

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setSafetyConcern(null);
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_URL}/api/ai/arguments/${argumentId}/analyze`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await loadAIInsights();
      await fetchArgumentById(argumentId);
    } catch (err: any) {
      // Check if this is a safety concern error
      const errorDetail = err.response?.data?.detail;
      if (errorDetail && typeof errorDetail === 'object' && errorDetail.error === 'safety_concern') {
        setSafetyConcern({
          message: errorDetail.message,
          action: errorDetail.action
        });
      } else {
        setError(typeof errorDetail === 'string' ? errorDetail : (errorDetail?.message || 'AI analysis failed'));
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitPerspective = async () => {
    if (perspectiveContent.length < 10) {
      setError('Please provide at least 10 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await perspectivesAPI.create(argumentId, perspectiveContent);
      setPerspectiveContent('');
      setShowPerspectiveForm(false);
      await loadPerspectives();
      await fetchArgumentById(argumentId);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit perspective');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasUserSubmitted = perspectives.some(p => p.user_id === user?.id);
  const bothPerspectivesSubmitted = perspectives.length >= 2;

  if (!currentArgument) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Heka</h1>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Argument Header */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-3 sm:gap-0 mb-3 sm:mb-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{currentArgument.title}</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Category: {currentArgument.category} • Status: {currentArgument.status}
              </p>
            </div>
            <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded whitespace-nowrap ${
              currentArgument.priority === 'urgent' ? 'bg-red-100 text-red-800' :
              currentArgument.priority === 'high' ? 'bg-orange-100 text-orange-800' :
              currentArgument.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {currentArgument.priority}
            </span>
          </div>
        </div>

        {/* Perspectives Section */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Perspectives</h3>
          
          {isLoading ? (
            <p className="text-gray-600">Loading perspectives...</p>
          ) : perspectives.length === 0 ? (
            <p className="text-gray-600">No perspectives submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {perspectives.map((perspective) => (
                <div
                  key={perspective.id}
                  className={`border rounded-lg p-4 ${
                    perspective.user_id === user?.id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <p className="text-gray-900 whitespace-pre-wrap">{perspective.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {perspective.user_id === user?.id ? 'Your perspective' : 'Partner\'s perspective'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Submit Perspective Button */}
          {!hasUserSubmitted && !bothPerspectivesSubmitted && (
            <div className="mt-4">
              {!showPerspectiveForm ? (
                <button
                  onClick={() => setShowPerspectiveForm(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                >
                  Submit Your Perspective
                </button>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <textarea
                    value={perspectiveContent}
                    onChange={(e) => setPerspectiveContent(e.target.value)}
                    rows={6}
                    placeholder="Describe your perspective on this argument..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={handleSubmitPerspective}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                    <button
                      onClick={() => {
                        setShowPerspectiveForm(false);
                        setPerspectiveContent('');
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {hasUserSubmitted && !bothPerspectivesSubmitted && (
            <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-800 px-3 sm:px-4 py-2 sm:py-3 rounded text-xs sm:text-sm">
              ✓ Your perspective has been submitted. Waiting for your partner to submit theirs.
            </div>
          )}

          {/* Analyze Button */}
          {bothPerspectivesSubmitted && !aiInsights && (
            <div className="mt-4">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold text-sm sm:text-base"
              >
                {isAnalyzing ? 'Analyzing with AI...' : '✨ Get AI Mediation Insights'}
              </button>
            </div>
          )}

          {/* Safety Concern Display */}
          {safetyConcern && (
            <div className="mt-6">
              <CrisisResources showAcceptButton={false} />
              {safetyConcern.message && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">{safetyConcern.message}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Insights Section */}
        {aiInsights && (
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              🤖 AI Mediation Insights
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-3 sm:mb-4 text-xs sm:text-sm">
                {error}
              </div>
            )}

            {/* Summary */}
            {aiInsights.summary && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                <p className="text-gray-700">{aiInsights.summary}</p>
              </div>
            )}

            {/* Common Ground */}
            {aiInsights.common_ground && aiInsights.common_ground.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">✅ Common Ground</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {aiInsights.common_ground.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disagreements */}
            {aiInsights.disagreements && aiInsights.disagreements.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">⚡ Key Disagreements</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {aiInsights.disagreements.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Root Causes */}
            {aiInsights.root_causes && aiInsights.root_causes.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">🔍 Root Causes</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {aiInsights.root_causes.map((cause, idx) => (
                    <li key={idx}>{cause}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {aiInsights.suggestions && aiInsights.suggestions.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">💡 Suggested Solutions</h4>
                <div className="space-y-4">
                  {aiInsights.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">{suggestion.title}</h5>
                      <p className="text-gray-700 mb-2">{suggestion.description}</p>
                      {suggestion.actionable_steps && suggestion.actionable_steps.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                          {suggestion.actionable_steps.map((step, stepIdx) => (
                            <li key={stepIdx}>{step}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Communication Tips */}
            {aiInsights.communication_tips && aiInsights.communication_tips.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">💬 Communication Tips</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {aiInsights.communication_tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500 border-t border-gray-200 pt-4">
              <div className="flex items-start mb-2">
                <span className="text-yellow-600 mr-2">⚠️</span>
                <span className="text-gray-600">
                  <strong>AI-Generated Content:</strong> These insights are generated by AI and are advisory only. 
                  They may not be suitable for your specific situation. Always use your judgment and seek professional 
                  help when needed.
                </span>
              </div>
              <div className="mt-2 text-gray-500">
                Generated by {aiInsights.model_used} • {new Date(aiInsights.generated_at).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
