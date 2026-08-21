"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store';
import { useAuth } from '@/providers/AuthProvider';
import { jwtDecode } from 'jwt-decode';
import { getOfficerStatusByEmail } from '@/lib/api/officerStatusApi';
import keycloak from '@/lib/keycloak';

const POLL_INTERVAL_MS = 30_000; // 30 seconds

export default function RegistrationPendingPage() {
  const router = useRouter();
  const { initialized } = useAuth();
  const {
    isAuthenticated,
    user,
    officerRegistrationStatus,
    officerRegistrationId,
    setOfficerRegistration,
    clearOfficerRegistration,
    setAuth,
  } = useAuthStore();

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasRedirected = useRef(false);

  // Redirect if not authenticated or no pending registration
  useEffect(() => {
    if (initialized && (!isAuthenticated || officerRegistrationStatus !== 'PENDING')) {
      router.replace('/');
    }
  }, [initialized, isAuthenticated, officerRegistrationStatus, router]);

  // Poll the backend for status changes
  useEffect(() => {
    if (!initialized || !isAuthenticated || !user?.email || officerRegistrationStatus !== 'PENDING') return;

    const checkStatus = async () => {
      try {
        const result = await getOfficerStatusByEmail(user.email!);
        if (!result) return;

        if (result.status === 'APPROVED' && !hasRedirected.current) {
          hasRedirected.current = true;
          setOfficerRegistration('APPROVED', result.officerId);
          setToast({
            type: 'success',
            message: '🎉 Your registration has been approved! Redirecting to your dashboard...',
          });
          
          // Force a token refresh so the frontend receives the newly assigned Keycloak role
          try {
            await keycloak?.updateToken(-1);
            if (keycloak?.token) {
              const decoded: any = jwtDecode(keycloak.token);
              setAuth(
                keycloak.token,
                {
                  id: decoded.sub,
                  email: decoded.email,
                  name: decoded.name,
                  firstName: decoded.given_name,
                  lastName: decoded.family_name,
                  username: decoded.preferred_username,
                  roles: decoded.realm_access?.roles || [],
                },
                keycloak.refreshToken
              );
            }
          } catch (e) {
            console.warn('Failed to force token refresh', e);
          }

          // Give user time to read the toast
          setTimeout(() => {
            router.push('/officer-dashboard');
          }, 3000);
        } else if (result.status === 'REJECTED' && !hasRedirected.current) {
          hasRedirected.current = true;
          const reason = result.rejectionReason ? ` Reason: ${result.rejectionReason}` : '';
          setToast({
            type: 'error',
            message: `Your registration has been rejected by the CAO.${reason}`,
          });
          setTimeout(() => {
            clearOfficerRegistration();
            router.push('/');
          }, 5000);
        }
      } catch (err) {
        console.warn('Failed to poll officer status:', err);
      }
    };

    // Check immediately on mount
    checkStatus();

    // Then poll periodically
    pollRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [initialized, isAuthenticated, user?.email, officerRegistrationStatus, setOfficerRegistration, clearOfficerRegistration, router]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 8000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="te-pending-page">
      {/* Background decorative elements */}
      <div className="te-pending-page__bg-orb te-pending-page__bg-orb--1" />
      <div className="te-pending-page__bg-orb te-pending-page__bg-orb--2" />

      <div className="te-pending-page__card">
        {/* Animated clock icon */}
        <div className="te-pending-page__icon-wrapper">
          <div className="te-pending-page__icon-ring" />
          <Clock size={48} className="te-pending-page__icon" />
        </div>

        <h1 className="te-pending-page__title">Registration Under Review</h1>

        <p className="te-pending-page__description">
          Your officer registration has been submitted and is currently being reviewed by the
          <strong> Chief Accounting Officer (CAO)</strong>. You will be notified once a decision has been made.
        </p>

        {officerRegistrationId && (
          <div className="te-pending-page__ref">
            <span className="te-pending-page__ref-label">Reference ID</span>
            <span className="te-pending-page__ref-value">{officerRegistrationId}</span>
          </div>
        )}

        <div className="te-pending-page__timeline">
          <div className="te-pending-page__step te-pending-page__step--done">
            <CheckCircle2 size={20} />
            <span>Registration Submitted</span>
          </div>
          <div className="te-pending-page__step-line" />
          <div className="te-pending-page__step te-pending-page__step--active">
            <Clock size={20} />
            <span>Awaiting CAO Approval</span>
          </div>
          <div className="te-pending-page__step-line te-pending-page__step-line--pending" />
          <div className="te-pending-page__step te-pending-page__step--pending">
            <CheckCircle2 size={20} />
            <span>Access Granted</span>
          </div>
        </div>

        <p className="te-pending-page__note">
          This page automatically checks for updates. You can also return later — your status is saved.
        </p>

        <button
          onClick={() => router.push('/')}
          className="te-pending-page__back-btn"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`te-reg-toast te-reg-toast--${toast.type}`}>
          <div className="te-reg-toast__icon">
            {toast.type === 'success' ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
          </div>
          <p className="te-reg-toast__message">{toast.message}</p>
          <button
            className="te-reg-toast__close"
            onClick={() => setToast(null)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
