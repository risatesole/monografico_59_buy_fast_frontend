'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import ImageUploader from '@/components/ImageUploader';
import { uploadAvatar } from '@/actions/upload-actions';
import { updateProfile, changePassword, deleteAccount } from '@/actions/account-actions';
import type { UserDetails } from '@/services/user/getUserDetails';
import { getUserDetails } from '@/services/user/getUserDetails';
import { SectionLabel } from '@/components/account/SectionLabel';
import { FieldRow } from '@/components/account/FieldRow';
import { SaveButton } from '@/components/account/SaveButton';

export default function AccountPage() {
  const router = useRouter();

  // Profile state
  const [user, setUser] = useState<UserDetails | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [institutionMember, setInstitutionMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSavingProfile, startSaveProfile] = useTransition();
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, startSavePassword] = useTransition();
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Danger zone state
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        const userData = await getUserDetails();

        if (userData) {
          setUser(userData);
          setFirstName(userData.firstName ?? '');
          setLastName(userData.lastName ?? '');
          setEmail(userData.email ?? '');
          setProfilePicture(userData.profilePicture ?? '');
          setInstitutionMember(userData.institutionMember ?? false);
        } else {
          setError('User data not found');
        }
      } catch (err) {
        console.error('Failed to load user', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  function handleSaveProfile() {
    setProfileError(null);
    startSaveProfile(async () => {
      const result = await updateProfile({ first_name: firstName, last_name: lastName, email });

      if (!result.ok) {
        setProfileError(result.message);
        return;
      }

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    });
  }

  function handleSavePassword() {
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    startSavePassword(async () => {
      const result = await changePassword(currentPassword, newPassword);

      if (!result.ok) {
        setPasswordError(result.message);
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
    });
  }

  function handleDeleteAccount() {
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteAccount();

      if (!result.ok) {
        setDeleteError(result.message);
        return;
      }

      await fetch('/api/v1/signout/', { method: 'POST', credentials: 'include' });
      router.push('/signin');
    });
  }

  if (loading) {
    return <p style={{ fontSize: '0.875rem', color: '#43474f' }}>Cargando…</p>;
  }

  if (error || !user) {
    return (
      <p style={{ fontSize: '0.875rem', color: '#cc3b3b' }}>
        {error || 'No se pudo cargar la información del usuario'}
      </p>
    );
  }

  return (
    <div>
      {/* Profile Section */}
      <SectionLabel>Perfil</SectionLabel>
      <FieldRow label="Foto de perfil" hint="Se guarda automáticamente al subir una imagen.">
        <ImageUploader
          value={profilePicture}
          onChange={setProfilePicture}
          uploadFn={uploadAvatar}
        />
      </FieldRow>
      <FieldRow label="Nombre">
        <Input
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          placeholder="Nombre"
        />
      </FieldRow>
      <FieldRow label="Apellido">
        <Input
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          placeholder="Apellido"
        />
      </FieldRow>
      <FieldRow label="Correo Electrónico" hint="Dirección asociada a tu cuenta.">
        <Input
          value={email}
          onChange={e => setEmail(e.target.value)}
          type="email"
          placeholder="tu@correo.edu.do"
        />
      </FieldRow>
      <FieldRow label="Miembro UASD" hint="Solo el personal puede verificar y asignar este estado.">
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.7rem',
            borderRadius: 999,
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: institutionMember ? '#e6f4ea' : '#f2f4f6',
            color: institutionMember ? '#137333' : '#747781',
            border: `1px solid ${institutionMember ? '#ceead6' : '#e0e3e5'}`,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: institutionMember ? '#1e8e3e' : '#c4c6d1',
            }}
          />
          {institutionMember ? 'Miembro' : 'No Miembro'}
        </span>
      </FieldRow>
      {profileError && (
        <p style={{ fontSize: '0.75rem', color: '#cc3b3b', marginTop: '0.75rem' }}>
          {profileError}
        </p>
      )}
      <div style={{ paddingTop: '1.5rem' }}>
        <SaveButton onClick={handleSaveProfile} saved={profileSaved} />
        {isSavingProfile && (
          <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: '#747781' }}>
            Guardando…
          </span>
        )}
      </div>

      {/* Account Section - Password */}
      <div style={{ marginTop: '3rem' }}>
        <SectionLabel>Seguridad</SectionLabel>
        <FieldRow label="Contraseña actual">
          <Input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
        </FieldRow>
        <FieldRow label="Nueva contraseña" hint="Mínimo 8 caracteres.">
          <Input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
        </FieldRow>
        <FieldRow label="Confirmar nueva contraseña">
          <Input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </FieldRow>
        {passwordError && (
          <p style={{ fontSize: '0.75rem', color: '#cc3b3b', marginTop: '0.75rem' }}>
            {passwordError}
          </p>
        )}
        <div style={{ paddingTop: '1.5rem' }}>
          <SaveButton onClick={handleSavePassword} saved={passwordSaved} />
          {isSavingPassword && (
            <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: '#747781' }}>
              Guardando…
            </span>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div
        style={{
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid #e0e3e5',
        }}
      >
        <p
          style={{
            fontSize: '0.68rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#cc3b3b',
            marginBottom: '1rem',
          }}
        >
          Zona peligrosa
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            border: '1px solid oklch(0.922 0 0)',
            borderRadius: 4,
          }}
        >
          <div>
            <p
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                marginBottom: '0.25rem',
              }}
            >
              Eliminar cuenta
            </p>
            <p style={{ fontSize: '0.75rem', color: '#747781' }}>
              Eliminar permanentemente tu cuenta y todos los datos.
            </p>
          </div>
          {deleteConfirm ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setDeleteConfirm(false)}
                disabled={isDeleting}
                style={{
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.75rem',
                  border: '1px solid #e0e3e5',
                  borderRadius: 4,
                  background: 'white',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                style={{
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.75rem',
                  border: 'none',
                  borderRadius: 4,
                  background: '#cc3b3b',
                  color: 'white',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                  opacity: isDeleting ? 0.6 : 1,
                }}
              >
                {isDeleting ? 'Eliminando…' : 'Confirmar eliminación'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirm(true)}
              style={{
                padding: '0.4rem 0.9rem',
                fontSize: '0.75rem',
                border: '1px solid #e0e3e5',
                borderRadius: 4,
                background: 'white',
                color: '#cc3b3b',
                cursor: 'pointer',
                fontFamily: 'var(--font-geist-sans), sans-serif',
              }}
            >
              Eliminar
            </button>
          )}
        </div>
        {deleteError && (
          <p style={{ fontSize: '0.75rem', color: '#cc3b3b', marginTop: '0.75rem' }}>
            {deleteError}
          </p>
        )}
      </div>
    </div>
  );
}
